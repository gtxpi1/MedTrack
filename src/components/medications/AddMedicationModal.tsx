import React, { useState } from 'react';
import { Medication, MedicationForm, ScheduleFrequency } from '../../types/medication';
import { Icon } from '../common/Icon';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Medication>;
}

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
  const [time1, setTime1] = useState('08:00');
  const [time2, setTime2] = useState('20:00');
  const [currentSupply, setCurrentSupply] = useState<number>(30);
  const [lowSupplyThreshold, setLowSupplyThreshold] = useState<number>(7);
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !strength.trim()) return;

    setIsSubmitting(true);
    try {
      const scheduledTimes: string[] = [];
      if (frequency === 'once-daily') {
        scheduledTimes.push(time1);
      } else if (frequency === 'twice-daily') {
        scheduledTimes.push(time1, time2);
      } else if (frequency === 'three-times-daily') {
        scheduledTimes.push('08:00', '13:00', '20:00');
      }

      await onAdd({
        name: name.trim(),
        genericName: genericName.trim() || undefined,
        form,
        strength: strength.trim(),
        doseAmount: Number(doseAmount) || 1,
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
          currentSupply: Number(currentSupply) || 0,
          lowSupplyThreshold: Number(lowSupplyThreshold) || 7,
          supplyUnit: doseUnit + 's',
          refillQuantity: 30
        },
        instructions: instructions.trim() || undefined,
        notes: notes.trim() || undefined,
        color: '#0d9488',
        isActive: true
      });

      onClose();
    } catch (err) {
      console.error('Failed to add medication:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="pill" size={22} className="text-primary" />
            <h2>Add Medication</h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Medication Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Metformin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Generic Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Metformin HCl"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Strength *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 500 mg"
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
                    setDoseUnit(f === 'tablet' ? 'tablet' : f === 'capsule' ? 'capsule' : f === 'inhaler' ? 'puff' : 'dose');
                  }}
                >
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="liquid">Liquid</option>
                  <option value="inhaler">Inhaler</option>
                  <option value="injection">Injection</option>
                  <option value="drops">Drops</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dose Size (per intake)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={doseAmount}
                    onChange={(e) => setDoseAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
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

            <div className="form-row">
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
                  <option value="as-needed">As Needed (PRN)</option>
                </select>
              </div>

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
                <div className="form-group">
                  <label className="form-label">Morning & Evening Times</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="time"
                      className="form-input"
                      value={time1}
                      onChange={(e) => setTime1(e.target.value)}
                    />
                    <input
                      type="time"
                      className="form-input"
                      value={time2}
                      onChange={(e) => setTime2(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

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

            <div className="form-group">
              <label className="form-label">Dosing Instructions</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Take with breakfast or water"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Personal Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Prescribed by Dr. Smith for seasonal review"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
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
