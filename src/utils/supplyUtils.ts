import { Medication } from '../types/medication';

/**
 * Calculate estimated daily dosage consumption for a medication
 */
export function calculateDailyConsumption(medication: Medication): number {
  if (medication.frequency === 'as-needed') {
    // For PRN / as-needed, fallback to single dose or estimate 1
    return medication.doseAmount || 1;
  }

  const timesCount = medication.schedule.scheduledTimes.length;
  if (timesCount > 0) {
    return timesCount * (medication.doseAmount || 1);
  }

  switch (medication.frequency) {
    case 'once-daily':
      return 1 * (medication.doseAmount || 1);
    case 'twice-daily':
      return 2 * (medication.doseAmount || 1);
    case 'three-times-daily':
      return 3 * (medication.doseAmount || 1);
    case 'four-times-daily':
      return 4 * (medication.doseAmount || 1);
    default:
      return 1 * (medication.doseAmount || 1);
  }
}

/**
 * Calculate estimated days of medication remaining based on current supply and daily dosage
 */
export function calculateDaysRemaining(medication: Medication): number {
  const currentSupply = medication.supply.currentSupply;
  if (currentSupply <= 0) return 0;

  const dailyDose = calculateDailyConsumption(medication);
  if (dailyDose <= 0) return 0;

  return Math.floor(currentSupply / dailyDose);
}

/**
 * Check whether a medication is currently below its low-supply alert threshold
 */
export function isLowSupply(medication: Medication): boolean {
  return medication.supply.currentSupply <= medication.supply.lowSupplyThreshold;
}

/**
 * Format supply status label (e.g., "23 days remaining", "Low: 4 days remaining", "Out of stock")
 */
export function formatSupplyLabel(medication: Medication): { text: string; isLow: boolean; isOut: boolean } {
  const remaining = calculateDaysRemaining(medication);
  const isOut = medication.supply.currentSupply <= 0;
  const isLow = !isOut && isLowSupply(medication);

  if (isOut) {
    return { text: 'Out of stock', isLow: true, isOut: true };
  }

  if (isLow) {
    return { text: `${remaining} ${remaining === 1 ? 'day' : 'days'} left (Low)`, isLow: true, isOut: false };
  }

  return { text: `${remaining} ${remaining === 1 ? 'day' : 'days'} remaining`, isLow: false, isOut: false };
}
