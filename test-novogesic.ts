import { MedicationDatabaseService } from './src/services/MedicationDatabaseService';
import { InteractionService } from './src/services/InteractionService';

console.log('=== TEST: Novo-Gesic Forte Autocomplete & Clinical Info ===');
const searchResults = MedicationDatabaseService.searchMedications('novo-gesic');
console.log(`Searching "novo-gesic": found ${searchResults.length} matches:`);
searchResults.forEach((r) => {
  console.log(`- ${r.name} (${r.genericName}) | Form: ${r.form} | Strengths: ${r.commonStrengths.join(', ')}`);
});

const foundForte = searchResults.find((r) => r.name === 'Novo-Gesic Forte');
if (!foundForte || !foundForte.commonStrengths.includes('500 mg')) {
  throw new Error('Novo-Gesic Forte 500mg missing!');
}
console.log('✔ PASS: Novo-Gesic Forte found with 500mg preset.');

const clinical = InteractionService.getClinicalInfo('Novo-Gesic Forte');
console.log(`Clinical Class: ${clinical?.drugClass}`);
console.log('Warnings:');
clinical?.foodAndDrinkToAvoid.forEach((w) => console.log(`  ${w}`));
if (!clinical || !clinical.drugClass.includes('Analgesic')) {
  throw new Error('Novo-Gesic Forte clinical profile failed!');
}
console.log('✔ PASS: Novo-Gesic Forte mapped to Acetaminophen clinical profile successfully.');
