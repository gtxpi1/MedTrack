import React, { useState } from 'react';
import { useMedications } from '../hooks/useMedications';
import { AppView } from '../types/navigation';
import { MedicationCard } from '../components/medications/MedicationCard';
import { SupplyAlertCard } from '../components/medications/SupplyAlertCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { Icon } from '../components/common/Icon';
import { TimeOfDay } from '../types/medication';
import { calculateDaysRemaining } from '../utils/supplyUtils';

interface TodayViewProps {
  onNavigate: (view: AppView) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({ onNavigate }) => {
  const {
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

  if (isLoading) {
    return (
      <div className="empty-state">
        <Icon name="refresh" size={32} className="text-primary" />
        <h3>Loading your daily schedule...</h3>
      </div>
    );
  }

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
              fontWeight: 700
            }}
          >
            {stats.adherencePercentage === 100 && stats.totalScheduled > 0 ? (
              <Icon name="check" size={24} />
            ) : (
              <Icon name="pill" size={22} />
            )}
          </div>
        </div>

        <ProgressBar progress={stats.adherencePercentage} height={10} />
      </div>

      {/* 2. Low Supply Alerts Section */}
      {lowSupplyMedications.length > 0 && (
        <section aria-labelledby="low-supply-heading">
          <div className="section-header">
            <h3 id="low-supply-heading" className="section-title" style={{ color: 'var(--warning-text)' }}>
              <Icon name="alert" size={18} />
              <span>Medications Running Low ({lowSupplyMedications.length})</span>
            </h3>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('refills')}
            >
              Manage Refills →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lowSupplyMedications.map((med) => (
              <SupplyAlertCard
                key={med.id}
                medication={med}
                onRefill={(id) => refillMedication(id, med.supply.refillQuantity || 30)}
                onNavigateRefills={() => onNavigate('refills')}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Today's Scheduled Medications */}
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
                onSelect={() => onNavigate('medications')}
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
                    <div>
                      <h4 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{med.name}</h4>
                      <span className="text-xs text-muted">
                        {med.strength} · {med.doseAmount} {med.doseUnit}{med.doseAmount > 1 ? 's' : ''}
                      </span>
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
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
