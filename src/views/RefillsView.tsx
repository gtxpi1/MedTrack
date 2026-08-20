import React from 'react';
import { useMedications } from '../hooks/useMedications';
import { calculateDaysRemaining, isLowSupply } from '../utils/supplyUtils';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { Icon } from '../components/common/Icon';

export const RefillsView: React.FC = () => {
  const { medications, refillMedication, updateSupply, isLoading } = useMedications();

  if (isLoading) {
    return (
      <div className="empty-state">
        <Icon name="refresh" size={32} />
        <p>Loading supply inventory...</p>
      </div>
    );
  }

  const lowSupplyMeds = medications.filter((m) => isLowSupply(m));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Low supply callout banner if any */}
      {lowSupplyMeds.length > 0 && (
        <div className="card" style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Icon name="alert" size={24} className="text-warning" />
            <div>
              <h3 style={{ color: 'var(--warning-text)', fontSize: '1.125rem' }}>
                Refill Attention Required
              </h3>
              <p className="text-xs text-muted" style={{ color: 'var(--warning-text)' }}>
                {lowSupplyMeds.length} medication{lowSupplyMeds.length > 1 ? 's are' : ' is'} at or below your low-stock threshold.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full Medication Inventory Table/Cards */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '1.25rem' }}>
          <h3 className="section-title">
            <Icon name="refills" size={18} />
            <span>Medication Supply & Refill Manager</span>
          </h3>
          <span className="text-xs text-muted">{medications.length} items tracked</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {medications.map((med) => {
            const low = isLowSupply(med);
            const daysRemaining = calculateDaysRemaining(med);
            const maxSupplyEstimate = (med.supply.refillQuantity || 60) * 1.5;
            const supplyPercent = Math.min(100, Math.round((med.supply.currentSupply / maxSupplyEstimate) * 100));

            return (
              <div
                key={med.id}
                style={{
                  border: `1px solid ${low ? 'var(--warning-border)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  backgroundColor: low ? '#fffdf7' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                      {med.name} <span className="text-muted text-sm font-normal">({med.strength})</span>
                    </h4>
                    {med.supply.prescriptionNumber && (
                      <span className="text-xs text-muted">Rx: {med.supply.prescriptionNumber}</span>
                    )}
                  </div>

                  <Badge variant={low ? 'warning' : 'success'}>
                    {low ? `Low: ~${daysRemaining} days left` : `Healthy: ~${daysRemaining} days left`}
                  </Badge>
                </div>

                {/* Supply Level Meter */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <span className="font-semibold">
                      Current Supply: {med.supply.currentSupply} {med.supply.supplyUnit}
                    </span>
                    <span className="text-muted">
                      Low-stock threshold: {med.supply.lowSupplyThreshold}
                    </span>
                  </div>
                  <ProgressBar
                    progress={supplyPercent}
                    height={8}
                    color={low ? 'var(--warning-solid)' : 'var(--primary-600)'}
                  />
                </div>

                {/* Pharmacy Info if available */}
                {(med.supply.pharmacyName || med.supply.pharmacyPhone) && (
                  <div className="text-xs text-muted" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {med.supply.pharmacyName && <span>🏥 Pharmacy: {med.supply.pharmacyName}</span>}
                    {med.supply.pharmacyPhone && <span>📞 Phone: {med.supply.pharmacyPhone}</span>}
                    {med.supply.lastRefillDate && <span>📅 Last Refill: {med.supply.lastRefillDate}</span>}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const input = prompt(`Update current supply count for ${med.name}:`, String(med.supply.currentSupply));
                      if (input !== null) {
                        const parsed = parseInt(input, 10);
                        if (!isNaN(parsed) && parsed >= 0) {
                          updateSupply(med.id, parsed);
                        }
                      }
                    }}
                  >
                    Adjust Count
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => refillMedication(med.id, med.supply.refillQuantity || 30)}
                  >
                    <Icon name="refresh" size={14} />
                    <span>Record Refill (+{med.supply.refillQuantity || 30})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
