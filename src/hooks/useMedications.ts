import { useContext } from 'react';
import { MedicationContext } from '../context/MedicationContext';
import type { MedicationContextValue, AdherenceStats } from '../context/MedicationContext';

export function useMedications(): MedicationContextValue {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedications must be used within a MedicationProvider');
  }
  return context;
}

export type { MedicationContextValue, AdherenceStats };
