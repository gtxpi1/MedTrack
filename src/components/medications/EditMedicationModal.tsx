import React, { useState, useEffect, useRef } from 'react';
import { Medication, MedicationForm, ScheduleFrequency } from '../../types/medication';
import { MedicationDatabaseService, DrugSuggestion } from '../../services/MedicationDatabaseService';
import { Icon } from '../common/Icon';

interface EditMedicationModalProps {
  medication: Medication | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedMed: Medication) => Promise<Medication>;
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

export const EditMedicationModal: React.FC<EditMedicationModalProps> = ({
  medication,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [form, setForm] = useState<MedicationForm>('tablet');
  const [strength, setStrength] = useState('');
  const [doseAmount, setDoseAmount] = useState<string>('1');
  const [doseUnit, setDoseUnit] = useState('tablet');
  const [frequency, setFrequency] = useState<ScheduleFrequency>('once-daily');
  
  // Scheduled times
  const [time1, setTime1] = useState('08:00');
  const [time2, setTime2] = useState('20:00');
  const [time3, setTime3] = useState('13:00');
  const [time4, setTime4] = useState('22:00');

  const [currentSupply, setCurrentSupply] = useState<string>('30');
  const [lowSupplyThreshold, setLowSupplyThreshold] = useState<string>('7');
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#0d9488');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Autocomplete Suggestions
  const [suggestions, setSuggestions] = useState<DrugSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availableStrengths, setAvailableStrengths] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (medication) {
      setName(medication.name);
      setGenericName(medication.genericName || '');
      setForm(medication.form);
      setStrength(medication.strength);
      setDoseAmount(String(medication.doseAmount));
      setDoseUnit(medication.doseUnit);
      setFrequency(medication.frequency);

      const times = medication.schedule.scheduledTimes || [];
      setTime1(times[0] || '08:00');
      setTime2(times[1] || '20:00');
      setTime3(times[2] || '13:00');
      setTime4(times[3] || '22:00');

      setCurrentSupply(String(medication.supply.currentSupply));
      setLowSupplyThreshold(String(medication.supply.lowSupplyThreshold || 7));
      setInstructions(medication.instructions || '');
      setNotes(medication.notes || '');
      setColor(medication.color || '#0d9488');
      setErrorMsg('');

      // Check available strengths for the current name
      const found = MedicationDatabaseService.searchMedications(medication.name);
      if (found.length > 0 && found[0].commonStrengths) {
        setAvailableStrengths(found[0].commonStrengths);
      } else {
        setAvailableStrengths([]);
      }
    }
  }, [medication]);

  // Live autocomplete search when name changes
  useEffect(() => {
    if (!name || name.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const localResults = MedicationDatabaseService.searchMedications(name);
    setSuggestions(localResults);
    // Only show if different from current loaded med name
    if (medication && name !== medication.name) {
      setShowSuggestions(localResults.length > 0);
    }
  }, [name, medication]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen || !medication) return null;

  const selectSuggestion = (s: DrugSuggestion) => {
    setName(s.name);
    if (s.genericName) setGenericName(s.genericName);
    setForm(s.form);
    setDoseUnit(s.defaultDoseUnit);
    
    if (s.commonStrengths && s.commonStrengths.length > 0) {
      setAvailableStrengths(s.commonStrengths);
      setStrength(s.commonStrengths[0]);
    }

    setShowSuggestions(false);
  };

  const adjustDoseAmount = (delta: number) => {
    const current = parseFloat(doseAmount) || 0;
    const next = Math.max(0.25, current + delta);
    setDoseAmount(String(Number(next.toFixed(2))));
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

      const parsedDose = Math.max(0.25, parseFloat(doseAmount) || 1);
      const parsedSupply = Math.max(0, parseInt(currentSupply, 10) || 0);
      const parsedThreshold = Math.max(1, parseInt(lowSupplyThreshold, 10) || 7);

      const updated: Medication = {
        ...medication,
        name: name.trim(),
        genericName: genericName.trim() || undefined,
        form,
        strength: strength.trim(),
        doseAmount: parsedDose,
        doseUnit: doseUnit.trim() || 'tablet',
        frequency,
        schedule: {
          ...medication.schedule,
          frequency,
          scheduledTimes,
          isActive: true
        },
        supply: {
          ...medication.supply,
          currentSupply: parsedSupply,
          lowSupplyThreshold: parsedThreshold,
          supplyUnit: doseUnit + (parsedDose > 1 || parsedSupply > 1 ? 's' : '')
        },
        instructions: instructions.trim() || undefined,
        notes: notes.trim() || undefined,
        color,
        updatedAt: new Date().toISOString()
      };

      await onUpdate(updated);
      onClose();
    } catch (err) {
      console.error('Failed to update medication:', err);
      setErrorMsg('Failed to save changes. Please try again.');
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
            <h2>Edit Medication</h2>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
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

            {/* Medication Name with Autocomplete */}
            <div className="form-group" style={{ position: 'relative' }} ref={suggestionsRef}>
              <label className="form-label">Medication Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Novo-Gesic Forte, Quetiapine XR"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                required
              />

              {showSuggestions && suggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1100,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    marginTop: '4px'
                  }}
                >
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.625rem 0.875rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-50)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                      onClick={() => selectSuggestion(s)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.9375rem' }}>{s.name}</strong>
                        <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>{s.form}</span>
                      </div>
                      {s.genericName && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Generic: {s.genericName}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Generic / Brand Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder="e.g. Acetaminophen 500 mg"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Strength *</label>
                <input
                  type="text"
                  className="form-input"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g. 500 mg"
                  required
                />
                {availableStrengths.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                    {availableStrengths.map((str) => (
                      <button
                        key={str}
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          minHeight: '26px',
                          backgroundColor: strength === str ? 'var(--primary-100)' : undefined,
                          borderColor: strength === str ? 'var(--primary-500)' : undefined
                        }}
                        onClick={() => setStrength(str)}
                      >
                        {str}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Form</label>
                <select
                  className="form-select"
                  value={form}
                  onChange={(e) => setForm(e.target.value as MedicationForm)}
                >
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="topical">Topical / Cream / Ointment</option>
                  <option value="liquid">Liquid / Oral Solution</option>
                  <option value="inhaler">Inhaler / Spray</option>
                  <option value="injection">Injection</option>
                  <option value="drops">Drops</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Dose Stepper */}
              <div className="form-group">
                <label className="form-label">Dose Size (per intake)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      overflow: 'hidden',
                      height: '42px'
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ width: '36px', height: '100%', padding: 0, fontSize: '1.25rem', fontWeight: 700 }}
                      onClick={() => adjustDoseAmount(-1)}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="form-input"
                      style={{ width: '54px', textAlign: 'center', border: 'none', height: '100%', padding: '0 4px', fontWeight: 700 }}
                      value={doseAmount}
                      onChange={(e) => setDoseAmount(e.target.value)}
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ width: '36px', height: '100%', padding: 0, fontSize: '1.25rem', fontWeight: 700 }}
                      onClick={() => adjustDoseAmount(1)}
                    >
                      +
                    </button>
                  </div>

                  <input
                    type="text"
                    className="form-input"
                    value={doseUnit}
                    onChange={(e) => setDoseUnit(e.target.value)}
                    style={{ flex: 1 }}
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
                <option value="twice-daily">Twice Daily (Morning & Evening)</option>
                <option value="three-times-daily">Three Times Daily</option>
                <option value="four-times-daily">Four Times Daily</option>
                <option value="as-needed">As Needed (PRN / When required)</option>
              </select>
            </div>

            {/* Time Pickers */}
            {frequency === 'once-daily' && (
              <div className="form-group">
                <label className="form-label">Scheduled Time</label>
                <input type="time" className="form-input" value={time1} onChange={(e) => setTime1(e.target.value)} />
              </div>
            )}

            {frequency === 'twice-daily' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Morning Time</label>
                  <input type="time" className="form-input" value={time1} onChange={(e) => setTime1(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Evening Time</label>
                  <input type="time" className="form-input" value={time2} onChange={(e) => setTime2(e.target.value)} />
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Current Supply Count</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  value={currentSupply}
                  onChange={(e) => setCurrentSupply(e.target.value)}
                  onFocus={(e) => e.target.select()}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Low Stock Alert Threshold</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  value={lowSupplyThreshold}
                  onChange={(e) => setLowSupplyThreshold(e.target.value)}
                  onFocus={(e) => e.target.select()}
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
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Take with water / Take at bedtime"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Personal Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Prescribed for fever and headache relief"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
