import React from 'react';
import { useMedications } from '../hooks/useMedications';
import { TimeOfDay } from '../types/medication';
import { formatTime12h } from '../utils/dateUtils';
import { Icon } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';

export const ScheduleView: React.FC = () => {
  const { todayDoses, takeDose, undoDose, isLoading } = useMedications();

  if (isLoading) {
    return (
      <div className="empty-state">
        <Icon name="refresh" size={32} />
        <p>Loading schedule...</p>
      </div>
    );
  }

  const periods: Array<{ id: TimeOfDay; label: string; icon: string; timeRange: string }> = [
    { id: 'morning', label: 'Morning', icon: 'morning', timeRange: '6:00 AM - 12:00 PM' },
    { id: 'afternoon', label: 'Afternoon', icon: 'afternoon', timeRange: '12:00 PM - 5:00 PM' },
    { id: 'evening', label: 'Evening', icon: 'evening', timeRange: '5:00 PM - 9:00 PM' },
    { id: 'bedtime', label: 'Bedtime / Night', icon: 'bedtime', timeRange: '9:00 PM onwards' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ backgroundColor: '#ffffff' }}>
        <p className="text-sm text-muted">
          Your full daily dosing schedule organized by time period. Mark doses as taken as your day progresses.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {periods.map((period) => {
          const periodDoses = todayDoses.filter((d) => d.record.timeOfDay === period.id);

          return (
            <div key={period.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-50)',
                      color: 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon name={period.icon} size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem' }}>{period.label}</h3>
                    <span className="text-xs text-muted">{period.timeRange}</span>
                  </div>
                </div>

                <Badge variant={periodDoses.length > 0 ? 'primary' : 'neutral'}>
                  {periodDoses.length} {periodDoses.length === 1 ? 'med' : 'meds'}
                </Badge>
              </div>

              {periodDoses.length === 0 ? (
                <p className="text-sm text-muted" style={{ fontStyle: 'italic', padding: '0.5rem 0' }}>
                  No medications scheduled for {period.label.toLowerCase()}.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {periodDoses.map((dose) => {
                    const isTaken = dose.record.status === 'taken';
                    const time24 = dose.record.scheduledTime.split('T')[1].substring(0, 5);

                    return (
                      <div
                        key={dose.record.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.875rem',
                          backgroundColor: isTaken ? 'var(--slate-50)' : '#ffffff',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: dose.medication.color || 'var(--primary-600)'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                              {dose.medication.name}
                            </div>
                            <div className="text-xs text-muted">
                              {dose.medication.strength} · {dose.medication.doseAmount} {dose.medication.doseUnit} · {formatTime12h(time24)}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isTaken ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => undoDose(dose.record.id)}
                            >
                              <Icon name="check" size={14} className="text-success" />
                              <span>Taken (Undo)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-take btn-sm"
                              onClick={() => takeDose(dose.record.id)}
                            >
                              <Icon name="check" size={14} />
                              <span>Take</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
