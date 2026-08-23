import React, { useState, useEffect } from 'react';
import { Medication } from '../../types/medication';
import { Icon } from '../common/Icon';

interface AdjustSupplyModalProps {
  medication: Medication | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSupply: (medicationId: string, currentSupply: number, lowThreshold?: number) => Promise<void>;
}

export const AdjustSupplyModal: React.FC<AdjustSupplyModalProps> = ({
  medication,
  isOpen,
  onClose,
  onSaveSupply
}) => {
  const [supply, setSupply] = useState<string>('0');
  const [threshold, setThreshold] = useState<string>('7');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (medication) {
      setSupply(String(medication.supply.currentSupply));
      setThreshold(String(medication.supply.lowSupplyThreshold || 7));
    }
  }, [medication]);

  if (!isOpen || !medication) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedSupply = Math.max(0, parseInt(supply, 10) || 0);
      const parsedThreshold = Math.max(1, parseInt(threshold, 10) || 7);
      await onSaveSupply(medication.id, parsedSupply, parsedThreshold);
      onClose();
    } catch (err) {
      console.error('Failed to update supply:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const adjustBy = (delta: number) => {
    const current = parseInt(supply, 10) || 0;
    setSupply(String(Math.max(0, current + delta)));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="package" size={22} className="text-primary" />
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Edit Supply Count</h3>
              <p className="text-xs text-muted">{medication.name} ({medication.strength})</p>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Main Count Stepper */}
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Current Amount Remaining ({medication.supply.supplyUnit})
              </label>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', fontSize: '1.25rem', fontWeight: 700 }}
                  onClick={() => adjustBy(-1)}
                  aria-label="Decrease by 1"
                >
                  -
                </button>

                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    maxWidth: '130px',
                    height: '52px',
                    color: 'var(--primary-700)'
                  }}
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  autoFocus
                />

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', fontSize: '1.25rem', fontWeight: 700 }}
                  onClick={() => adjustBy(1)}
                  aria-label="Increase by 1"
                >
                  +
                </button>
              </div>

              {/* Quick Jump Pills */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => adjustBy(10)}>+10</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => adjustBy(30)}>+30</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => adjustBy(60)}>+60</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => adjustBy(90)}>+90</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSupply('0')} style={{ color: 'var(--danger-text)' }}>Set to 0</button>
              </div>
            </div>

            {/* Low-Supply Warning Threshold */}
            <div className="form-group" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                Low Stock Alert Threshold
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  style={{ maxWidth: '100px' }}
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="7"
                />
                <span className="text-xs text-muted">
                  Alert me when supply drops to or below this amount.
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Supply Count'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
