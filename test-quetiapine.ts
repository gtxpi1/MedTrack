import { MedicationDatabaseService } from './src/services/MedicationDatabaseService';

console.log('Testing "quetiapine" search:');
const results = MedicationDatabaseService.searchMedications('quetiapine');
results.forEach((r) => {
  console.log(`- ${r.name} | Category: ${r.category} | Strengths: ${r.commonStrengths.join(', ')}`);
});
