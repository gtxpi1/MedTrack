import React from 'react';
import { Medication } from '../../types/medication';
import { InteractionService } from '../../services/InteractionService';
import { Icon } from '../common/Icon';
import { Badge } from '../common/Badge';

interface InteractionCheckerModalProps {
  medications: Medication[];
  isOpen: boolean;
  onClose: () => void;
}

export const InteractionCheckerModal: React.FC<InteractionCheckerModalProps> = ({
  medications,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const interactions = InteractionService.analyzeCabinetInteractions(medications);
  const drugDrugInteractions = interactions.filter((i) => i.type === 'drug-drug');
  const foodInteractions = interactions.filter((i) => i.type === 'food-beverage');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon name="alert" size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Safety & Drug Interactions</h2>
              <p className="text-xs text-muted">Active cross-reference analysis for your cabinet</p>
            </div>
          </div>

          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* Summary Box */}
          <div
            style={{
              backgroundColor: interactions.length > 0 ? '#fffbeb' : '#f0fdf4',
              border: `1px solid ${interactions.length > 0 ? '#fde68a' : '#bbf7d0'}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <strong style={{ color: interactions.length > 0 ? '#92400e' : '#166534', fontSize: '0.9375rem' }}>
                {interactions.length > 0
                  ? `${interactions.length} Safety & Dietary Notice${interactions.length > 1 ? 's' : ''} Identified`
                  : 'No Known Severe Interactions in Your Cabinet'}
              </strong>
              <p className="text-xs text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                Cross-referenced across {medications.filter((m) => m.isActive).length} active medications.
              </p>
            </div>

            <Badge variant={interactions.length > 0 ? 'warning' : 'success'}>
              {interactions.length > 0 ? 'Review Needed' : 'All Clear'}
            </Badge>
          </div>

          {/* SECTION 1: Drug-to-Drug Interactions */}
          {drugDrugInteractions.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span>💊</span> Drug-to-Drug Combination Notices
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {drugDrugInteractions.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#fff5f5',
                      padding: '0.875rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.875rem', color: '#991b1b' }}>{item.title}</strong>
                      <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>
                        {item.severity} Severity
                      </span>
                    </div>

                    <p className="text-xs" style={{ color: '#7f1d1d', margin: '0.25rem 0 0.5rem 0', lineHeight: '1.4' }}>
                      {item.description}
                    </p>

                    <div style={{ backgroundColor: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca', fontSize: '0.75rem', color: '#450a0a' }}>
                      💡 <strong>Clinical Guidance:</strong> {item.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Food & Beverage Restrictions */}
          {foodInteractions.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span>🍽️</span> Food & Beverage Warnings (What to Avoid)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {foodInteractions.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #fed7aa',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#fff7ed',
                      padding: '0.875rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.875rem', color: '#9a3412' }}>{item.title}</strong>
                      <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                        {item.medication1}
                      </span>
                    </div>

                    <p className="text-xs" style={{ color: '#7c2d12', margin: '0.25rem 0 0.5rem 0', lineHeight: '1.4' }}>
                      {item.description}
                    </p>

                    <div style={{ backgroundColor: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fed7aa', fontSize: '0.75rem', color: '#431407' }}>
                      🚫 <strong>What to do:</strong> {item.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Notice */}
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontStyle: 'italic' }}>
            ℹ️ <strong>Disclaimer:</strong> This automated check provides clinical reference warnings. Always consult your prescribing physician or pharmacist before changing any dosing schedule or combining therapies.
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close Safety Report
          </button>
        </div>
      </div>
    </div>
  );
};
