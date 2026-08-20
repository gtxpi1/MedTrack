import React, { useState } from 'react';
import { useMedications } from '../hooks/useMedications';
import { formatTime12h } from '../utils/dateUtils';
import { calculateDaysRemaining, isLowSupply } from '../utils/supplyUtils';
import { Badge } from '../components/common/Badge';
import { Icon } from '../components/common/Icon';

interface MedicationsViewProps {
  onOpenAddModal: () => void;
}

export const MedicationsView: React.FC<MedicationsViewProps> = ({ onOpenAddModal }) => {
  const { medications, deleteMedication, refillMedication, isLoading } = useMedications();
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="empty-state">
        <Icon name="refresh" size={32} />
        <p>Loading medications...</p>
      </div>
    );
  }

  const filteredMeds = medications.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.genericName && m.genericName.toLowerCase().includes(q)) ||
      (m.brandName && m.brandName.toLowerCase().includes(q)) ||
      m.strength.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header controls: Search & Count */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}>
            <Icon name="search" size={18} />
          </span>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search medications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button type="button" className="btn btn-primary" onClick={onOpenAddModal}>
          <Icon name="plus" size={18} />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Medication List */}
      {filteredMeds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="pill" size={28} />
          </div>
          <h4>No medications found</h4>
          <p className="text-muted text-sm">
            {searchQuery ? 'Try a different search term.' : 'Add your first medication to begin tracking.'}
          </p>
        </div>
      ) : (
        <div className="grid-cards">
          {filteredMeds.map((med) => {
            const low = isLowSupply(med);
            const days = calculateDaysRemaining(med);

            return (
              <div
                key={med.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  borderLeft: `4px solid ${med.color || 'var(--primary-600)'}`
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{med.name}</h3>
                    {med.genericName && (
                      <span className="text-xs text-muted">{med.genericName}</span>
                    )}
                  </div>

                  <Badge variant={low ? 'warning' : 'primary'}>
                    {med.form}
                  </Badge>
                </div>

                {/* Strength & Dosing */}
                <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>Strength:</strong>
                    <span>{med.strength}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>Dose:</strong>
                    <span>{med.doseAmount} {med.doseUnit}{med.doseAmount > 1 ? 's' : ''} ({med.frequency})</span>
                  </div>
                  {med.schedule.scheduledTimes.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>Times:</strong>
                      <span>{med.schedule.scheduledTimes.map(formatTime12h).join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Supply summary */}
                <div
                  style={{
                    backgroundColor: low ? 'var(--warning-bg)' : 'var(--slate-50)',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ color: low ? 'var(--warning-text)' : 'var(--slate-700)', fontWeight: 600 }}>
                    {med.supply.currentSupply} {med.supply.supplyUnit} left (~{days} days)
                  </span>
                  {low && <span className="badge badge-warning">Low</span>}
                </div>

                {/* Instructions */}
                {med.instructions && (
                  <p className="text-xs text-muted" style={{ fontStyle: 'italic' }}>
                    ℹ {med.instructions}
                  </p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => refillMedication(med.id, med.supply.refillQuantity || 30)}
                  >
                    <Icon name="refresh" size={14} />
                    <span>Refill (+{med.supply.refillQuantity || 30})</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger-text)' }}
                    onClick={() => {
                      if (confirm(`Remove ${med.name} from tracking?`)) {
                        deleteMedication(med.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
