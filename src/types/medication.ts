/**
 * Medication Domain Data Models & Types
 * 
 * Note: These types represent the structural model for tracking medications,
 * dosing schedules, and supply inventory. No medical advice or clinical rules
 * are hardcoded here.
 */

export type MedicationForm = 
  | 'tablet' 
  | 'capsule' 
  | 'liquid' 
  | 'injection' 
  | 'inhaler' 
  | 'patch' 
  | 'drops' 
  | 'topical' 
  | 'powder'
  | 'other';

export type ScheduleFrequency = 
  | 'once-daily' 
  | 'twice-daily' 
  | 'three-times-daily' 
  | 'four-times-daily'
  | 'specific-days' 
  | 'every-x-days' 
  | 'as-needed';

export type DoseStatus = 
  | 'scheduled' 
  | 'taken' 
  | 'skipped' 
  | 'missed';

export type TimeOfDay = 
  | 'morning' 
  | 'afternoon' 
  | 'evening' 
  | 'bedtime';

/**
 * Schedule definition for a medication
 */
export interface MedicationSchedule {
  id: string;
  medicationId: string;
  frequency: ScheduleFrequency;
  scheduledTimes: string[]; // e.g. ["08:00", "20:00"] in 24-hour format
  daysOfWeek?: number[];    // 0 = Sunday, 1 = Monday, ... 6 = Saturday (for specific-days)
  intervalDays?: number;    // e.g. every 2 days
  startDate: string;        // ISO date string (YYYY-MM-DD)
  endDate?: string;         // ISO date string (optional)
  isActive: boolean;
}

/**
 * Refill & Supply management metadata
 */
export interface RefillInformation {
  currentSupply: number;          // e.g., 23
  lowSupplyThreshold: number;     // e.g., 7 (trigger alert when <= 7)
  supplyUnit: string;             // e.g., 'tablets', 'doses', 'ml', 'capsules'
  refillQuantity?: number;        // e.g., 30 (amount received on refill)
  prescriptionNumber?: string;    // Rx number
  pharmacyName?: string;
  pharmacyPhone?: string;
  lastRefillDate?: string;        // ISO date string
}

/**
 * Primary Medication entity
 */
export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  brandName?: string;
  form: MedicationForm;
  strength: string;               // e.g., "500 mg", "10 mg/ml"
  doseAmount: number;             // e.g., 1, 2, 0.5
  doseUnit: string;               // e.g., "tablet", "capsule", "puff", "ml"
  
  // Frequency & Schedule
  frequency: ScheduleFrequency;
  schedule: MedicationSchedule;
  
  // Supply & Refill
  supply: RefillInformation;
  
  // User/Prescription context
  instructions?: string;          // e.g., "Take with food" (user provided)
  warnings?: string;              // Specific user/prescriber caution notes
  notes?: string;                 // Personal notes
  
  // UI customization
  color?: string;                 // Hex color or palette key for pill identification
  icon?: string;                  // Icon identifier
  isActive: boolean;
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
}

/**
 * Dose history and execution record
 */
export interface DoseRecord {
  id: string;
  medicationId: string;
  scheduleId: string;
  scheduledTime: string;          // ISO timestamp for the scheduled dose slot
  timeOfDay: TimeOfDay;
  status: DoseStatus;
  doseAmount: number;
  doseUnit: string;
  takenTime?: string;             // ISO timestamp when user marked it taken
  notes?: string;                 // Optional note for skipped/taken reasons
  createdAt: string;
  updatedAt: string;
}

/**
 * Augmented dose item used for UI rendering in Today & Schedule views
 */
export interface ScheduledDoseItem {
  record: DoseRecord;
  medication: Medication;
  isOverdue: boolean;
  daysRemaining: number;
  isLowSupply: boolean;
}
