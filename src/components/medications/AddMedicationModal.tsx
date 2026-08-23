import React, { useState } from 'react';
import { Medication, MedicationForm, ScheduleFrequency } from '../../types/medication';
import { Icon } from '../common/Icon';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Medication>;
}

const COLOR_OPTIONS = [
  '#0d9488', // Teal
  '#0284c7', // Sky Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ef4444'  // Red
];

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [form, setForm] = useState<MedicationForm>('tablet');
  const [strength, setStrength] = useState('');
  const [doseAmount, setDoseAmount] = useState<number>(1);
  const [doseUnit, setDoseUnit] = useState('tablet');
  const [frequency, setFrequency] = useState<ScheduleFrequency>('once-daily');
  
  // Scheduled times for frequencies
  const [time1, setTime1] = useState('08:00');
  const [time2, setTime2] = useState('20:00');
  const [time3, setTime3] = useState('13:00');
  const [time4, setTime4] = useState('22:00');

  const [currentSupply, setCurrentSupply] = useState<number>(30);
  const [lowSupplyThreshold, setLowSupplyThreshold] = useState<number>(7);
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#0d9488');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setGenericName('');
    setForm('tablet');
    setStrength('');
    setDoseAmount(1);
    setDoseUnit('tablet');
    setFrequency('once-daily');
    setTime1('08:00');
    setTime2('20:00');
    setTime3('13:00');
    setTime4('22:00');
    setCurrentSupply(30);
    setLowSupplyThreshold(7);
    setInstructions('');
    setNotes('');
    setColor('#0d9488');
    setErrorMsg('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Medication name is required');
      return;
    }
    if (!strength.trim()) {
      setErrorMsg('Strength (e.g. 500 mg) is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const scheduledTimes: string[] = [];
      if (frequency === 'once-daily') {
        scheduledTimes.push(time1 || '08:00');
      } else if (frequency === 'twice-daily') {
        scheduledTimes.push(time1 || '08:00', time2 || '20:00');
      } else if (frequency === 'three-times-daily') {
        scheduledTimes.push(time1 || '08:00', time3 || '13:00', time2 || '20:00');
      } else if (frequency === 'four-times-daily') {
        scheduledTimes.push(time1 || '08:00', time3 || '12:00', time2 || '18:00', time4 || '22:00');
      }

      await onAdd({
        name: name.trim(),
        genericName: genericName.trim() || undefined,
        form,
        strength: strength.trim(),
        doseAmount: Math.max(0.25, Number(doseAmount) || 1),
        doseUnit: doseUnit.trim() || 'tablet',
        frequency,
        schedule: {
          id: `sched-${Date.now()}`,
          medicationId: '',
          frequency,
          scheduledTimes,
          startDate: new Date().toISOString().split('T')[0],
          isActive: true
        },
        supply: {
          currentSupply: Math.max(0, Number(currentSupply) || 0),
          lowSupplyThreshold: Math.max(1, Number(lowSupplyThreshold) || 7),
          supplyUnit: doseUnit + (doseAmount > 1 || Number(currentSupply) > 1 ? 's' : ''),
          refillQuantity: 30
        },
        instructions: instructions.trim() || undefined,
        notes: notes.trim() || undefined,
        color,
        isActive: true
      });

      resetForm();
      onClose();
    } catch (err) {
      console.error('Failed to add medication:', err);
      setErrorMsg('Failed to save medication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="pill" size={22} className="text-primary" />
            <h2>Add Medication</h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={handleClose}
            aria-label="Close"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMsg && (
              <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Medication Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Metformin, Lisinopril, Aspirin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Generic / Brand Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Metformin HCl / Glucophage"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Strength *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 500 mg, 10 mg, 90 mcg"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Form</label>
                <select
                  className="form-select"
                  value={form}
                  onChange={(e) => {
                    const f = e.target.value as MedicationForm;
                    setForm(f);
                    if (f === 'tablet') setDoseUnit('tablet');
                    else if (f === 'capsule') setDoseUnit('capsule');
                    else if (f === 'inhaler') setDoseUnit('puff');
                    else if (f === 'liquid') setDoseUnit('ml');
                    else if (f === 'drops') setDoseUnit('drop');
                    else setDoseUnit('dose');
                  }}
                >
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="liquid">Liquid</option>
                  <option value="inhaler">Inhaler</option>
                  <option value="injection">Injection</option>
                  <option value="drops">Drops</option>
                  <option value="topical">Topical / Cream</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dose Size (per intake)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="0.25"
                    step="any"
                    className="form-input"
                    value={doseAmount}
                    onChange={(e) => setDoseAmount(parseFloat(e.target.value) || 1)}
                    style={{ width: '80px' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="unit (e.g. tablet)"
                    value={doseUnit}
                    onChange={(e) => setDoseUnit(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select
                className="form-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
              >
                <option value="once-daily">Once Daily</option>
                <option value="twice-daily">Twice Daily</option>
                <option value="three-times-daily">Three Times Daily</option>
                <option value="four-times-daily">Four Times Daily</option>
                <option value="as-needed">As Needed (PRN / When required)</option>
              </select>
            </div>

            {/* Frequency specific time pickers */}
            {frequency === 'once-daily' && (
              <div className="form-group">
                <label className="form-label">Scheduled Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={time1}
                  onChange={(e) => setTime1(e.target.value)}
                />
              </div>
            )}

            {frequency === 'twice-daily' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Morning Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={time1}
                    onChange={(e) => setTime1(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Evening Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={time2}
                    onChange={(e) => setTime2(e.target.value)}
                  />
                </div>
              </div>
            )}

            {frequency === 'three-times-daily' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Morning</label>
                  <input type="time" className="form-input" value={time1} onChange={(e) => setTime1(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Midday</label>
                  <input type="time" className="form-input" value={time3} onChange={(e) => setTime3(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Evening</label>
                  <input type="time" className="form-input" value={time2} onChange={(e) => setTime2(e.target.value)} />
                </div>
              </div>
            )}

            {frequency === 'four-times-daily' && (
              <div className="form-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="form-group">
                  <label className="form-label">Dose 1 (Morning)</label>
                  <input type="time" className="form-input" value={time1} onChange={(e) => setTime1(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Dose 2 (Noon)</label>
                  <input type="time" className="form-input" value={time3} onChange={(e) => setTime3(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Dose 3 (Evening)</label>
                  <input type="time" className="form-input" value={time2} onChange={(e) => setTime2(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Dose 4 (Bedtime)</label>
                  <input type="time" className="form-input" value={time4} onChange={(e) => setTime4(e.target.value)} />
                </div>
              </div>
            )}

            {frequency === 'as-needed' && (
              <div style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-text)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                ℹ️ <strong>As-Needed (PRN):</strong> This medication has no fixed daily time. It will appear on your Today dashboard in the "As-Needed" section so you can log a dose whenever taken.
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Current Supply Count</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={currentSupply}
                  onChange={(e) => setCurrentSupply(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={lowSupplyThreshold}
                  onChange={(e) => setLowSupplyThreshold(parseInt(e.target.value, 10) || 7)}
                />
              </div>
            </div>

            {/* Pill Color Tag */}
            <div className="form-group">
              <label className="form-label">Pill / Tag Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: c,
                      border: color === c ? '3px solid #0f172a' : '2px solid transparent',
                      transform: color === c ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Dosing Instructions</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Take with food or full glass of water"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Personal Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Prescribed for 3 months review"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
