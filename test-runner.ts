import { MedicationService } from './src/services/MedicationService';
import { MedicationDatabaseService } from './src/services/MedicationDatabaseService';
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
  console.log('=== TEST 1: Autocomplete Directory Lookup for User Query Medications ===');
  
  // 1. Betaderm lookup
  const betadermResults = MedicationDatabaseService.searchMedications('betaderm');
  console.log(`Searching "betaderm": found ${betadermResults.length} matches:`);
  betadermResults.forEach((r) => console.log(`  - ${r.name} (${r.genericName}) | Form: ${r.form} | Strengths: ${r.commonStrengths.join(', ')}`));
  if (betadermResults.length === 0 || betadermResults[0].name !== 'Betaderm') {
    throw new Error('Betaderm not found in medication directory!');
  }
  console.log('✔ PASS: Betaderm correctly resolved in database.');

  // 2. Venlafaxine lookup
  const venlafaxineResults = MedicationDatabaseService.searchMedications('venlafaxine');
  console.log(`Searching "venlafaxine": found ${venlafaxineResults.length} matches:`);
  venlafaxineResults.forEach((r) => console.log(`  - ${r.name} (${r.genericName}) | Form: ${r.form} | Strengths: ${r.commonStrengths.join(', ')}`));
  if (venlafaxineResults.length === 0 || venlafaxineResults[0].name !== 'Venlafaxine') {
    throw new Error('Venlafaxine not found in medication directory!');
  }
  console.log('✔ PASS: Venlafaxine correctly resolved in database.');

  // 3. Acetaminophen lookup
  const acetaminophenResults = MedicationDatabaseService.searchMedications('acetaminophen');
  console.log(`Searching "acetaminophen": found ${acetaminophenResults.length} matches:`);
  acetaminophenResults.forEach((r) => console.log(`  - ${r.name} (${r.genericName}) | Form: ${r.form} | Strengths: ${r.commonStrengths.join(', ')}`));
  if (acetaminophenResults.length === 0 || acetaminophenResults[0].name !== 'Acetaminophen') {
    throw new Error('Acetaminophen not found in medication directory!');
  }
  console.log('✔ PASS: Acetaminophen correctly resolved in database.');

  console.log('\n=== TEST 2: Adding Betaderm, Venlafaxine & Acetaminophen to Tracker ===');
  const medStore = new MemoryStorage<Medication>();
  const doseStore = new MemoryStorage<DoseRecord>();
  const service = new MedicationService(medStore, doseStore);
  await service.initialize();

  // Add Betaderm (Topical cream, twice daily)
  const betaderm = await service.addMedication({
    name: 'Betaderm',
    genericName: 'Betamethasone Valerate',
    form: 'topical',
    strength: '0.1%',
    doseAmount: 1,
    doseUnit: 'application',
    frequency: 'twice-daily',
    schedule: {
      id: 'sched-betaderm',
      medicationId: '',
      frequency: 'twice-daily',
      scheduledTimes: ['08:00', '20:00'],
      startDate: '2026-08-23',
      isActive: true
    },
    supply: {
      currentSupply: 60,
      lowSupplyThreshold: 10,
      supplyUnit: 'applications',
      refillQuantity: 60
    },
    instructions: 'Apply thin layer to affected skin twice daily',
    isActive: true
  });
  console.log(`✔ Added ${betaderm.name} (id: ${betaderm.id})`);

  // Add Venlafaxine (Capsule, once daily in morning)
  const venlafaxine = await service.addMedication({
    name: 'Venlafaxine',
    genericName: 'Venlafaxine HCl',
    brandName: 'Effexor XR',
    form: 'capsule',
    strength: '75 mg',
    doseAmount: 1,
    doseUnit: 'capsule',
    frequency: 'once-daily',
    schedule: {
      id: 'sched-venla',
      medicationId: '',
      frequency: 'once-daily',
      scheduledTimes: ['08:00'],
      startDate: '2026-08-23',
      isActive: true
    },
    supply: {
      currentSupply: 30,
      lowSupplyThreshold: 7,
      supplyUnit: 'capsules',
      refillQuantity: 30
    },
    instructions: 'Take in the morning with food',
    isActive: true
  });
  console.log(`✔ Added ${venlafaxine.name} (id: ${venlafaxine.id})`);

  // Add Acetaminophen (Tablet, As-Needed)
  const acetaminophen = await service.addMedication({
    name: 'Acetaminophen',
    genericName: 'Acetaminophen',
    brandName: 'Tylenol',
    form: 'tablet',
    strength: '500 mg',
    doseAmount: 1,
    doseUnit: 'tablet',
    frequency: 'as-needed',
    schedule: {
      id: 'sched-aceta',
      medicationId: '',
      frequency: 'as-needed',
      scheduledTimes: [],
      startDate: '2026-08-23',
      isActive: true
    },
    supply: {
      currentSupply: 100,
      lowSupplyThreshold: 15,
      supplyUnit: 'tablets',
      refillQuantity: 100
    },
    instructions: 'Take 1-2 tablets every 4-6 hours as needed for headache or fever',
    isActive: true
  });
  console.log(`✔ Added ${acetaminophen.name} (id: ${acetaminophen.id})`);

  console.log('\n=== TEST 3: Verifying Today Dashboard Schedule & As-Needed List ===');
  const todayDoses = await service.getTodayScheduledDoses();
  const prnMeds = await service.getAsNeededMedications();

  console.log(`Total scheduled doses for today: ${todayDoses.length}`);
  const betadermDoses = todayDoses.filter((d) => d.medication.name === 'Betaderm');
  const venlaDoses = todayDoses.filter((d) => d.medication.name === 'Venlafaxine');
  console.log(`  - Betaderm scheduled today: ${betadermDoses.length} doses (Expected 2: Morning & Evening)`);
  console.log(`  - Venlafaxine scheduled today: ${venlaDoses.length} doses (Expected 1: Morning)`);
  if (betadermDoses.length !== 2) throw new Error('Betaderm doses missing from today schedule');
  if (venlaDoses.length !== 1) throw new Error('Venlafaxine dose missing from today schedule');

  console.log(`Total As-Needed medications: ${prnMeds.length}`);
  const foundAcetaPrn = prnMeds.find((m) => m.name === 'Acetaminophen');
  if (!foundAcetaPrn) throw new Error('Acetaminophen missing from As-Needed list');
  console.log(`  - Acetaminophen on As-Needed shelf: ${foundAcetaPrn.name} (${foundAcetaPrn.strength})`);

  console.log('\n=== ALL USER SCENARIO TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((e) => {
  console.error('TEST FAILED:', e);
  process.exit(1);
});
