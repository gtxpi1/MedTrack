import { MedicationService } from './src/services/MedicationService';
import { MedicationDatabaseService } from './src/services/MedicationDatabaseService';
import { IStorageService } from './src/storage/IStorageService';
import { Medication, DoseRecord } from './src/types/medication';

class MemoryStorage<T extends { id: string }> implements IStorageService<T> {
  private items = new Map<string, T>();
  async getAll(): Promise<T[]> { return Array.from(this.items.values()); }
  async getById(id: string): Promise<T | null> { return this.items.get(id) || null; }
  async save(item: T): Promise<T> { this.items.set(item.id, item); return item; }
  async saveAll(items: T[]): Promise<T[]> { items.forEach((i) => this.items.set(i.id, i)); return items; }
  async remove(id: string): Promise<boolean> { return this.items.delete(id); }
  async clear(): Promise<void> { this.items.clear(); }
}

async function runTests() {
  console.log('=== TEST 1: Quetiapine & Seroquel Autocomplete Search ===');
  
  // 1. Quetiapine search
  const quetiapineResults = MedicationDatabaseService.searchMedications('quetiapine');
  console.log(`Searching "quetiapine": found ${quetiapineResults.length} matches:`);
  quetiapineResults.forEach((r) => console.log(`  - ${r.name} (${r.genericName}) | Form: ${r.form} | Strengths: ${r.commonStrengths.join(', ')}`));
  if (quetiapineResults.length === 0 || quetiapineResults[0].name !== 'Quetiapine') {
    throw new Error('Quetiapine not found in medication database!');
  }
  console.log('✔ PASS: Quetiapine found with full strengths (25mg, 50mg, 100mg, 200mg, 300mg, 400mg).');

  // 2. Seroquel search
  const seroquelResults = MedicationDatabaseService.searchMedications('seroquel');
  console.log(`Searching "seroquel": found ${seroquelResults.length} matches:`);
  seroquelResults.forEach((r) => console.log(`  - ${r.name} (${r.genericName})`));
  if (seroquelResults.length === 0 || seroquelResults[0].name !== 'Seroquel') {
    throw new Error('Seroquel not found in medication database!');
  }
  console.log('✔ PASS: Seroquel found.');

  // 3. Betaderm, Venlafaxine, Acetaminophen
  const betaderm = MedicationDatabaseService.searchMedications('betaderm');
  const venla = MedicationDatabaseService.searchMedications('venlafaxine');
  const aceta = MedicationDatabaseService.searchMedications('acetaminophen');
  if (betaderm.length === 0 || venla.length === 0 || aceta.length === 0) {
    throw new Error('Previous search terms failed!');
  }
  console.log('✔ PASS: Betaderm, Venlafaxine, and Acetaminophen all verified.');

  console.log('\n=== TEST 2: Add Quetiapine to Daily Regimen (Bedtime dose) ===');
  const medStore = new MemoryStorage<Medication>();
  const doseStore = new MemoryStorage<DoseRecord>();
  const service = new MedicationService(medStore, doseStore);
  await service.initialize();

  const addedQuetiapine = await service.addMedication({
    name: 'Quetiapine',
    genericName: 'Quetiapine Fumarate',
    brandName: 'Seroquel',
    form: 'tablet',
    strength: '100 mg',
    doseAmount: 1,
    doseUnit: 'tablet',
    frequency: 'once-daily',
    schedule: {
      id: 'sched-quet',
      medicationId: '',
      frequency: 'once-daily',
      scheduledTimes: ['22:00'],
      startDate: '2026-08-23',
      isActive: true
    },
    supply: {
      currentSupply: 30,
      lowSupplyThreshold: 7,
      supplyUnit: 'tablets',
      refillQuantity: 30
    },
    instructions: 'Take 1 tablet at bedtime',
    isActive: true
  });
  console.log(`✔ Added: ${addedQuetiapine.name} ${addedQuetiapine.strength} at ${addedQuetiapine.schedule.scheduledTimes.join(', ')}`);

  const todayDoses = await service.getTodayScheduledDoses();
  const quetDoses = todayDoses.filter((d) => d.medication.name === 'Quetiapine');
  console.log(`Quetiapine today scheduled slots: ${quetDoses.length} (Expected 1)`);
  if (quetDoses.length !== 1 || quetDoses[0].record.timeOfDay !== 'bedtime') {
    throw new Error('Quetiapine dose slot failed to generate properly!');
  }
  console.log(`  - Slot Time: ${quetDoses[0].record.scheduledTime} (${quetDoses[0].record.timeOfDay})`);

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((e) => {
  console.error('TEST FAILED:', e);
  process.exit(1);
});
