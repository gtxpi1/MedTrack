import React from 'react';
import { Medication } from '../../types/medication';
import { calculateDaysRemaining } from '../../utils/supplyUtils';
import { Icon } from '../common/Icon';

interface SupplyAlertCardProps {
  medication: Medication;
  onRefill?: (medicationId: string) => void;
  onNavigateRefills?: () => void;
}

export const SupplyAlertCard: React.FC<SupplyAlertCardProps> = ({
  medication,
  onRefill,
  onNavigateRefills
}) => {
  const daysRemaining = calculateDaysRemaining(medication);
  const isOut = medication.supply.currentSupply <= 0;

  return (
    <div className="supply-alert-card">
      <div className="supply-alert-content">
        <div className="supply-alert-icon">
          <Icon name="alert" size={20} />
        </div>
        <div className="supply-alert-text">
          <h4>{medication.name} ({medication.strength})</h4>
          <p>
            {isOut
              ? 'Out of supply! Refill needed immediately.'
              : `Only ${medication.supply.currentSupply} ${medication.supply.supplyUnit} left (~${daysRemaining} days remaining).`}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        {onRefill ? (
          <button
            type="button"
            className="btn btn-warning btn-sm"
            style={{
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              fontWeight: 700
            }}
            onClick={() => onRefill(medication.id)}
          >
            Refill (+{medication.supply.refillQuantity || 30})
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onNavigateRefills}
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};
