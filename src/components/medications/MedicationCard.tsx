import React from 'react';
import { ScheduledDoseItem } from '../../types/medication';
import { formatTime12h } from '../../utils/dateUtils';
import { formatSupplyLabel } from '../../utils/supplyUtils';
import { Badge } from '../common/Badge';
import { Icon } from '../common/Icon';

interface MedicationCardProps {
  item: ScheduledDoseItem;
  onTake: (doseId: string) => void;
  onSkip?: (doseId: string) => void;
  onUndo?: (doseId: string) => void;
  onSelect?: (medicationId: string) => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  item,
  onTake,
  onSkip,
  onUndo,
  onSelect
}) => {
  const { medication, record, isOverdue } = item;
  const isTaken = record.status === 'taken';
  const isSkipped = record.status === 'skipped';
  const supplyInfo = formatSupplyLabel(medication);

  // Extract 24h time string from scheduledTime ISO
  const time24 = record.scheduledTime.includes('T')
    ? record.scheduledTime.split('T')[1].substring(0, 5)
    : '08:00';
  const formattedTime = formatTime12h(time24);

  // Render status badge
  const renderStatusBadge = () => {
    if (isTaken) {
      return (
        <Badge variant="success" icon={<Icon name="check" size={12} />}>
          Taken
        </Badge>
      );
    }
    if (isSkipped) {
      return (
        <Badge variant="neutral" icon={<Icon name="x" size={12} />}>
          Skipped
        </Badge>
      );
    }
    if (isOverdue) {
      return (
        <Badge variant="danger" icon={<Icon name="alert" size={12} />}>
          Overdue
        </Badge>
      );
    }
    return (
      <Badge variant="primary" icon={<Icon name="clock" size={12} />}>
        Scheduled
      </Badge>
    );
  };

  return (
    <div
      className={`med-card ${isTaken ? 'status-taken' : ''}`}
      style={{ '--card-accent': medication.color || 'var(--primary-600)' } as React.CSSProperties}
    >
      {/* Card Header: Pill icon, Names, and Status */}
      <div className="med-card-header">
        <div className="med-card-title-group" onClick={() => onSelect?.(medication.id)} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
          <div
            className="med-pill-icon"
            style={{
              backgroundColor: medication.color ? `${medication.color}18` : undefined,
              color: medication.color || 'var(--primary-700)'
            }}
          >
            <Icon name={medication.form === 'inhaler' ? 'activity' : 'pill'} size={22} />
          </div>
          <div>
            <h3 className="med-card-name">{medication.name}</h3>
            {medication.genericName && (
              <span className="med-card-generic">{medication.genericName}</span>
            )}
          </div>
        </div>

        <div className="med-card-badge">{renderStatusBadge()}</div>
      </div>

      {/* Strength, Dose amount & Scheduled Time */}
      <div className="med-card-details">
        <div className="med-detail-item font-semibold">
          <span>{medication.strength}</span>
          <span className="text-muted">·</span>
          <span>
            {medication.doseAmount} {medication.doseUnit}
            {medication.doseAmount > 1 && !medication.doseUnit.endsWith('s') ? 's' : ''}
          </span>
        </div>

        <div className="med-detail-item text-muted">
          <Icon name="clock" size={15} />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Instructions / Caution if present */}
      {medication.instructions && (
        <div className="text-xs text-muted" style={{ fontStyle: 'italic' }}>
          ℹ {medication.instructions}
        </div>
      )}

      {/* Footer: Supply remaining counter & Action button */}
      <div className="med-card-footer">
        <div
          className={`med-supply-info ${
            supplyInfo.isOut ? 'is-out' : supplyInfo.isLow ? 'is-low' : ''
          }`}
        >
          {supplyInfo.isLow && <Icon name="alert" size={14} />}
          <span>{supplyInfo.text}</span>
        </div>

        <div className="med-actions-group">
          {isTaken ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onUndo?.(record.id)}
              title="Undo taken dose"
              aria-label="Undo taken dose"
            >
              <Icon name="rotate-ccw" size={14} />
              <span>Undo</span>
            </button>
          ) : (
            <>
              {onSkip && !isSkipped && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => onSkip(record.id)}
                  title="Skip this dose"
                  aria-label="Skip dose"
                >
                  Skip
                </button>
              )}
              {isSkipped ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onUndo?.(record.id)}
                >
                  <Icon name="rotate-ccw" size={14} />
                  <span>Undo</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-take"
                  onClick={() => onTake(record.id)}
                  aria-label={`Take ${medication.name}`}
                >
                  <Icon name="check" size={16} />
                  <span>Take</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
