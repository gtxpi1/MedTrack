import { Medication, DoseRecord, ScheduledDoseItem, TimeOfDay } from '../types/medication';
import { IStorageService } from '../storage/IStorageService';
import { LocalStorageService } from '../storage/LocalStorageService';
import { INITIAL_SAMPLE_MEDICATIONS } from '../sampleData/medications';
import { getIsoDateString, getTimeOfDayFromTimeStr } from '../utils/dateUtils';
import { calculateDaysRemaining, isLowSupply } from '../utils/supplyUtils';

export class MedicationService {
  private medStorage: IStorageService<Medication>;
  private doseStorage: IStorageService<DoseRecord>;

  constructor(
    medStorage?: IStorageService<Medication>,
    doseStorage?: IStorageService<DoseRecord>
  ) {
    this.medStorage = medStorage || new LocalStorageService<Medication>('medications');
    this.doseStorage = doseStorage || new LocalStorageService<DoseRecord>('dose_records');
  }

  /**
   * Initialize data store with sample data if empty
   */
  async initialize(): Promise<void> {
    const existing = await this.medStorage.getAll();
    if (existing.length === 0) {
      await this.medStorage.saveAll(INITIAL_SAMPLE_MEDICATIONS);
    }
  }

  /**
   * Reset store to initial sample data
   */
  async resetToSampleData(): Promise<void> {
    await this.medStorage.clear();
    await this.doseStorage.clear();
    await this.medStorage.saveAll(INITIAL_SAMPLE_MEDICATIONS);
  }

  /**
   * Fetch all active medications
   */
  async getMedications(activeOnly: boolean = false): Promise<Medication[]> {
    const meds = await this.medStorage.getAll();
    if (activeOnly) {
      return meds.filter((m) => m.isActive);
    }
    return meds;
  }

  /**
   * Get single medication by ID
   */
  async getMedicationById(id: string): Promise<Medication | null> {
    return this.medStorage.getById(id);
  }

  /**
   * Add a new medication
   */
  async addMedication(data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication> {
    const now = new Date().toISOString();
    const id = `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const schedId = data.schedule?.id || `sched-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const todayStr = getIsoDateString();

    // Ensure scheduledTimes has appropriate defaults if not set
    let times = [...(data.schedule?.scheduledTimes || [])];
    if (times.length === 0 && data.frequency !== 'as-needed') {
      if (data.frequency === 'twice-daily') times = ['08:00', '20:00'];
      else if (data.frequency === 'three-times-daily') times = ['08:00', '13:00', '20:00'];
      else if (data.frequency === 'four-times-daily') times = ['08:00', '12:00', '16:00', '20:00'];
      else times = ['08:00'];
    }

    const newMed: Medication = {
      ...data,
      id,
      schedule: {
        ...data.schedule,
        id: schedId,
        medicationId: id,
        frequency: data.frequency,
        scheduledTimes: times,
        startDate: data.schedule?.startDate || todayStr,
        isActive: true
      },
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    await this.medStorage.save(newMed);

    // If regular scheduled medication, generate today's dose slots immediately
    if (newMed.frequency !== 'as-needed' && times.length > 0) {
      const allDoses = await this.doseStorage.getAll();
      const newDoses: DoseRecord[] = [];

      for (const timeStr of times) {
        if (!timeStr) continue;
        const timeClean = timeStr.trim();
        const scheduledTimeIso = `${todayStr}T${timeClean.length === 5 ? timeClean + ':00' : timeClean}`;
        const timeKey = `${id}_${scheduledTimeIso}`;

        const exists = allDoses.some((d) => `${d.medicationId}_${d.scheduledTime}` === timeKey);
        if (!exists) {
          const timeOfDay: TimeOfDay = getTimeOfDayFromTimeStr(timeClean);
          newDoses.push({
            id: `dose-${todayStr}-${id}-${timeClean.replace(/[^0-9]/g, '')}`,
            medicationId: id,
            scheduleId: schedId,
            scheduledTime: scheduledTimeIso,
            timeOfDay,
            status: 'scheduled',
            doseAmount: newMed.doseAmount,
            doseUnit: newMed.doseUnit,
            createdAt: now,
            updatedAt: now
          });
        }
      }

      if (newDoses.length > 0) {
        await this.doseStorage.saveAll([...allDoses, ...newDoses]);
      }
    }

    return newMed;
  }

  /**
   * Get all active as-needed (PRN) medications
   */
  async getAsNeededMedications(): Promise<Medication[]> {
    const meds = await this.getMedications(true);
    return meds.filter((m) => m.frequency === 'as-needed');
  }

  /**
   * Update existing medication
   */
  async updateMedication(med: Medication): Promise<Medication> {
    const updated: Medication = {
      ...med,
      updatedAt: new Date().toISOString()
    };
    await this.medStorage.save(updated);
    return updated;
  }

  /**
   * Delete medication and remove from active tracking
   */
  async deleteMedication(id: string): Promise<boolean> {
    return this.medStorage.remove(id);
  }

  /**
   * Update supply level directly
   */
  async updateSupply(medicationId: string, currentSupply: number): Promise<Medication | null> {
    const med = await this.getMedicationById(medicationId);
    if (!med) return null;

    med.supply.currentSupply = Math.max(0, currentSupply);
    med.updatedAt = new Date().toISOString();
    await this.medStorage.save(med);
    return med;
  }

  /**
   * Log a refill addition
   */
  async refillMedication(medicationId: string, addedAmount?: number): Promise<Medication | null> {
    const med = await this.getMedicationById(medicationId);
    if (!med) return null;

    const amountToAdd = addedAmount !== undefined ? addedAmount : (med.supply.refillQuantity || 30);
    med.supply.currentSupply += amountToAdd;
    med.supply.lastRefillDate = getIsoDateString();
    med.updatedAt = new Date().toISOString();

    await this.medStorage.save(med);
    return med;
  }

  /**
   * Get or generate today's scheduled doses
   */
  async getTodayScheduledDoses(date: Date = new Date()): Promise<ScheduledDoseItem[]> {
    const todayStr = getIsoDateString(date);
    const medications = await this.getMedications(true);
    const allDoses = await this.doseStorage.getAll();

    // Doses recorded for today
    const todayRecords = allDoses.filter((d) => d.scheduledTime.startsWith(todayStr));
    const recordMap = new Map<string, DoseRecord>();
    todayRecords.forEach((r) => {
      // Key: medicationId + time
      const timeKey = `${r.medicationId}_${r.scheduledTime}`;
      recordMap.set(timeKey, r);
    });

    const scheduledItems: ScheduledDoseItem[] = [];
    const newRecordsToSave: DoseRecord[] = [];

    const now = new Date();

    for (const med of medications) {
      if (med.frequency === 'as-needed') {
        // PRN medications do not produce mandatory daily schedule slots,
        // but existing logged PRN doses today will be shown.
        const prnDosesToday = todayRecords.filter((r) => r.medicationId === med.id);
        prnDosesToday.forEach((prnRecord) => {
          scheduledItems.push({
            record: prnRecord,
            medication: med,
            isOverdue: false,
            daysRemaining: calculateDaysRemaining(med),
            isLowSupply: isLowSupply(med)
          });
        });
        continue;
      }

      for (const timeStr of med.schedule.scheduledTimes) {
        const scheduledTimeIso = `${todayStr}T${timeStr}:00`;
        const timeKey = `${med.id}_${scheduledTimeIso}`;

        let record = recordMap.get(timeKey);

        if (!record) {
          // Generate new scheduled dose record for today
          const timeOfDay: TimeOfDay = getTimeOfDayFromTimeStr(timeStr);

          record = {
            id: `dose-${todayStr}-${med.id}-${timeStr.replace(':', '')}`,
            medicationId: med.id,
            scheduleId: med.schedule.id,
            scheduledTime: scheduledTimeIso,
            timeOfDay,
            status: 'scheduled',
            doseAmount: med.doseAmount,
            doseUnit: med.doseUnit,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          newRecordsToSave.push(record);
        }

        // Calculate if overdue (if still 'scheduled' and scheduled time was earlier than now)
        const scheduledDateTime = new Date(`${todayStr}T${timeStr}:00`);
        const isOverdue = record.status === 'scheduled' && scheduledDateTime.getTime() + (30 * 60 * 1000) < now.getTime();

        scheduledItems.push({
          record,
          medication: med,
          isOverdue,
          daysRemaining: calculateDaysRemaining(med),
          isLowSupply: isLowSupply(med)
        });
      }
    }

    if (newRecordsToSave.length > 0) {
      await this.doseStorage.saveAll([...allDoses, ...newRecordsToSave]);
    }

    // Sort chronologically by scheduled time
    scheduledItems.sort((a, b) => a.record.scheduledTime.localeCompare(b.record.scheduledTime));

    return scheduledItems;
  }

  /**
   * Record action on a dose (Take, Skip, Undo)
   */
  async recordDoseStatus(
    doseId: string,
    newStatus: 'taken' | 'skipped' | 'scheduled',
    notes?: string
  ): Promise<{ updatedDose: DoseRecord; updatedMedication?: Medication }> {
    const allDoses = await this.doseStorage.getAll();
    const doseIndex = allDoses.findIndex((d) => d.id === doseId);

    if (doseIndex < 0) {
      throw new Error(`Dose record with ID "${doseId}" not found`);
    }

    const currentDose = allDoses[doseIndex];
    const previousStatus = currentDose.status;
    const med = await this.getMedicationById(currentDose.medicationId);

    const now = new Date().toISOString();
    currentDose.status = newStatus;
    currentDose.updatedAt = now;
    if (newStatus === 'taken') {
      currentDose.takenTime = now;
    } else if (newStatus === 'scheduled') {
      currentDose.takenTime = undefined;
    }
    if (notes !== undefined) {
      currentDose.notes = notes;
    }

    allDoses[doseIndex] = currentDose;
    await this.doseStorage.saveAll(allDoses);

    // Update supply inventory if status changed
    let updatedMed: Medication | undefined;
    if (med) {
      if (previousStatus !== 'taken' && newStatus === 'taken') {
        // Decrement supply
        med.supply.currentSupply = Math.max(0, med.supply.currentSupply - currentDose.doseAmount);
        med.updatedAt = now;
        await this.medStorage.save(med);
        updatedMed = med;
      } else if (previousStatus === 'taken' && newStatus !== 'taken') {
        // Undo: restore supply
        med.supply.currentSupply += currentDose.doseAmount;
        med.updatedAt = now;
        await this.medStorage.save(med);
        updatedMed = med;
      }
    }

    return { updatedDose: currentDose, updatedMedication: updatedMed };
  }

  /**
   * Log an as-needed (PRN) dose
   */
  async logPrnDose(medicationId: string, notes?: string): Promise<DoseRecord> {
    const med = await this.getMedicationById(medicationId);
    if (!med) throw new Error('Medication not found');

    const now = new Date();
    const nowIso = now.toISOString();
    const todayStr = getIsoDateString(now);
    const time24 = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord: DoseRecord = {
      id: `dose-prn-${Date.now()}`,
      medicationId: med.id,
      scheduleId: med.schedule.id,
      scheduledTime: `${todayStr}T${time24}:00`,
      timeOfDay: getTimeOfDayFromTimeStr(time24),
      status: 'taken',
      doseAmount: med.doseAmount,
      doseUnit: med.doseUnit,
      takenTime: nowIso,
      notes: notes || 'Taken as needed',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const allDoses = await this.doseStorage.getAll();
    allDoses.push(newRecord);
    await this.doseStorage.saveAll(allDoses);

    // Decrement supply
    med.supply.currentSupply = Math.max(0, med.supply.currentSupply - med.doseAmount);
    med.updatedAt = nowIso;
    await this.medStorage.save(med);

    return newRecord;
  }

  /**
   * Get low-supply medications list
   */
  async getLowSupplyMedications(): Promise<Medication[]> {
    const meds = await this.getMedications(true);
    return meds.filter((m) => isLowSupply(m));
  }

  /**
   * Get historical dose logs
   */
  async getDoseHistory(limit: number = 50): Promise<Array<DoseRecord & { medication?: Medication }>> {
    const doses = await this.doseStorage.getAll();
    const meds = await this.getMedications(false);
    const medMap = new Map(meds.map((m) => [m.id, m]));

    // Filter to taken, skipped, or past scheduled doses
    return doses
      .sort((a, b) => b.scheduledTime.localeCompare(a.scheduledTime))
      .slice(0, limit)
      .map((d) => ({
        ...d,
        medication: medMap.get(d.medicationId)
      }));
  }
}

export const defaultMedicationService = new MedicationService();
