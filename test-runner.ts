import { MedicationService } from './src/services/MedicationService';
import { IStorageService } from './src/storage/IStorageService';
import { Medication, DoseRecord } from './src/types/medication';

// In-Memory Storage implementation for fast headless testing
class MemoryStorage<T extends { id: string }> implements IStorageService<T> {
  private items = new Map<string, T>();

  async getAll(): Promise<T[]> {
    return Array.from(this.items.values());
  }
  async getById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }
  async save(item: T): Promise<T> {
    this.items.set(item.id, item);
    return item;
  }
  async saveAll(items: T[]): Promise<T[]> {
    items.forEach((i) => this.items.set(i.id, i));
    return items;
  }
  async remove(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
  async clear(): Promise<void> {
    this.items.clear();
  }
}

async function runTests() {
  console.log('=== TEST 1: Service Initialization ===');
  const medStore = new MemoryStorage<Medication>();
  const doseStore = new MemoryStorage<DoseRecord>();
  const service = new MedicationService(medStore, doseStore);

  await service.initialize();
  const initialMeds = await service.getMedications();
  console.log(`Initial sample medications loaded: ${initialMeds.length}`);
  if (initialMeds.length !== 5) throw new Error(`Expected 5 sample meds, got ${initialMeds.length}`);

  console.log('\n=== TEST 2: Add Scheduled Medication (Amoxicillin 500mg, 3x daily) ===');
  const newMed1 = await service.addMedication({
    name: 'Amoxicillin',
    genericName: 'Amoxicillin Trihydrate',
    form: 'capsule',
    strength: '500 mg',
    doseAmount: 1,
    doseUnit: 'capsule',
    frequency: 'three-times-daily',
    schedule: {
      id: 'sched-amox',
      medicationId: '',
      frequency: 'three-times-daily',
      scheduledTimes: ['08:00', '14:00', '20:00'],
      startDate: '2026-08-23',
      isActive: true
    },
    supply: {
      currentSupply: 21,
      lowSupplyThreshold: 6,
      supplyUnit: 'capsules',
      refillQuantity: 30
    },
    instructions: 'Take with food',
    isActive: true
  });
  console.log(`Added med: ${newMed1.name} (id: ${newMed1.id})`);

  const allMedsAfterAdd = await service.getMedications();
  console.log(`Total medications in list: ${allMedsAfterAdd.length}`);
  const found = allMedsAfterAdd.find((m) => m.name === 'Amoxicillin');
  if (!found) throw new Error('Amoxicillin not found in medications list!');
  console.log('PASS: Medication appears in medications catalog.');

  console.log('\n=== TEST 3: Check Today Scheduled Doses ===');
  const todayDoses = await service.getTodayScheduledDoses();
  console.log(`Total today scheduled dose slots: ${todayDoses.length}`);
  const amoxDoses = todayDoses.filter((d) => d.medication.name === 'Amoxicillin');
  console.log(`Amoxicillin today dose slots: ${amoxDoses.length} (Expected 3)`);
  amoxDoses.forEach((d) => {
    console.log(`  - Slot: ${d.record.scheduledTime} (${d.record.timeOfDay}) | Status: ${d.record.status}`);
  });
  if (amoxDoses.length !== 3) throw new Error(`Expected 3 Amoxicillin doses, got ${amoxDoses.length}`);
  console.log('PASS: All 3 Amoxicillin daily doses generated on today schedule.');

  console.log('\n=== TEST 4: Add As-Needed (PRN) Medication (Ibuprofen 200mg) ===');
  const prnMed = await service.addMedication({
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    form: 'tablet',
    strength: '200 mg',
    doseAmount: 1,
    doseUnit: 'tablet',
    frequency: 'as-needed',
    schedule: {
      id: 'sched-ibu',
      medicationId: '',
      frequency: 'as-needed',
      scheduledTimes: [],
      startDate: '2026-08-23',
      isActive: true
    },
    supply: {
      currentSupply: 50,
      lowSupplyThreshold: 10,
      supplyUnit: 'tablets',
      refillQuantity: 100
    },
    instructions: 'Take 1 tablet every 6 hours as needed for headache',
    isActive: true
  });
  console.log(`Added PRN med: ${prnMed.name} (id: ${prnMed.id})`);

  const prnList = await service.getAsNeededMedications();
  console.log(`PRN medications count: ${prnList.length}`);
  const foundPrn = prnList.find((m) => m.name === 'Ibuprofen');
  if (!foundPrn) throw new Error('Ibuprofen not found in PRN list!');
  console.log('PASS: Ibuprofen appears in PRN list.');

  console.log('\n=== TEST 5: Log PRN Dose ===');
  const loggedPrn = await service.logPrnDose(prnMed.id, 'Headache relief');
  console.log(`Logged PRN dose: ${loggedPrn.id} at ${loggedPrn.scheduledTime}`);
  const updatedIbu = await service.getMedicationById(prnMed.id);
  console.log(`Ibuprofen supply after taking 1 dose: ${updatedIbu?.supply.currentSupply} (Expected 49)`);
  if (updatedIbu?.supply.currentSupply !== 49) throw new Error('Supply did not decrement!');

  console.log('\n=== TEST 6: Take Scheduled Dose ===');
  const doseToTake = amoxDoses[0];
  console.log(`Taking dose: ${doseToTake.record.id}`);
  await service.recordDoseStatus(doseToTake.record.id, 'taken');
  const updatedAmox = await service.getMedicationById(newMed1.id);
  console.log(`Amoxicillin supply after taking 1 dose: ${updatedAmox?.supply.currentSupply} (Expected 20)`);
  if (updatedAmox?.supply.currentSupply !== 20) throw new Error('Supply did not decrement on take!');

  console.log('\n=== ALL AUTOMATED TESTS PASSED! ===');
}

runTests().catch((e) => {
  console.error('TEST FAILED:', e);
  process.exit(1);
});
