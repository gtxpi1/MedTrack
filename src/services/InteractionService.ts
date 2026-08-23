import { Medication } from '../types/medication';

export interface DrugInteraction {
  id: string;
  severity: 'high' | 'moderate' | 'low' | 'info';
  type: 'drug-drug' | 'food-beverage' | 'precaution';
  medication1: string;
  medication2?: string;
  title: string;
  description: string;
  recommendation: string;
}

export interface MedicationClinicalInfo {
  name: string;
  drugClass: string;
  primaryUses: string[];
  howToTake: string;
  foodAndDrinkToAvoid: string[];
  commonSideEffects: string[];
  keyPrecautions: string[];
}

// Clinical information directory for common medications
export const CLINICAL_INFO_REGISTRY: Record<string, MedicationClinicalInfo> = {
  quetiapine: {
    name: 'Quetiapine (Seroquel / XR / XL)',
    drugClass: 'Atypical Antipsychotic / Mood Stabilizer',
    primaryUses: ['Bipolar disorder', 'Depression (add-on therapy)', 'Schizophrenia', 'Sleep & mood stabilization'],
    howToTake: 'Take once daily at bedtime (XR/XL) or as directed. Swallow XR/XL tablets whole with water without chewing or crushing.',
    foodAndDrinkToAvoid: [
      '🚫 Alcohol: Significantly amplifies drowsiness, dizziness, and cognitive impairment.',
      '🚫 Grapefruit & Grapefruit Juice: Can inhibit liver enzymes (CYP3A4) and increase quetiapine blood levels.',
      '🍽️ Avoid taking XR with very heavy or high-fat meals right before dosing (take on empty stomach or light snack).'
    ],
    commonSideEffects: ['Drowsiness / sedation', 'Dizziness or lightheadedness upon standing', 'Dry mouth', 'Weight gain / increased appetite', 'Constipation'],
    keyPrecautions: ['Do not drive or operate machinery until you know how it affects you.', 'Stand up slowly from sitting or lying down to prevent dizziness.', 'Do not stop abruptly without medical supervision.']
  },
  venlafaxine: {
    name: 'Venlafaxine (Effexor / Effexor XR)',
    drugClass: 'Serotonin-Norepinephrine Reuptake Inhibitor (SNRI)',
    primaryUses: ['Major depressive disorder', 'Generalized anxiety disorder', 'Panic disorder', 'Social anxiety'],
    howToTake: 'Take once daily in the morning or evening with food. Swallow extended-release capsules whole at the same time each day.',
    foodAndDrinkToAvoid: [
      '🚫 Alcohol: Can worsen anxiety/depression and intensify drowsiness.',
      '🚫 St. John\'s Wort: High risk of Serotonin Syndrome when combined.',
      '☕ Excessive Caffeine: May increase jitteriness or elevate blood pressure.'
    ],
    commonSideEffects: ['Nausea (mild, usually passes after 1-2 weeks)', 'Dry mouth', 'Sweating', 'Trouble sleeping or vivid dreams', 'Mild blood pressure elevation'],
    keyPrecautions: ['Take with food to minimize stomach upset.', 'Do not miss doses or stop abruptly—requires gradual taper.', 'Regular blood pressure monitoring recommended.']
  },
  betaderm: {
    name: 'Betaderm (Betamethasone Valerate)',
    drugClass: 'Topical Corticosteroid (Medium-to-High Potency)',
    primaryUses: ['Eczema & dermatitis', 'Psoriasis', 'Skin inflammation, redness, and itching'],
    howToTake: 'Apply a thin layer to affected skin areas once or twice daily. Gently rub in until absorbed.',
    foodAndDrinkToAvoid: [
      '✓ No specific food or drink restrictions for topical skin application.'
    ],
    commonSideEffects: ['Mild burning or stinging at application site', 'Skin dryness', 'Skin thinning (if overused on delicate areas)'],
    keyPrecautions: ['Do not apply on broken skin, open wounds, or around eyes.', 'Avoid prolonged continuous use on the face or skin folds without doctor review.', 'Wash hands thoroughly after application.']
  },
  acetaminophen: {
    name: 'Acetaminophen (Tylenol / Paracetamol)',
    drugClass: 'Analgesic & Antipyretic (Pain & Fever Reliever)',
    primaryUses: ['Mild to moderate pain relief (headaches, muscle aches, toothaches)', 'Fever reduction', 'Osteoarthritis discomfort'],
    howToTake: 'Take 1 to 2 tablets every 4 to 6 hours as needed with water. Do not exceed 4,000 mg in 24 hours.',
    foodAndDrinkToAvoid: [
      '🚫 Alcohol: Combining frequent alcohol intake with acetaminophen significantly increases the risk of severe liver damage.'
    ],
    commonSideEffects: ['Generally very well tolerated at standard dosages. Overdose causes severe liver toxicity.'],
    keyPrecautions: ['Check all combination cough/cold medications to avoid accidental duplicate acetaminophen intake.', 'Do not exceed maximum daily limit (3,000–4,000 mg/day).']
  },
  metformin: {
    name: 'Metformin (Glucophage)',
    drugClass: 'Biguanide Antidiabetic',
    primaryUses: ['Type 2 Diabetes glycemic management', 'Insulin resistance'],
    howToTake: 'Take with meals to minimize stomach upset.',
    foodAndDrinkToAvoid: [
      '🚫 Heavy Alcohol: Increases risk of lactic acidosis and hypoglycemia.',
      '🍽️ Avoid skipping meals when taking antidiabetic therapy.'
    ],
    commonSideEffects: ['Stomach discomfort', 'Loose stools / diarrhea (improves with food)', 'Metallic taste'],
    keyPrecautions: ['Take with main meals.', 'Stay hydrated.', 'Inform doctors before medical procedures using iodine contrast dye.']
  },
  atorvastatin: {
    name: 'Atorvastatin (Lipitor)',
    drugClass: 'HMG-CoA Reductase Inhibitor (Statin)',
    primaryUses: ['High cholesterol (LDL reduction)', 'Cardiovascular risk reduction'],
    howToTake: 'Take once daily in the evening or morning, with or without food.',
    foodAndDrinkToAvoid: [
      '🚫 Grapefruit & Grapefruit Juice: Blocks CYP3A4 metabolism and raises atorvastatin levels in the blood, increasing muscle toxicity risk.',
      '🚫 Heavy Alcohol: Increases liver enzyme strain.'
    ],
    commonSideEffects: ['Mild muscle or joint aches', 'Digestive changes', 'Mild headache'],
    keyPrecautions: ['Report unexplained muscle tenderness or weakness to your physician.', 'Periodic routine liver enzyme tests.']
  },
  lisinopril: {
    name: 'Lisinopril (Zestril / Prinivil)',
    drugClass: 'ACE Inhibitor (Angiotensin-Converting Enzyme Inhibitor)',
    primaryUses: ['Hypertension (Blood pressure)', 'Heart failure', 'Kidney protection in diabetes'],
    howToTake: 'Take once daily in the morning with or without food.',
    foodAndDrinkToAvoid: [
      '🚫 High Potassium Salt Substitutes: Lisinopril preserves potassium; excess potassium can cause hyperkalemia.',
      '🚫 Alcohol: Can cause sudden drops in blood pressure (dizziness/fainting).'
    ],
    commonSideEffects: ['Dry persistent cough', 'Dizziness upon standing', 'Headache'],
    keyPrecautions: ['Stay hydrated.', 'Stand up gradually to avoid postural dizziness.', 'Avoid potassium supplements unless prescribed.']
  },
  ibuprofen: {
    name: 'Ibuprofen (Advil / Motrin)',
    drugClass: 'Non-Steroidal Anti-Inflammatory Drug (NSAID)',
    primaryUses: ['Inflammation, swelling, arthritis', 'Fever and pain relief'],
    howToTake: 'Take with food or a glass of milk to protect stomach lining.',
    foodAndDrinkToAvoid: [
      '🚫 Alcohol: Increases risk of stomach bleeding and ulcers.',
      '🚫 Avoid combining with Aspirin or other oral NSAIDs without doctor advice.'
    ],
    commonSideEffects: ['Stomach upset or heartburn', 'Mild nausea'],
    keyPrecautions: ['Always take with food or milk.', 'Use lowest effective dose for shortest duration needed.']
  }
};

export class InteractionService {
  /**
   * Get clinical detail profile for a medication
   */
  static getClinicalInfo(medName: string): MedicationClinicalInfo | null {
    if (!medName) return null;
    const lower = medName.toLowerCase();

    for (const key of Object.keys(CLINICAL_INFO_REGISTRY)) {
      if (lower.includes(key) || (key === 'acetaminophen' && (lower.includes('novo-gesic') || lower.includes('novogesic') || lower.includes('tylenol')))) {
        return CLINICAL_INFO_REGISTRY[key];
      }
    }

    // Default template for any uncataloged medication
    return {
      name: medName,
      drugClass: 'Prescription / Over-the-Counter Medication',
      primaryUses: ['Prescribed medical indication'],
      howToTake: 'Take strictly according to the dosing instructions provided by your doctor or pharmacist.',
      foodAndDrinkToAvoid: [
        '🍷 Alcohol: Generally recommended to avoid or limit alcohol with active prescriptions.',
        '💧 Take oral medications with a full glass of water unless instructed otherwise.'
      ],
      commonSideEffects: ['Consult your pharmacist for specific side effect profiles.'],
      keyPrecautions: ['Follow prescription label guidelines.', 'Store at room temperature away from excessive moisture.']
    };
  }

  /**
   * Cross-reference all medications in user's active cabinet for known interactions and food precautions
   */
  static analyzeCabinetInteractions(medications: Medication[]): DrugInteraction[] {
    const interactions: DrugInteraction[] = [];
    const active = medications.filter((m) => m.isActive);
    const names = active.map((m) => m.name.toLowerCase());

    // 1. Check Sedation / CNS Additive Interaction (e.g. Quetiapine + other sedatives/antidepressants)
    const hasQuetiapine = names.some((n) => n.includes('quetiapine') || n.includes('seroquel'));
    const hasVenlafaxine = names.some((n) => n.includes('venlafaxine') || n.includes('effexor'));
    const hasNSAID = names.some((n) => n.includes('ibuprofen') || n.includes('naproxen') || n.includes('advil') || n.includes('aspirin'));
    const hasAcetaminophen = names.some((n) => n.includes('acetaminophen') || n.includes('tylenol') || n.includes('paracetamol') || n.includes('novo-gesic') || n.includes('novogesic'));
    const hasStatin = names.some((n) => n.includes('atorvastatin') || n.includes('simvastatin') || n.includes('lipitor'));
    const hasLisinopril = names.some((n) => n.includes('lisinopril') || n.includes('losartan'));

    // Quetiapine + Venlafaxine Combination
    if (hasQuetiapine && hasVenlafaxine) {
      interactions.push({
        id: 'int-quet-venla',
        severity: 'moderate',
        type: 'drug-drug',
        medication1: 'Quetiapine',
        medication2: 'Venlafaxine',
        title: 'Moderate Interaction: Enhanced Sedation / CNS Effects',
        description: 'Combining Quetiapine and Venlafaxine can increase drowsiness, dizziness, and central nervous system effects, especially when starting or adjusting doses.',
        recommendation: 'Take Quetiapine at bedtime as prescribed. Avoid driving or operating machinery until you know how both medications affect you. Avoid alcohol.'
      });
    }

    // Food/Beverage: Quetiapine Food Precautions
    if (hasQuetiapine) {
      interactions.push({
        id: 'food-quet-grapefruit',
        severity: 'moderate',
        type: 'food-beverage',
        medication1: 'Quetiapine',
        title: 'Food Alert: Avoid Grapefruit & Grapefruit Juice',
        description: 'Grapefruit inhibits the liver enzyme (CYP3A4) responsible for breaking down Quetiapine, which can raise medication levels in your bloodstream.',
        recommendation: 'Do not consume grapefruit or grapefruit juice while taking Quetiapine. Limit or avoid alcohol.'
      });
    }

    // Food/Beverage: Atorvastatin & Grapefruit
    if (hasStatin) {
      interactions.push({
        id: 'food-statin-grapefruit',
        severity: 'moderate',
        type: 'food-beverage',
        medication1: 'Atorvastatin',
        title: 'Food Alert: Limit / Avoid Grapefruit Juice',
        description: 'Grapefruit juice can significantly increase blood concentrations of statins (Atorvastatin/Simvastatin), increasing the risk of muscle aches or liver effects.',
        recommendation: 'Avoid large quantities of grapefruit juice while on statin therapy.'
      });
    }

    // Lisinopril & Potassium Salt Substitutes
    if (hasLisinopril) {
      interactions.push({
        id: 'food-lisinopril-potassium',
        severity: 'low',
        type: 'food-beverage',
        medication1: 'Lisinopril',
        title: 'Dietary Precaution: Potassium & Salt Substitutes',
        description: 'ACE inhibitors like Lisinopril help your body retain potassium. Using potassium-based salt substitutes can cause potassium levels to climb too high.',
        recommendation: 'Check salt substitute labels and speak to your doctor before taking high-potassium supplements.'
      });
    }

    // Acetaminophen & Alcohol
    if (hasAcetaminophen) {
      interactions.push({
        id: 'food-aceta-alcohol',
        severity: 'moderate',
        type: 'food-beverage',
        medication1: 'Acetaminophen',
        title: 'Beverage Alert: Acetaminophen & Alcohol',
        description: 'Combining alcohol with acetaminophen increases metabolic stress on liver pathways.',
        recommendation: 'Avoid alcohol when taking acetaminophen. Do not exceed 4,000 mg of acetaminophen in 24 hours from all combined sources.'
      });
    }

    // Ibuprofen / NSAID Food Guidance
    if (hasNSAID) {
      interactions.push({
        id: 'food-nsaid-stomach',
        severity: 'low',
        type: 'food-beverage',
        medication1: 'Ibuprofen',
        title: 'Administration Precaution: Always Take with Food',
        description: 'NSAIDs can cause stomach irritation or heartburn when taken on an empty stomach.',
        recommendation: 'Always take Ibuprofen with a meal or a glass of milk to protect your stomach.'
      });
    }

    return interactions;
  }
}
