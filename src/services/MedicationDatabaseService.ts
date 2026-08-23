/**
 * Medication Database & Autocomplete Service
 * 
 * Provides fast autocomplete suggestions combining a built-in offline directory
 * of common medications (generics and brands) with live querying to official
 * drug databases (NIH RxNorm / openFDA).
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

// Built-in verified offline directory of common medications
export const BUILTIN_MEDICATION_DIRECTORY: DrugSuggestion[] = [
  {
    name: 'Betaderm',
    genericName: 'Betamethasone Valerate',
    brandName: 'Betaderm / Valisone',
    form: 'topical',
    commonStrengths: ['0.1%', '0.05%'],
    defaultDoseUnit: 'application',
    category: 'Corticosteroid / Topical'
  },
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
    name: 'Effexor XR',
    genericName: 'Venlafaxine Hydrochloride',
    brandName: 'Effexor XR',
    form: 'capsule',
    commonStrengths: ['37.5 mg', '75 mg', '150 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Antidepressant'
  },
  {
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    brandName: 'Glucophage',
    form: 'tablet',
    commonStrengths: ['500 mg', '850 mg', '1000 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antidiabetic'
  },
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
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    brandName: 'Lipitor',
    form: 'tablet',
    commonStrengths: ['10 mg', '20 mg', '40 mg', '80 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Cholesterol (Statin)'
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
    name: 'Levothyroxine',
    genericName: 'Levothyroxine Sodium',
    brandName: 'Synthroid / Levoxyl',
    form: 'tablet',
    commonStrengths: ['25 mcg', '50 mcg', '75 mcg', '88 mcg', '100 mcg', '112 mcg', '125 mcg', '150 mcg'],
    defaultDoseUnit: 'tablet',
    category: 'Thyroid Hormone'
  },
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
    name: 'Sertraline',
    genericName: 'Sertraline Hydrochloride',
    brandName: 'Zoloft',
    form: 'tablet',
    commonStrengths: ['25 mg', '50 mg', '100 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antidepressant (SSRI)'
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
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    brandName: 'Amoxil',
    form: 'capsule',
    commonStrengths: ['250 mg', '500 mg', '875 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Antibiotic'
  },
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
    name: 'Gabapentin',
    genericName: 'Gabapentin',
    brandName: 'Neurontin',
    form: 'capsule',
    commonStrengths: ['100 mg', '300 mg', '600 mg', '800 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Nerve Pain / Anticonvulsant'
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
    name: 'Losartan',
    genericName: 'Losartan Potassium',
    brandName: 'Cozaar',
    form: 'tablet',
    commonStrengths: ['25 mg', '50 mg', '100 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Blood Pressure (ARB)'
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
    name: 'Escitalopram',
    genericName: 'Escitalopram Oxalate',
    brandName: 'Lexapro',
    form: 'tablet',
    commonStrengths: ['5 mg', '10 mg', '20 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Antidepressant (SSRI)'
  },
  {
    name: 'Fluoxetine',
    genericName: 'Fluoxetine Hydrochloride',
    brandName: 'Prozac',
    form: 'capsule',
    commonStrengths: ['10 mg', '20 mg', '40 mg'],
    defaultDoseUnit: 'capsule',
    category: 'Antidepressant'
  },
  {
    name: 'Prednisone',
    genericName: 'Prednisone',
    brandName: 'Deltasone',
    form: 'tablet',
    commonStrengths: ['5 mg', '10 mg', '20 mg', '50 mg'],
    defaultDoseUnit: 'tablet',
    category: 'Corticosteroid'
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
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid (ASA)',
    brandName: 'Bayer',
    form: 'tablet',
    commonStrengths: ['81 mg (Low Dose)', '325 mg', '500 mg'],
    defaultDoseUnit: 'tablet',
    category: 'NSAID / Antiplatelet'
  },
  {
    name: 'Naproxen',
    genericName: 'Naproxen Sodium',
    brandName: 'Aleve',
    form: 'tablet',
    commonStrengths: ['220 mg', '500 mg'],
    defaultDoseUnit: 'tablet',
    category: 'NSAID'
  },
  {
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    brandName: 'Vitamin D3',
    form: 'capsule',
    commonStrengths: ['1000 IU', '2000 IU', '5000 IU', '50000 IU'],
    defaultDoseUnit: 'capsule',
    category: 'Vitamin Supplement'
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

    // Sort by most relevant (exact match first, then primary name starts with query, then generic name)
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

    return results.slice(0, 8);
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
          group.conceptProperties.slice(0, 5).forEach((prop) => {
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
