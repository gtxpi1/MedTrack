/**
 * Medication Database & Autocomplete Service
 * 
 * Provides fast autocomplete suggestions combining a comprehensive built-in offline directory
 * of top prescription and OTC medications with live clinical querying.
 */

export interface DrugSuggestion {
  name: string;
  genericName?: string;
  brandName?: string;
  form: 'tablet' | 'capsule' | 'liquid' | 'inhaler' | 'injection' | 'drops' | 'topical' | 'other';
  commonStrengths: string[];
  defaultDoseUnit: string;
  category?: string;
}

// Built-in verified offline directory of top medications
export const BUILTIN_MEDICATION_DIRECTORY: DrugSuggestion[] = [
  // --- Antipsychotics & Mood Stabilizers ---
  {
    name: 'Quetiapine XR',
    genericName: 'Quetiapine Fumarate Extended-Release',
    brandName: 'Seroquel XR',
    form: 'tablet',
    commonStrengths: ['50 mg', '150 mg', '200 mg', '300 mg', '400 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Atypical Antipsychotic (Extended-Release XR)'
  },
  {
    name: 'Quetiapine XL',
    genericName: 'Quetiapine Prolonged-Release',
    brandName: 'Seroquel XL',
    form: 'tablet',
    commonStrengths: ['50 mg', '150 mg', '200 mg', '300 mg', '400 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Atypical Antipsychotic (Prolonged-Release XL)'
  },
  {
    name: 'Quetiapine (IR)',
    genericName: 'Quetiapine Fumarate (Immediate-Release)',
    brandName: 'Seroquel',
    form: 'tablet',
    commonStrengths: ['25 mg', '50 mg', '100 mg', '200 mg', '300 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Atypical Antipsychotic (Immediate-Release)'
  },
  {
    name: 'Seroquel XR',
    genericName: 'Quetiapine Extended-Release',
    brandName: 'Seroquel XR',
    form: 'tablet',
    commonStrengths: ['50 mg', '150 mg', '200 mg', '300 mg', '400 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Atypical Antipsychotic (XR)'
  },
  {
    name: 'Seroquel',
    genericName: 'Quetiapine Fumarate',
    brandName: 'Seroquel',
    form: 'tablet',
    commonStrengths: ['25 mg', '50 mg', '100 mg', '200 mg', '300 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Atypical Antipsychotic'
  },
  {
    name: 'Aripiprazole',
    genericName: 'Aripiprazole',
    brandName: 'Abilify',
    form: 'tablet',
    commonStrengths: ['2 mg', '5 mg', '10 mg', '15 mg', '20 mg', '30 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antipsychotic / Mood'
  },
  {
    name: 'Abilify',
    genericName: 'Aripiprazole',
    brandName: 'Abilify',
    form: 'tablet',
    commonStrengths: ['2 mg', '5 mg', '10 mg', '15 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antipsychotic'
  },
  {
    name: 'Olanzapine',
    genericName: 'Olanzapine',
    brandName: 'Zyprexa',
    form: 'tablet',
    commonStrengths: ['2.5 mg', '5 mg', '7.5 mg', '10 mg', '15 mg', '20 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antipsychotic'
  },
  {
    name: 'Risperidone',
    genericName: 'Risperidone',
    brandName: 'Risperdal',
    form: 'tablet',
    commonStrengths: ['0.25 mg', '0.5 mg', '1 mg', '2 mg', '3 mg', '4 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antipsychotic'
  },
  {
    name: 'Lamotrigine',
    genericName: 'Lamotrigine',
    brandName: 'Lamictal',
    form: 'tablet',
    commonStrengths: ['25 mg', '50 mg', '100 mg', '150 mg', '200 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Mood Stabilizer / Anticonvulsant'
  },
  {
    name: 'Lithium',
    genericName: 'Lithium Carbonate',
    brandName: 'Lithobid / Eskalith',
    form: 'capsule',
    commonStrengths: ['150 mg', '300 mg', '450 mg', '600 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Mood Stabilizer'
  },

  // --- Topical & Corticosteroids ---
  {
    name: 'Betaderm',
    genericName: 'Betamethasone Valerate',
    brandName: 'Betaderm / Valisone',
    form: 'topical',
    commonStrengths: ['0.1%', '0.05%'],
    defaultDoseUnit: 'application',
    category: 'Corticosteroid / Topical Cream'
  },
  {
    name: 'Betamethasone',
    genericName: 'Betamethasone Valerate / Dipropionate',
    brandName: 'Betaderm / Diprosone',
    form: 'topical',
    commonStrengths: ['0.1%', '0.05%'],
    defaultDoseUnit: 'application',
    category: 'Topical Steroid'
  },
  {
    name: 'Hydrocortisone',
    genericName: 'Hydrocortisone',
    brandName: 'Cortizone-10',
    form: 'topical',
    commonStrengths: ['0.5%', '1%', '2.5%'],
    defaultDoseUnit: 'application',
    category: 'Topical Corticosteroid'
  },
  {
    name: 'Triamcinolone',
    genericName: 'Triamcinolone Acetonide',
    brandName: 'Kenalog',
    form: 'topical',
    commonStrengths: ['0.025%', '0.1%', '0.5%'],
    defaultDoseUnit: 'application',
    category: 'Topical Corticosteroid'
  },
  {
    name: 'Clobetasol',
    genericName: 'Clobetasol Propionate',
    brandName: 'Temovate',
    form: 'topical',
    commonStrengths: ['0.05%'],
    defaultDoseUnit: 'application',
    category: 'Potent Topical Steroid'
  },

  // --- Antidepressants & Anxiolytics ---
  {
    name: 'Venlafaxine',
    genericName: 'Venlafaxine Hydrochloride',
    brandName: 'Effexor / Effexor XR',
    form: 'capsule',
    commonStrengths: ['37.5 mg', '75 mg', '150 mg', '225 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Antidepressant (SNRI)'
  },
  {
    name: 'Effexor XR',
    genericName: 'Venlafaxine Hydrochloride',
    brandName: 'Effexor XR',
    form: 'capsule',
    commonStrengths: ['37.5 mg', '75 mg', '150 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Antidepressant'
  },
  {
    name: 'Duloxetine',
    genericName: 'Duloxetine Hydrochloride',
    brandName: 'Cymbalta',
    form: 'capsule',
    commonStrengths: ['20 mg', '30 mg', '60 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Antidepressant (SNRI) / Nerve Pain'
  },
  {
    name: 'Cymbalta',
    genericName: 'Duloxetine Hydrochloride',
    brandName: 'Cymbalta',
    form: 'capsule',
    commonStrengths: ['20 mg', '30 mg', '60 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Antidepressant (SNRI)'
  },
  {
    name: 'Bupropion',
    genericName: 'Bupropion Hydrochloride',
    brandName: 'Wellbutrin XL / SR',
    form: 'tablet',
    commonStrengths: ['75 mg', '150 mg', '300 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antidepressant (NDRI)'
  },
  {
    name: 'Wellbutrin',
    genericName: 'Bupropion Hydrochloride',
    brandName: 'Wellbutrin XL',
    form: 'tablet',
    commonStrengths: ['150 mg', '300 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antidepressant'
  },
  {
    name: 'Sertraline',
    genericName: 'Sertraline Hydrochloride',
    brandName: 'Zoloft',
    form: 'tablet',
    commonStrengths: ['25 mg', '50 mg', '100 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antidepressant (SSRI)'
  },
  {
    name: 'Zoloft',
    genericName: 'Sertraline Hydrochloride',
    brandName: 'Zoloft',
    form: 'tablet',
    commonStrengths: ['25 mg', '50 mg', '100 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antidepressant'
  },
  {
    name: 'Escitalopram',
    genericName: 'Escitalopram Oxalate',
    brandName: 'Lexapro',
    form: 'tablet',
    commonStrengths: ['5 mg', '10 mg', '20 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antidepressant (SSRI)'
  },
  {
    name: 'Lexapro',
    genericName: 'Escitalopram Oxalate',
    brandName: 'Lexapro',
    form: 'tablet',
    commonStrengths: ['5 mg', '10 mg', '20 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antidepressant'
  },
  {
    name: 'Fluoxetine',
    genericName: 'Fluoxetine Hydrochloride',
    brandName: 'Prozac',
    form: 'capsule',
    commonStrengths: ['10 mg', '20 mg', '40 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Antidepressant (SSRI)'
  },
  {
    name: 'Citalopram',
    genericName: 'Citalopram Hydrobromide',
    brandName: 'Celexa',
    form: 'tablet',
    commonStrengths: ['10 mg', '20 mg', '40 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antidepressant (SSRI)'
  },
  {
    name: 'Trazodone',
    genericName: 'Trazodone Hydrochloride',
    brandName: 'Desyrel',
    form: 'tablet',
    commonStrengths: ['50 mg', '100 mg', '150 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antidepressant / Sleep'
  },
  {
    name: 'Buspirone',
    genericName: 'Buspirone Hydrochloride',
    brandName: 'Buspar',
    form: 'tablet',
    commonStrengths: ['5 mg', '10 mg', '15 mg', '30 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Anxiolytic / Anti-Anxiety'
  },
  {
    name: 'Clonazepam',
    genericName: 'Clonazepam',
    brandName: 'Klonopin',
    form: 'tablet',
    commonStrengths: ['0.5 mg', '1 mg', '2 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Benzodiazepine'
  },
  {
    name: 'Lorazepam',
    genericName: 'Lorazepam',
    brandName: 'Ativan',
    form: 'tablet',
    commonStrengths: ['0.5 mg', '1 mg', '2 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Benzodiazepine'
  },
  {
    name: 'Alprazolam',
    genericName: 'Alprazolam',
    brandName: 'Xanax',
    form: 'tablet',
    commonStrengths: ['0.25 mg', '0.5 mg', '1 mg', '2 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Benzodiazepine'
  },

  // --- Analgesics & Pain Relievers ---
  {
    name: 'Acetaminophen',
    genericName: 'Acetaminophen / Paracetamol',
    brandName: 'Tylenol',
    form: 'tablet',
    commonStrengths: ['325 mg', '500 mg (Extra Strength)', '650 mg (Extended Relief)'],
    defaultDoseUnit: 'tablet',
    category: 'Analgesic / Antipyretic'
  },
  {
    name: 'Tylenol',
    genericName: 'Acetaminophen',
    brandName: 'Tylenol',
    form: 'tablet',
    commonStrengths: ['325 mg', '500 mg', '650 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Pain & Fever Relief'
  },
  {
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brandName: 'Advil / Motrin',
    form: 'tablet',
    commonStrengths: ['200 mg', '400 mg', '600 mg', '800 mg'],
    defaultDoseUnit: 'tablet',
    category: 'NSAID / Pain Relief'
  },
  {
    name: 'Advil',
    genericName: 'Ibuprofen',
    brandName: 'Advil',
    form: 'tablet',
    commonStrengths: ['200 mg'],
    defaultDoseUnit: 'tablet',
    category: 'NSAID'
  },
  {
    name: 'Naproxen',
    genericName: 'Naproxen Sodium',
    brandName: 'Aleve',
    form: 'tablet',
    commonStrengths: ['220 mg', '375 mg', '500 mg'],
    defaultDoseUnit: 'tablet',
    category: 'NSAID'
  },
  {
    name: 'Meloxicam',
    genericName: 'Meloxicam',
    brandName: 'Mobic',
    form: 'tablet',
    commonStrengths: ['7.5 mg', '15 mg'],
    defaultDoseUnit: 'tablet',
    category: 'NSAID / Arthritis'
  },
  {
    name: 'Celecoxib',
    genericName: 'Celecoxib',
    brandName: 'Celebrex',
    form: 'capsule',
    commonStrengths: ['100 mg', '200 mg'],
    defaultDoseUnit: 'capsule',
    category: 'COX-2 Inhibitor'
  },
  {
    name: 'Tramadol',
    genericName: 'Tramadol Hydrochloride',
    brandName: 'Ultram',
    form: 'tablet',
    commonStrengths: ['50 mg', '100 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Opioid Analgesic'
  },
  {
    name: 'Gabapentin',
    genericName: 'Gabapentin',
    brandName: 'Neurontin',
    form: 'capsule',
    commonStrengths: ['100 mg', '300 mg', '600 mg', '800 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Nerve Pain / Anticonvulsant'
  },
  {
    name: 'Pregabalin',
    genericName: 'Pregabalin',
    brandName: 'Lyrica',
    form: 'capsule',
    commonStrengths: ['25 mg', '50 mg', '75 mg', '150 mg', '300 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Nerve Pain / Fibromyalgia'
  },
  {
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid (ASA)',
    brandName: 'Bayer',
    form: 'tablet',
    commonStrengths: ['81 mg (Low Dose)', '325 mg', '500 mg'],
    defaultDoseUnit: 'tablet',
    category: 'NSAID / Antiplatelet'
  },

  // --- Cardiovascular & Blood Pressure ---
  {
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    brandName: 'Zestril / Prinivil',
    form: 'tablet',
    commonStrengths: ['5 mg', '10 mg', '20 mg', '40 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Blood Pressure (ACE Inhibitor)'
  },
  {
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    brandName: 'Norvasc',
    form: 'tablet',
    commonStrengths: ['2.5 mg', '5 mg', '10 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Blood Pressure (Calcium Channel Blocker)'
  },
  {
    name: 'Losartan',
    genericName: 'Losartan Potassium',
    brandName: 'Cozaar',
    form: 'tablet',
    commonStrengths: ['25 mg', '50 mg', '100 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Blood Pressure (ARB)'
  },
  {
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    brandName: 'Lipitor',
    form: 'tablet',
    commonStrengths: ['10 mg', '20 mg', '40 mg', '80 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Cholesterol (Statin)'
  },
  {
    name: 'Rosuvastatin',
    genericName: 'Rosuvastatin Calcium',
    brandName: 'Crestor',
    form: 'tablet',
    commonStrengths: ['5 mg', '10 mg', '20 mg', '40 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Cholesterol (Statin)'
  },
  {
    name: 'Simvastatin',
    genericName: 'Simvastatin',
    brandName: 'Zocor',
    form: 'tablet',
    commonStrengths: ['10 mg', '20 mg', '40 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Cholesterol (Statin)'
  },
  {
    name: 'Metoprolol',
    genericName: 'Metoprolol Tartrate / Succinate',
    brandName: 'Lopressor / Toprol XL',
    form: 'tablet',
    commonStrengths: ['25 mg', '50 mg', '100 mg', '200 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Beta Blocker'
  },
  {
    name: 'Carvedilol',
    genericName: 'Carvedilol',
    brandName: 'Coreg',
    form: 'tablet',
    commonStrengths: ['3.125 mg', '6.25 mg', '12.5 mg', '25 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Beta Blocker'
  },
  {
    name: 'Hydrochlorothiazide',
    genericName: 'Hydrochlorothiazide (HCTZ)',
    brandName: 'Microzide',
    form: 'tablet',
    commonStrengths: ['12.5 mg', '25 mg', '50 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Diuretic'
  },
  {
    name: 'Furosemide',
    genericName: 'Furosemide',
    brandName: 'Lasix',
    form: 'tablet',
    commonStrengths: ['20 mg', '40 mg', '80 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Loop Diuretic'
  },
  {
    name: 'Spironolactone',
    genericName: 'Spironolactone',
    brandName: 'Aldactone',
    form: 'tablet',
    commonStrengths: ['25 mg', '50 mg', '100 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Potassium-Sparing Diuretic'
  },
  {
    name: 'Apixaban',
    genericName: 'Apixaban',
    brandName: 'Eliquis',
    form: 'tablet',
    commonStrengths: ['2.5 mg', '5 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Anticoagulant (Blood Thinner)'
  },
  {
    name: 'Eliquis',
    genericName: 'Apixaban',
    brandName: 'Eliquis',
    form: 'tablet',
    commonStrengths: ['2.5 mg', '5 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Anticoagulant'
  },
  {
    name: 'Clopidogrel',
    genericName: 'Clopidogrel Bisulfate',
    brandName: 'Plavix',
    form: 'tablet',
    commonStrengths: ['75 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antiplatelet'
  },

  // --- Diabetes & Endocrine ---
  {
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    brandName: 'Glucophage / Glumetza',
    form: 'tablet',
    commonStrengths: ['500 mg', '850 mg', '1000 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antidiabetic'
  },
  {
    name: 'Levothyroxine',
    genericName: 'Levothyroxine Sodium',
    brandName: 'Synthroid / Levoxyl',
    form: 'tablet',
    commonStrengths: ['25 mcg', '50 mcg', '75 mcg', '88 mcg', '100 mcg', '112 mcg', '125 mcg', '150 mcg'],
    defaultDoseUnit: 'tablet',
    category: 'Thyroid Hormone'
  },
  {
    name: 'Synthroid',
    genericName: 'Levothyroxine Sodium',
    brandName: 'Synthroid',
    form: 'tablet',
    commonStrengths: ['25 mcg', '50 mcg', '75 mcg', '100 mcg', '125 mcg'],
    defaultDoseUnit: 'tablet',
    category: 'Thyroid Hormone'
  },
  {
    name: 'Semaglutide',
    genericName: 'Semaglutide',
    brandName: 'Ozempic / Wegovy / Rybelsus',
    form: 'injection',
    commonStrengths: ['0.25 mg', '0.5 mg', '1 mg', '2 mg'],
    defaultDoseUnit: 'dose',
    category: 'GLP-1 Receptor Agonist'
  },
  {
    name: 'Ozempic',
    genericName: 'Semaglutide',
    brandName: 'Ozempic',
    form: 'injection',
    commonStrengths: ['0.25 mg', '0.5 mg', '1 mg', '2 mg'],
    defaultDoseUnit: 'dose',
    category: 'GLP-1 Antidiabetic'
  },
  {
    name: 'Empagliflozin',
    genericName: 'Empagliflozin',
    brandName: 'Jardiance',
    form: 'tablet',
    commonStrengths: ['10 mg', '25 mg'],
    defaultDoseUnit: 'tablet',
    category: 'SGLT2 Inhibitor'
  },
  {
    name: 'Glipizide',
    genericName: 'Glipizide',
    brandName: 'Glucotrol',
    form: 'tablet',
    commonStrengths: ['5 mg', '10 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Sulfonylurea'
  },

  // --- Gastrointestinal ---
  {
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    brandName: 'Prilosec',
    form: 'capsule',
    commonStrengths: ['20 mg', '40 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Proton Pump Inhibitor (Acid Reflux)'
  },
  {
    name: 'Pantoprazole',
    genericName: 'Pantoprazole Sodium',
    brandName: 'Protonix',
    form: 'tablet',
    commonStrengths: ['20 mg', '40 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Acid Reflux'
  },
  {
    name: 'Famotidine',
    genericName: 'Famotidine',
    brandName: 'Pepcid',
    form: 'tablet',
    commonStrengths: ['10 mg', '20 mg', '40 mg'],
    defaultDoseUnit: 'tablet',
    category: 'H2 Blocker / Antacid'
  },
  {
    name: 'Ondansetron',
    genericName: 'Ondansetron Hydrochloride',
    brandName: 'Zofran',
    form: 'tablet',
    commonStrengths: ['4 mg', '8 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antiemetic (Nausea Relief)'
  },

  // --- Respiratory & Allergy ---
  {
    name: 'Albuterol',
    genericName: 'Albuterol Sulfate',
    brandName: 'Ventolin / ProAir',
    form: 'inhaler',
    commonStrengths: ['90 mcg/actuation'],
    defaultDoseUnit: 'puff',
    category: 'Bronchodilator'
  },
  {
    name: 'Ventolin',
    genericName: 'Albuterol Sulfate',
    brandName: 'Ventolin HFA',
    form: 'inhaler',
    commonStrengths: ['90 mcg/actuation'],
    defaultDoseUnit: 'puff',
    category: 'Inhaler'
  },
  {
    name: 'Montelukast',
    genericName: 'Montelukast Sodium',
    brandName: 'Singulair',
    form: 'tablet',
    commonStrengths: ['10 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Leukotriene Receptor Antagonist'
  },
  {
    name: 'Cetirizine',
    genericName: 'Cetirizine Hydrochloride',
    brandName: 'Zyrtec',
    form: 'tablet',
    commonStrengths: ['10 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antihistamine / Allergy'
  },
  {
    name: 'Loratadine',
    genericName: 'Loratadine',
    brandName: 'Claritin',
    form: 'tablet',
    commonStrengths: ['10 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antihistamine / Allergy'
  },
  {
    name: 'Diphenhydramine',
    genericName: 'Diphenhydramine HCl',
    brandName: 'Benadryl',
    form: 'tablet',
    commonStrengths: ['25 mg', '50 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antihistamine / Sleep Aid'
  },
  {
    name: 'Fluticasone',
    genericName: 'Fluticasone Propionate',
    brandName: 'Flonase / Flovent',
    form: 'drops',
    commonStrengths: ['50 mcg/spray'],
    defaultDoseUnit: 'spray',
    category: 'Nasal Corticosteroid'
  },

  // --- Antibiotics & Anti-infectives ---
  {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    brandName: 'Amoxil',
    form: 'capsule',
    commonStrengths: ['250 mg', '500 mg', '875 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Antibiotic (Penicillin)'
  },
  {
    name: 'Augmentin',
    genericName: 'Amoxicillin / Clavulanate Potassium',
    brandName: 'Augmentin',
    form: 'tablet',
    commonStrengths: ['500/125 mg', '875/125 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antibiotic'
  },
  {
    name: 'Azithromycin',
    genericName: 'Azithromycin',
    brandName: 'Zithromax / Z-Pak',
    form: 'tablet',
    commonStrengths: ['250 mg', '500 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antibiotic (Macrolide)'
  },
  {
    name: 'Ciprofloxacin',
    genericName: 'Ciprofloxacin',
    brandName: 'Cipro',
    form: 'tablet',
    commonStrengths: ['250 mg', '500 mg', '750 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antibiotic'
  },
  {
    name: 'Doxycycline',
    genericName: 'Doxycycline Hyclate / Monohydrate',
    brandName: 'Vibramycin',
    form: 'capsule',
    commonStrengths: ['50 mg', '100 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Antibiotic'
  },
  {
    name: 'Fluconazole',
    genericName: 'Fluconazole',
    brandName: 'Diflucan',
    form: 'tablet',
    commonStrengths: ['100 mg', '150 mg', '200 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antifungal'
  },

  // --- Vitamins & Supplements ---
  {
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    brandName: 'Vitamin D3',
    form: 'capsule',
    commonStrengths: ['1000 IU', '2000 IU', '5000 IU', '50000 IU'],
    defaultDoseUnit: 'capsule',
    category: 'Vitamin Supplement'
  },
  {
    name: 'Vitamin B12',
    genericName: 'Cyanocobalamin / Methylcobalamin',
    brandName: 'B12',
    form: 'tablet',
    commonStrengths: ['500 mcg', '1000 mcg', '5000 mcg'],
    defaultDoseUnit: 'tablet',
    category: 'Vitamin Supplement'
  },
  {
    name: 'Magnesium',
    genericName: 'Magnesium Glycinate / Citrate / Oxide',
    brandName: 'Magnesium',
    form: 'tablet',
    commonStrengths: ['200 mg', '400 mg', '500 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Mineral Supplement'
  },
  {
    name: 'Iron',
    genericName: 'Ferrous Sulfate',
    brandName: 'Slow Fe',
    form: 'tablet',
    commonStrengths: ['65 mg (Elemental Iron)', '325 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Mineral Supplement'
  }
];

export class MedicationDatabaseService {
  /**
   * Search medication suggestions by query string
   */
  static searchMedications(query: string): DrugSuggestion[] {
    if (!query || query.trim().length < 1) return [];

    const q = query.trim().toLowerCase();
    
    // Exact or prefix matches ranked first
    const results = BUILTIN_MEDICATION_DIRECTORY.filter((med) => {
      const nameMatch = med.name.toLowerCase().includes(q);
      const genericMatch = med.genericName?.toLowerCase().includes(q);
      const brandMatch = med.brandName?.toLowerCase().includes(q);
      return nameMatch || genericMatch || brandMatch;
    });

    // Sort by most relevant:
    // 1. Exact primary name match
    // 2. Primary name starts with query
    // 3. Generic name starts with query
    // 4. Substring matches
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === q;
      const bExact = b.name.toLowerCase() === q;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aNameStarts = a.name.toLowerCase().startsWith(q);
      const bNameStarts = b.name.toLowerCase().startsWith(q);
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;

      const aGenericStarts = a.genericName?.toLowerCase().startsWith(q);
      const bGenericStarts = b.genericName?.toLowerCase().startsWith(q);
      if (aGenericStarts && !bGenericStarts) return -1;
      if (!aGenericStarts && bGenericStarts) return 1;

      return a.name.localeCompare(b.name);
    });

    return results.slice(0, 10);
  }

  /**
   * Live query NIH RxNorm REST API for any drug not in built-in list
   */
  static async queryLiveRxNorm(query: string): Promise<DrugSuggestion[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const res = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query.trim())}`);
      if (!res.ok) return [];

      const data = await res.json();
      const conceptGroup = data?.drugGroup?.conceptGroup;
      if (!conceptGroup || !Array.isArray(conceptGroup)) return [];

      const suggestions: DrugSuggestion[] = [];
      conceptGroup.forEach((group: { conceptProperties?: Array<{ name: string; synyonym?: string }> }) => {
        if (group.conceptProperties) {
          group.conceptProperties.slice(0, 6).forEach((prop) => {
            if (prop.name) {
              // Guess form from name
              const lower = prop.name.toLowerCase();
              let form: DrugSuggestion['form'] = 'tablet';
              if (lower.includes('capsule')) form = 'capsule';
              else if (lower.includes('topical') || lower.includes('cream') || lower.includes('ointment')) form = 'topical';
              else if (lower.includes('inhal') || lower.includes('aerosol')) form = 'inhaler';
              else if (lower.includes('oral solution') || lower.includes('suspension') || lower.includes('liquid')) form = 'liquid';
              else if (lower.includes('inject')) form = 'injection';
              else if (lower.includes('drop')) form = 'drops';

              suggestions.push({
                name: prop.name,
                genericName: prop.name,
                form,
                commonStrengths: [],
                defaultDoseUnit: form === 'tablet' ? 'tablet' : form === 'capsule' ? 'capsule' : 'dose'
              });
            }
          });
        }
      });

      return suggestions;
    } catch {
      // Offline fallback
      return [];
    }
  }
}
