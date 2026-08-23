import React, { useState } from 'react';
import { useMedications } from '../hooks/useMedications';
import { AppView } from '../types/navigation';
import { Medication, TimeOfDay } from '../types/medication';
import { MedicationCard } from '../components/medications/MedicationCard';
import { SupplyAlertCard } from '../components/medications/SupplyAlertCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { Icon } from '../components/common/Icon';
import { calculateDaysRemaining } from '../utils/supplyUtils';
import { InteractionService } from '../services/InteractionService';
import { MedicationDetailsModal } from '../components/medications/MedicationDetailsModal';
import { InteractionCheckerModal } from '../components/medications/InteractionCheckerModal';
import { PhotoLightboxModal } from '../components/common/PhotoLightboxModal';

interface TodayViewProps {
  onNavigate: (view: AppView) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({ onNavigate }) => {
  const {
    medications,
    todayDoses,
    asNeededMedications,
    lowSupplyMedications,
    stats,
    isLoading,
    takeDose,
    skipDose,
    undoDose,
    logPrnDose,
    refillMedication
  } = useMedications();

  const [activeFilter, setActiveFilter] = useState<'all' | TimeOfDay | 'pending'>('all');
  const [prnNotice, setPrnNotice] = useState<string>('');
  const [selectedMedForDetails, setSelectedMedForDetails] = useState<Medication | null>(null);
  const [selectedMedForPhoto, setSelectedMedForPhoto] = useState<Medication | null>(null);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [acknowledgedFingerprint, setAcknowledgedFingerprint] = useState<string>(() => {
    try {
      return localStorage.getItem('medtrack_acknowledged_interactions') || '';
    } catch {
      return '';
    }
  });

  if (isLoading) {
    return (
      <div className="empty-state">
        <Icon name="refresh" size={32} className="text-primary" />
        <h3>Loading your daily schedule...</h3>
      </div>
    );
  }

  const interactions = InteractionService.analyzeCabinetInteractions(medications);
  const currentFingerprint = interactions.map((i) => i.id).sort().join(',');
  const isAcknowledged = interactions.length > 0 && acknowledgedFingerprint === currentFingerprint;
  const isBannerVisible = interactions.length > 0 && !isAcknowledged;

  const handleAcknowledge = () => {
    try {
      localStorage.setItem('medtrack_acknowledged_interactions', currentFingerprint);
    } catch (e) {
      console.error('Failed to save acknowledgement:', e);
    }
    setAcknowledgedFingerprint(currentFingerprint);
  };

  // Filter scheduled doses
  const filteredDoses = todayDoses.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return item.record.status === 'scheduled';
    return item.record.timeOfDay === activeFilter;
  });

  const handleLogPrn = async (medId: string, medName: string) => {
    await logPrnDose(medId);
    setPrnNotice(`Logged 1 dose of ${medName}!`);
    setTimeout(() => setPrnNotice(''), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Notice */}
      {prnNotice && (
        <div
          style={{
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success-text)',
            border: '1px solid var(--success-border)',
            padding: '0.875rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <Icon name="check-circle" size={18} />
          <span>{prnNotice}</span>
        </div>
      )}

      {/* Safety & Drug Interactions Banner - Dismissible once read */}
      {isBannerVisible && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
            <span style={{ fontSize: '1.35rem' }}>🛡️</span>
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.875rem' }}>
                Safety & Food Warnings ({interactions.length} active notice{interactions.length > 1 ? 's' : ''})
              </strong>
              <p className="text-xs text-muted" style={{ margin: '0.15rem 0 0 0', color: '#b45309' }}>
                Includes Grapefruit, Alcohol, and medication combination precautions.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ backgroundColor: '#ffffff', color: '#92400e', borderColor: '#fcd34d' }}
              onClick={() => setIsInteractionModalOpen(true)}
            >
              View Report
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: '#92400e' }}
              onClick={handleAcknowledge}
              title="Acknowledge and dismiss from main screen"
            >
              <Icon name="check" size={14} />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Daily Progress & Adherence Summary Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #ffffff, #f0fdfa)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <span className="text-xs font-semibold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Today's Adherence
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-800)' }}>
                {stats.takenCount} of {stats.totalScheduled} Doses Taken
              </h2>
              <span className="text-sm font-semibold" style={{ color: 'var(--primary-600)' }}>
                ({stats.adherencePercentage}%)
              </span>
            </div>
          </div>

          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-100)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem'
            }}
          >
            {stats.adherencePercentage}%
          </div>
        </div>

        <ProgressBar
          progress={stats.adherencePercentage}
          height={10}
          color={stats.adherencePercentage === 100 ? 'var(--success-solid)' : 'var(--primary-600)'}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
          <span>Scheduled: <strong>{stats.totalScheduled}</strong></span>
          <span>Taken: <strong>{stats.takenCount}</strong></span>
          <span>Pending: <strong>{stats.pendingCount}</strong></span>
        </div>
      </div>

      {/* 2. Low Supply Alerts Section */}
      {lowSupplyMedications.length > 0 && (
        <section aria-labelledby="low-supply-heading">
          <div className="section-header" style={{ marginBottom: '0.75rem' }}>
            <h3 id="low-supply-heading" className="section-title" style={{ color: 'var(--warning-text)' }}>
              <Icon name="alert" size={18} />
              <span>Supply Alerts ({lowSupplyMedications.length})</span>
            </h3>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('refills')}
            >
              View Refill Center →
            </button>
          </div>

          <div className="grid-cards">
            {lowSupplyMedications.map((med) => (
              <SupplyAlertCard
                key={med.id}
                medication={med}
                onRefill={(id) => refillMedication(id, med.supply.refillQuantity || 30)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Today's Scheduled Regimen Section */}
      <section aria-labelledby="today-doses-heading">
        <div className="section-header">
          <h3 id="today-doses-heading" className="section-title">
            <Icon name="calendar" size={18} />
            <span>Today's Scheduled Regimen</span>
          </h3>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({todayDoses.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('pending')}
          >
            Pending ({stats.pendingCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === 'morning' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('morning')}
          >
            Morning
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === 'afternoon' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('afternoon')}
          >
            Afternoon
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === 'evening' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('evening')}
          >
            Evening
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === 'bedtime' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('bedtime')}
          >
            Bedtime
          </button>
        </div>

        {/* Medication Cards List */}
        {filteredDoses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="check-circle" size={28} />
            </div>
            <h4>No scheduled doses in this view</h4>
            <p className="text-muted text-sm">
              {stats.pendingCount === 0 && stats.totalScheduled > 0
                ? "You have completed all scheduled doses for today!"
                : "No medications match the current filter."}
            </p>
            {activeFilter !== 'all' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '0.5rem' }}
                onClick={() => setActiveFilter('all')}
              >
                View All Medications ({todayDoses.length})
              </button>
            )}
          </div>
        ) : (
          <div className="grid-cards">
            {filteredDoses.map((item) => (
              <MedicationCard
                key={item.record.id}
                item={item}
                onTake={takeDose}
                onSkip={skipDose}
                onUndo={undoDose}
                onSelect={(medId) => {
                  const found = medications.find((m) => m.id === medId);
                  if (found) setSelectedMedForDetails(found);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. As-Needed (PRN) Medications Section */}
      {asNeededMedications.length > 0 && (
        <section aria-labelledby="prn-heading" style={{ marginTop: '0.5rem' }}>
          <div className="section-header">
            <h3 id="prn-heading" className="section-title">
              <Icon name="activity" size={18} />
              <span>As-Needed (PRN) Medications</span>
            </h3>
            <span className="text-xs text-muted">Take whenever required</span>
          </div>

          <div className="grid-cards">
            {asNeededMedications.map((med) => {
              const daysRemaining = calculateDaysRemaining(med);
              return (
                <div
                  key={med.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    borderLeft: `4px solid ${med.color || 'var(--primary-600)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    >
                      {med.imageUrl && (
                        <img
                          src={med.imageUrl}
                          alt={med.name}
                          style={{
                            width: '44px',
                            height: '44px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            border: `2px solid ${med.color || 'var(--primary-500)'}`,
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'zoom-in'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMedForPhoto(med);
                          }}
                          title="Tap to enlarge photo"
                        />
                      )}
                      <div
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedMedForDetails(med)}
                        title="Click to view info and food warnings"
                      >
                        <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                          {med.name} ℹ️
                        </h4>
                        <span className="text-xs text-muted">
                          {med.strength} · {med.doseAmount} {med.doseUnit}{med.doseAmount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <span className="badge badge-primary">As-Needed</span>
                  </div>

                  {med.instructions && (
                    <p className="text-xs text-muted" style={{ fontStyle: 'italic' }}>
                      ℹ {med.instructions}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <span className="text-xs text-muted font-semibold">
                      {med.supply.currentSupply} {med.supply.supplyUnit} left (~{daysRemaining} days)
                    </span>

                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedMedForDetails(med)}
                        title="View info and food restrictions"
                      >
                        Info
                      </button>

                      <button
                        type="button"
                        className="btn btn-take btn-sm"
                        onClick={() => handleLogPrn(med.id, med.name)}
                      >
                        <Icon name="plus" size={14} />
                        <span>Log Dose</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Medication Details & Warnings Modal */}
      <MedicationDetailsModal
        medication={selectedMedForDetails}
        isOpen={selectedMedForDetails !== null}
        onClose={() => setSelectedMedForDetails(null)}
      />

      {/* Safety & Interactions Modal */}
      <InteractionCheckerModal
        medications={medications}
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        onAcknowledge={handleAcknowledge}
        isAcknowledged={isAcknowledged}
      />

      {/* Enlarged Photo Lightbox Modal */}
      <PhotoLightboxModal
        isOpen={selectedMedForPhoto !== null}
        onClose={() => setSelectedMedForPhoto(null)}
        imageUrl={selectedMedForPhoto?.imageUrl}
        title={selectedMedForPhoto?.name || ''}
        subtitle={selectedMedForPhoto ? `${selectedMedForPhoto.strength} · ${selectedMedForPhoto.form}` : undefined}
      />
    </div>
  );
};
