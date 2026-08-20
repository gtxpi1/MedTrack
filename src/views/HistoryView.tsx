import React from 'react';
import { useMedications } from '../hooks/useMedications';
import { formatTakenTime } from '../utils/dateUtils';
import { Badge } from '../components/common/Badge';
import { Icon } from '../components/common/Icon';

export const HistoryView: React.FC = () => {
  const { historyRecords, stats, isLoading } = useMedications();

  if (isLoading) {
    return (
      <div className="empty-state">
        <Icon name="refresh" size={32} />
        <p>Loading history records...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metrics Row */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
            <Icon name="trend" size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.adherencePercentage}%</div>
            <div className="stat-label">Today's Adherence</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-solid)' }}>
            <Icon name="check-circle" size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.takenCount}</div>
            <div className="stat-label">Doses Taken Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-solid)' }}>
            <Icon name="history" size={24} />
          </div>
          <div>
            <div className="stat-val">{historyRecords.length}</div>
            <div className="stat-label">Total Logged Doses</div>
          </div>
        </div>
      </div>

      {/* History Log Table / List */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h3 className="section-title">
            <Icon name="history" size={18} />
            <span>Recent Dose History</span>
          </h3>
          <span className="text-xs text-muted">Showing latest records</span>
        </div>

        {historyRecords.length === 0 ? (
          <div className="empty-state">
            <Icon name="history" size={28} />
            <p>No dose history recorded yet. As you mark medications as taken, records will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {historyRecords.map((record) => {
              const medName = record.medication ? record.medication.name : 'Unknown Medication';
              const strength = record.medication ? record.medication.strength : '';
              const dateStr = record.scheduledTime.split('T')[0];
              const time24 = record.scheduledTime.split('T')[1]?.substring(0, 5) || '';

              return (
                <div
                  key={record.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor:
                          record.status === 'taken'
                            ? 'var(--success-bg)'
                            : record.status === 'skipped'
                            ? 'var(--slate-100)'
                            : 'var(--primary-50)',
                        color:
                          record.status === 'taken'
                            ? 'var(--success-solid)'
                            : record.status === 'skipped'
                            ? 'var(--slate-500)'
                            : 'var(--primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon
                        name={
                          record.status === 'taken'
                            ? 'check'
                            : record.status === 'skipped'
                            ? 'x'
                            : 'clock'
                        }
                        size={18}
                      />
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                        {medName} {strength && `(${strength})`}
                      </div>
                      <div className="text-xs text-muted">
                        Scheduled for {dateStr} at {time24}
                        {record.takenTime && ` · Taken at ${formatTakenTime(record.takenTime)}`}
                        {record.notes && ` (${record.notes})`}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Badge
                      variant={
                        record.status === 'taken'
                          ? 'success'
                          : record.status === 'skipped'
                          ? 'neutral'
                          : 'primary'
                      }
                    >
                      {record.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
