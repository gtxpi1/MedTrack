import React from 'react';
import { Medication } from '../../types/medication';
import { InteractionService } from '../../services/InteractionService';
import { formatTime12h } from '../../utils/dateUtils';
import { Icon } from '../common/Icon';
import { Badge } from '../common/Badge';

interface MedicationDetailsModalProps {
  medication: Medication | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSupplyEditor?: (med: Medication) => void;
}

export const MedicationDetailsModal: React.FC<MedicationDetailsModalProps> = ({
  medication,
  isOpen,
  onClose,
  onOpenSupplyEditor
}) => {
  if (!isOpen || !medication) return null;

  const clinical = InteractionService.getClinicalInfo(medication.name);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: `3px solid ${medication.color || 'var(--primary-600)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon name="pill" size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{medication.name}</h2>
              <span className="text-xs text-muted">
                {medication.genericName ? `${medication.genericName} • ` : ''}{medication.strength} ({medication.form})
              </span>
            </div>
          </div>

          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* Quick Stats Pill Header */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge variant="primary">{clinical?.drugClass || medication.form}</Badge>
            <Badge variant="neutral">{medication.frequency}</Badge>
            <Badge variant={medication.supply.currentSupply <= (medication.supply.lowSupplyThreshold || 7) ? 'warning' : 'success'}>
              Supply: {medication.supply.currentSupply} {medication.supply.supplyUnit} left
            </Badge>
          </div>

          {/* SECTION 1: What to Avoid Eating & Drinking */}
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <h4 style={{ color: '#991b1b', fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                What to Avoid Eating & Drinking
              </h4>
            </div>

            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem', color: '#7f1d1d' }}>
              {clinical?.foodAndDrinkToAvoid.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* SECTION 2: Primary Clinical Uses */}
          <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.875rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.375rem', color: 'var(--slate-800)' }}>
              🩺 Common Uses
            </h4>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {clinical?.primaryUses.map((use, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem'
                  }}
                >
                  {use}
                </span>
              ))}
            </div>
          </div>

          {/* SECTION 3: How to Take & Timing */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              📋 How to Take & Administration
            </h4>
            <p className="text-sm" style={{ color: 'var(--slate-700)', lineHeight: '1.4' }}>
              {clinical?.howToTake}
            </p>
          </div>

          {/* Personal Schedule Times */}
          {medication.schedule.scheduledTimes.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-50)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)' }}>
              <Icon name="clock" size={16} className="text-primary" />
              <span className="text-xs" style={{ color: 'var(--primary-900)', fontWeight: 600 }}>
                Your Scheduled Times: {medication.schedule.scheduledTimes.map(formatTime12h).join(', ')}
              </span>
            </div>
          )}

          {/* User's Specific Prescribed Instructions */}
          {medication.instructions && (
            <div style={{ borderLeft: '3px solid var(--primary-600)', paddingLeft: '0.75rem' }}>
              <span className="text-xs text-muted font-semibold">Doctor / Pharmacy Instructions:</span>
              <p className="text-sm font-semibold" style={{ margin: '0.15rem 0 0 0' }}>
                "{medication.instructions}"
              </p>
            </div>
          )}

          {/* SECTION 4: Common Side Effects & Precautions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem', color: 'var(--slate-700)' }}>
                Common Side Effects
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8125rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {clinical?.commonSideEffects.slice(0, 4).map((eff, idx) => (
                  <li key={idx}>{eff}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem', color: 'var(--slate-700)' }}>
                Key Precautions
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8125rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {clinical?.keyPrecautions.slice(0, 3).map((prec, idx) => (
                  <li key={idx}>{prec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontStyle: 'italic' }}>
            ℹ️ <strong>Medical Notice:</strong> Information is for educational reference. Always follow the specific instructions on your prescription bottle and consult your doctor or pharmacist.
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {onOpenSupplyEditor && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClose();
                onOpenSupplyEditor(medication);
              }}
            >
              <Icon name="package" size={14} />
              <span>Edit Supply Count ({medication.supply.currentSupply})</span>
            </button>
          )}

          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
