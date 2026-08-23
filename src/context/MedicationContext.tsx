import React, { createContext, useEffect, useState, useCallback } from 'react';
import { Medication, ScheduledDoseItem, DoseRecord } from '../types/medication';
import { MedicationService, defaultMedicationService } from '../services/MedicationService';

export interface AdherenceStats {
  totalScheduled: number;
  takenCount: number;
  pendingCount: number;
  adherencePercentage: number;
}

export interface MedicationContextValue {
  medications: Medication[];
  todayDoses: ScheduledDoseItem[];
  asNeededMedications: Medication[];
  lowSupplyMedications: Medication[];
  historyRecords: Array<DoseRecord & { medication?: Medication }>;
  isLoading: boolean;
  stats: AdherenceStats;
  
  // Actions
  takeDose: (doseId: string) => Promise<void>;
  skipDose: (doseId: string, reason?: string) => Promise<void>;
  undoDose: (doseId: string) => Promise<void>;
  logPrnDose: (medicationId: string, notes?: string) => Promise<void>;
  addMedication: (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Medication>;
  updateMedication: (med: Medication) => Promise<Medication>;
  deleteMedication: (id: string) => Promise<boolean>;
  updateSupply: (medicationId: string, count: number) => Promise<void>;
  refillMedication: (medicationId: string, amount?: number) => Promise<void>;
  resetSampleData: () => Promise<void>;
  refresh: () => Promise<void>;
}

const MedicationContext = createContext<MedicationContextValue | undefined>(undefined);

interface MedicationProviderProps {
  children: React.ReactNode;
  service?: MedicationService;
}

export const MedicationProvider: React.FC<MedicationProviderProps> = ({
  children,
  service = defaultMedicationService
}) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayDoses, setTodayDoses] = useState<ScheduledDoseItem[]>([]);
  const [asNeededMedications, setAsNeededMedications] = useState<Medication[]>([]);
  const [lowSupplyMedications, setLowSupplyMedications] = useState<Medication[]>([]);
  const [historyRecords, setHistoryRecords] = useState<Array<DoseRecord & { medication?: Medication }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    try {
      await service.initialize();
      const [allMeds, doses, prnMeds, lowSupply, history] = await Promise.all([
        service.getMedications(false),
        service.getTodayScheduledDoses(),
        service.getAsNeededMedications(),
        service.getLowSupplyMedications(),
        service.getDoseHistory(50)
      ]);

      setMedications(allMeds);
      setTodayDoses(doses);
      setAsNeededMedications(prnMeds);
      setLowSupplyMedications(lowSupply);
      setHistoryRecords(history);
    } catch (err) {
      console.error('[MedicationContext] Failed to load medication state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const takeDose = async (doseId: string) => {
    await service.recordDoseStatus(doseId, 'taken');
    await refresh();
  };

  const skipDose = async (doseId: string, reason?: string) => {
    await service.recordDoseStatus(doseId, 'skipped', reason || 'Skipped by user');
    await refresh();
  };

  const undoDose = async (doseId: string) => {
    await service.recordDoseStatus(doseId, 'scheduled');
    await refresh();
  };

  const logPrnDose = async (medicationId: string, notes?: string) => {
    await service.logPrnDose(medicationId, notes);
    await refresh();
  };

  const addMedication = async (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMed = await service.addMedication(data);
    await refresh();
    return newMed;
  };

  const updateMedication = async (med: Medication) => {
    const updated = await service.updateMedication(med);
    await refresh();
    return updated;
  };

  const deleteMedication = async (id: string) => {
    const result = await service.deleteMedication(id);
    await refresh();
    return result;
  };

  const updateSupply = async (medicationId: string, count: number) => {
    await service.updateSupply(medicationId, count);
    await refresh();
  };

  const refillMedication = async (medicationId: string, amount?: number) => {
    await service.refillMedication(medicationId, amount);
    await refresh();
  };

  const resetSampleData = async () => {
    setIsLoading(true);
    await service.resetToSampleData();
    await refresh();
  };

  // Compute adherence stats
  const totalScheduled = todayDoses.length;
  const takenCount = todayDoses.filter((d) => d.record.status === 'taken').length;
  const pendingCount = todayDoses.filter((d) => d.record.status === 'scheduled').length;
  const adherencePercentage = totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 0;

  const stats: AdherenceStats = {
    totalScheduled,
    takenCount,
    pendingCount,
    adherencePercentage
  };

  return (
    <MedicationContext.Provider
      value={{
        medications,
        todayDoses,
        asNeededMedications,
        lowSupplyMedications,
        historyRecords,
        isLoading,
        stats,
        takeDose,
        skipDose,
        undoDose,
        logPrnDose,
        addMedication,
        updateMedication,
        deleteMedication,
        updateSupply,
        refillMedication,
        resetSampleData,
        refresh
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
};

export { MedicationContext };
