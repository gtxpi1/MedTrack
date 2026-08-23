import { MedicationService } from './src/services/MedicationService';
import { MedicationDatabaseService } from './src/services/MedicationDatabaseService';
import { InteractionService } from './src/services/InteractionService';
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
  console.log('=== TEST 1: Quetiapine Formulations Autocomplete Search ===');
  
  // 1. Quetiapine search
  const quetiapineResults = MedicationDatabaseService.searchMedications('quetiapine');
  console.log(`Searching "quetiapine": found ${quetiapineResults.length} matches:`);
  quetiapineResults.forEach((r) => console.log(`  - ${r.name} (${r.genericName}) | Form: ${r.form} | Strengths: ${r.commonStrengths.join(', ')}`));
  const hasQuetXR = quetiapineResults.some((r) => r.name.includes('XR') && r.commonStrengths.includes('150 mg'));
  const hasQuetXL = quetiapineResults.some((r) => r.name.includes('XL') && r.commonStrengths.includes('150 mg'));
  if (!hasQuetXR || !hasQuetXL) {
    throw new Error('Quetiapine XR / XL formulations missing!');
  }
  console.log('✔ PASS: Quetiapine XR & XL found with 150 mg presets.');

  console.log('\n=== TEST 2: Clinical Details & Food Restrictions Lookup ===');
  const quetInfo = InteractionService.getClinicalInfo('Quetiapine XR');
  console.log(`Quetiapine Class: ${quetInfo?.drugClass}`);
  console.log('Food/Drink to Avoid:');
  quetInfo?.foodAndDrinkToAvoid.forEach((f) => console.log(`  ${f}`));
  if (!quetInfo || quetInfo.foodAndDrinkToAvoid.length === 0) {
    throw new Error('Clinical info for Quetiapine failed!');
  }
  console.log('✔ PASS: Quetiapine food & beverage warnings loaded.');

  console.log('\n=== TEST 3: Cabinet Multi-Drug Interaction Analysis ===');
  const medStore = new MemoryStorage<Medication>();
  const doseStore = new MemoryStorage<DoseRecord>();
  const service = new MedicationService(medStore, doseStore);
  await service.initialize();

  // Add Quetiapine and Venlafaxine
  await service.addMedication({
    name: 'Quetiapine XR',
    genericName: 'Quetiapine Fumarate Extended-Release',
    brandName: 'Seroquel XR',
    form: 'tablet',
    strength: '150 mg',
    doseAmount: 1,
    doseUnit: 'tablet',
    frequency: 'once-daily',
    schedule: { id: 's1', medicationId: '', frequency: 'once-daily', scheduledTimes: ['22:00'], startDate: '2026-08-23', isActive: true },
    supply: { currentSupply: 30, lowSupplyThreshold: 7, supplyUnit: 'tablets', refillQuantity: 30 },
    isActive: true
  });

  await service.addMedication({
    name: 'Venlafaxine',
    genericName: 'Venlafaxine HCl',
    form: 'capsule',
    strength: '75 mg',
    doseAmount: 1,
    doseUnit: 'capsule',
    frequency: 'once-daily',
    schedule: { id: 's2', medicationId: '', frequency: 'once-daily', scheduledTimes: ['08:00'], startDate: '2026-08-23', isActive: true },
    supply: { currentSupply: 30, lowSupplyThreshold: 7, supplyUnit: 'capsules', refillQuantity: 30 },
    isActive: true
  });

  const allMeds = await service.getMedications();
  const interactions = InteractionService.analyzeCabinetInteractions(allMeds);
  console.log(`Analyzed cabinet: identified ${interactions.length} notices:`);
  interactions.forEach((i) => {
    console.log(`  - [${i.severity.toUpperCase()}] ${i.title}`);
  });

  const foundCombination = interactions.find((i) => i.id === 'int-quet-venla');
  const foundGrapefruit = interactions.find((i) => i.id === 'food-quet-grapefruit');
  if (!foundCombination || !foundGrapefruit) {
    throw new Error('Interaction engine failed to detect combination or grapefruit warning!');
  }
  console.log('✔ PASS: Interaction engine correctly identified Quetiapine + Venlafaxine & Grapefruit notices.');

  console.log('\n=== ALL CLINICAL & SAFETY TESTS PASSED! ===');
}

runTests().catch((e) => {
  console.error('TEST FAILED:', e);
  process.exit(1);
});
