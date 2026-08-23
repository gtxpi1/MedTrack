import React, { useState } from 'react';
import { useMedications } from '../hooks/useMedications';
import { Medication } from '../types/medication';
import { formatTime12h } from '../utils/dateUtils';
import { calculateDaysRemaining, isLowSupply } from '../utils/supplyUtils';
import { MedicationDatabaseService } from '../services/MedicationDatabaseService';
import { InteractionService } from '../services/InteractionService';
import { Badge } from '../components/common/Badge';
import { Icon } from '../components/common/Icon';
import { AdjustSupplyModal } from '../components/medications/AdjustSupplyModal';
import { EditMedicationModal } from '../components/medications/EditMedicationModal';
import { MedicationDetailsModal } from '../components/medications/MedicationDetailsModal';
import { InteractionCheckerModal } from '../components/medications/InteractionCheckerModal';

interface MedicationsViewProps {
  onOpenAddModal: () => void;
}

export const MedicationsView: React.FC<MedicationsViewProps> = ({ onOpenAddModal }) => {
  const { medications, deleteMedication, updateMedication, updateSupply, isLoading } = useMedications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedForSupply, setSelectedMedForSupply] = useState<Medication | null>(null);
  const [selectedMedForDetails, setSelectedMedForDetails] = useState<Medication | null>(null);
  const [selectedMedForEdit, setSelectedMedForEdit] = useState<Medication | null>(null);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="empty-state">
        <Icon name="refresh" size={32} />
        <p>Loading medications...</p>
      </div>
    );
  }

  const interactions = InteractionService.analyzeCabinetInteractions(medications);

  const filteredMeds = medications.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.genericName && m.genericName.toLowerCase().includes(q)) ||
      (m.brandName && m.brandName.toLowerCase().includes(q)) ||
      m.strength.toLowerCase().includes(q)
    );
  });

  const directorySuggestions = searchQuery.trim().length > 0 && filteredMeds.length === 0
    ? MedicationDatabaseService.searchMedications(searchQuery)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header controls: Search & Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '380px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}>
            <Icon name="search" size={18} />
          </span>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search saved medications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              onClick={() => setSearchQuery('')}
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              borderColor: interactions.length > 0 ? '#f59e0b' : undefined,
              backgroundColor: interactions.length > 0 ? '#fffbeb' : undefined,
              color: interactions.length > 0 ? '#92400e' : undefined
            }}
            onClick={() => setIsInteractionModalOpen(true)}
            title="Check drug-drug interactions and food restrictions"
          >
            <Icon name="alert" size={18} />
            <span>Safety & Interactions {interactions.length > 0 && `(${interactions.length})`}</span>
          </button>

          <button type="button" className="btn btn-primary" onClick={onOpenAddModal}>
            <Icon name="plus" size={18} />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Medication List */}
      {filteredMeds.length === 0 ? (
        <div className="empty-state" style={{ padding: '2.5rem 1.5rem' }}>
          <div className="empty-icon">
            <Icon name="search" size={28} />
          </div>
          <h4>
            {searchQuery
              ? `"${searchQuery}" is not in your saved cabinet yet`
              : 'No medications in your cabinet'}
          </h4>
          <p className="text-muted text-sm" style={{ maxWidth: '450px' }}>
            {searchQuery
              ? `You can add "${searchQuery}" to start tracking schedules, doses, and refill inventory.`
              : 'Click "Add Medication" to create your first prescription or OTC tracker.'}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '0.75rem' }}
            onClick={onOpenAddModal}
          >
            <Icon name="plus" size={18} />
            <span>{searchQuery ? `Add "${searchQuery}" to Cabinet` : 'Add Medication'}</span>
          </button>

          {/* Directory hints */}
          {directorySuggestions.length > 0 && (
            <div style={{ marginTop: '1.5rem', textAlign: 'left', width: '100%', maxWidth: '450px' }}>
              <span className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase' }}>
                Medication Directory Matches:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {directorySuggestions.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.625rem 0.875rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong>{s.name}</strong>
                      {s.genericName && s.genericName !== s.name && (
                        <div className="text-xs text-muted">{s.genericName}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={onOpenAddModal}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedMedForDetails(med)}
                    title="Click to view full medication details and food warnings"
                  >
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                      {med.name} ℹ️
                    </h3>
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

                {/* Supply summary - Clickable to edit */}
                <div
                  onClick={() => setSelectedMedForSupply(med)}
                  title="Click to edit pill count"
                  style={{
                    backgroundColor: low ? 'var(--warning-bg)' : 'var(--slate-50)',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    border: '1px dashed transparent',
                    transition: 'border-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-500)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <span style={{ color: low ? 'var(--warning-text)' : 'var(--slate-700)', fontWeight: 600 }}>
                    {med.supply.currentSupply} {med.supply.supplyUnit} left (~{days} days) ✏️
                  </span>
                  {low ? (
                    <span className="badge badge-warning">Low</span>
                  ) : (
                    <span className="text-xs text-muted" style={{ textDecoration: 'underline' }}>Edit</span>
                  )}
                </div>

                {/* Instructions */}
                {med.instructions && (
                  <p className="text-xs text-muted" style={{ fontStyle: 'italic' }}>
                    ℹ {med.instructions}
                  </p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedMedForDetails(med)}
                      title="View what to avoid eating/drinking and clinical guide"
                    >
                      <Icon name="pill" size={14} />
                      <span>Info</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedMedForEdit(med)}
                      title="Edit medication name, strength, and schedule"
                    >
                      <Icon name="settings" size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedMedForSupply(med)}
                      title="Edit current pill count"
                    >
                      <Icon name="package" size={14} />
                      <span>Count</span>
                    </button>
                  </div>

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

      {/* Edit Medication Modal */}
      <EditMedicationModal
        medication={selectedMedForEdit}
        isOpen={selectedMedForEdit !== null}
        onClose={() => setSelectedMedForEdit(null)}
        onUpdate={updateMedication}
      />

      {/* Adjust Supply Modal */}
      <AdjustSupplyModal
        medication={selectedMedForSupply}
        isOpen={selectedMedForSupply !== null}
        onClose={() => setSelectedMedForSupply(null)}
        onSaveSupply={updateSupply}
      />

      {/* Medication Details & Food Precautions Modal */}
      <MedicationDetailsModal
        medication={selectedMedForDetails}
        isOpen={selectedMedForDetails !== null}
        onClose={() => setSelectedMedForDetails(null)}
        onOpenSupplyEditor={(med) => setSelectedMedForSupply(med)}
        onEditMedication={(med) => setSelectedMedForEdit(med)}
      />

      {/* Safety & Interactions Modal */}
      <InteractionCheckerModal
        medications={medications}
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
      />
    </div>
  );
};
