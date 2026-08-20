import { Medication } from '../types/medication';

/**
 * ============================================================================
 * SAMPLE / DEMONSTRATION DATA ONLY
 * 
 * DISCLAIMER:
 * The data below is strictly for UI mockup and application demonstration purposes.
 * It is NOT medical advice, dosage instruction, or clinical recommendation.
 * In a production deployment, this placeholder data is replaced by real user
 * inputs and verified clinical databases.
 * ============================================================================
 */

export const IS_SAMPLE_DATA_ENABLED = true;

export const INITIAL_SAMPLE_MEDICATIONS: Medication[] = [
  {
    id: 'sample-med-1',
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    brandName: 'Glucophage',
    form: 'tablet',
    strength: '500 mg',
    doseAmount: 1,
    doseUnit: 'tablet',
    frequency: 'twice-daily',
    schedule: {
      id: 'sched-1',
      medicationId: 'sample-med-1',
      frequency: 'twice-daily',
      scheduledTimes: ['08:00', '20:00'],
      startDate: '2026-01-01',
      isActive: true
    },
    supply: {
      currentSupply: 46, // ~23 days remaining
      lowSupplyThreshold: 14,
      supplyUnit: 'tablets',
      refillQuantity: 60,
      prescriptionNumber: 'RX-884920',
      pharmacyName: 'Community Health Pharmacy',
      pharmacyPhone: '(555) 234-5678',
      lastRefillDate: '2026-02-01'
    },
    instructions: 'Take with meals (Sample instruction for UI demonstration)',
    notes: 'Prescribed for demonstration tracking',
    color: '#0d9488',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-med-2',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    brandName: 'Zestril',
    form: 'tablet',
    strength: '10 mg',
    doseAmount: 1,
    doseUnit: 'tablet',
    frequency: 'once-daily',
    schedule: {
      id: 'sched-2',
      medicationId: 'sample-med-2',
      frequency: 'once-daily',
      scheduledTimes: ['08:00'],
      startDate: '2026-01-15',
      isActive: true
    },
    supply: {
      currentSupply: 4, // 4 days remaining -> LOW SUPPLY ALERT DEMO
      lowSupplyThreshold: 7,
      supplyUnit: 'tablets',
      refillQuantity: 30,
      prescriptionNumber: 'RX-441209',
      pharmacyName: 'Community Health Pharmacy',
      pharmacyPhone: '(555) 234-5678',
      lastRefillDate: '2026-01-15'
    },
    instructions: 'Take once daily in the morning (Sample UI instruction)',
    notes: 'Low supply trigger for UI alert testing',
    color: '#f59e0b',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-med-3',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    brandName: 'Lipitor',
    form: 'tablet',
    strength: '20 mg',
    doseAmount: 1,
    doseUnit: 'tablet',
    frequency: 'once-daily',
    schedule: {
      id: 'sched-3',
      medicationId: 'sample-med-3',
      frequency: 'once-daily',
      scheduledTimes: ['21:00'],
      startDate: '2026-01-10',
      isActive: true
    },
    supply: {
      currentSupply: 28, // 28 days remaining
      lowSupplyThreshold: 7,
      supplyUnit: 'tablets',
      refillQuantity: 30,
      prescriptionNumber: 'RX-991244',
      pharmacyName: 'City Central Chemist',
      pharmacyPhone: '(555) 987-6543',
      lastRefillDate: '2026-02-05'
    },
    instructions: 'Take in the evening (Sample UI instruction)',
    notes: 'Bedtime dose demonstration',
    color: '#6366f1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-med-4',
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    brandName: 'Generic Supplement',
    form: 'capsule',
    strength: '2000 IU',
    doseAmount: 1,
    doseUnit: 'capsule',
    frequency: 'once-daily',
    schedule: {
      id: 'sched-4',
      medicationId: 'sample-med-4',
      frequency: 'once-daily',
      scheduledTimes: ['12:00'],
      startDate: '2026-01-01',
      isActive: true
    },
    supply: {
      currentSupply: 52, // 52 days remaining
      lowSupplyThreshold: 10,
      supplyUnit: 'capsules',
      refillQuantity: 60,
      lastRefillDate: '2026-01-20'
    },
    instructions: 'Take with midday meal (Sample UI instruction)',
    notes: 'Midday dietary supplement demonstration',
    color: '#10b981',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-med-5',
    name: 'Albuterol Inhaler',
    genericName: 'Albuterol Sulfate',
    brandName: 'ProAir HFA',
    form: 'inhaler',
    strength: '90 mcg/actuation',
    doseAmount: 2,
    doseUnit: 'puffs',
    frequency: 'as-needed',
    schedule: {
      id: 'sched-5',
      medicationId: 'sample-med-5',
      frequency: 'as-needed',
      scheduledTimes: [],
      startDate: '2026-01-01',
      isActive: true
    },
    supply: {
      currentSupply: 12, // 12 doses remaining -> LOW SUPPLY ALERT DEMO
      lowSupplyThreshold: 20,
      supplyUnit: 'puffs',
      refillQuantity: 200,
      prescriptionNumber: 'RX-773319',
      pharmacyName: 'Community Health Pharmacy',
      pharmacyPhone: '(555) 234-5678',
      lastRefillDate: '2026-01-02'
    },
    instructions: '1-2 puffs as needed for shortness of breath (Sample UI instruction)',
    notes: 'PRN (As-needed) medication example',
    color: '#ec4899',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
