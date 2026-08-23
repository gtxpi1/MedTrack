import React, { useState } from 'react';
import { useMedications } from '../hooks/useMedications';
import { Icon } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';
import { SyncCenterModal } from '../components/sync/SyncCenterModal';
import { SyncService } from '../services/SyncService';

export const SettingsView: React.FC = () => {
  const { resetSampleData, medications, historyRecords, refresh } = useMedications();
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset to the initial sample medication dataset? Any custom data added in this session will be restored to defaults.')) {
      setResetting(true);
      await resetSampleData();
      setResetting(false);
      setResetMessage('Sample data successfully restored!');
      setTimeout(() => setResetMessage(''), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. Multi-Device Sync & Backup */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #ffffff, #f0fdf4)', border: '1px solid var(--primary-200)' }}>
        <div className="section-header" style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="refresh" size={20} className="text-primary" />
            <h3 className="section-title">Phone & Tablet Sync Center</h3>
          </div>
          <Badge variant="success">Offline & QR Sync</Badge>
        </div>

        <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
          Transfer all your medications, supply counts, and photos between your phone and tablet in seconds without needing an account or cloud registration.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsSyncModalOpen(true)}
          >
            <Icon name="refresh" size={16} />
            <span>Open Sync & Transfer Center</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => SyncService.downloadBackupFile()}
          >
            <Icon name="download" size={16} />
            <span>Download Backup (.json)</span>
          </button>
        </div>
      </div>

      {/* 2. Storage & Architecture Status */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h3 className="section-title">
            <Icon name="settings" size={18} />
            <span>Architecture & Storage Layer</span>
          </h3>
          <Badge variant="success">Active</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="text-muted">Storage Driver</span>
            <strong>LocalStorageService (via IStorageService)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="text-muted">Tracked Medications</span>
            <strong>{medications.length} items</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="text-muted">Dose Records Logged</span>
            <strong>{historyRecords.length} entries</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span className="text-muted">Device Transfer Protocol</span>
            <strong>Direct QR Code & Encrypted JSON Stream</strong>
          </div>
        </div>
      </div>

      {/* 3. PWA Readiness */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '0.75rem' }}>
          <h3 className="section-title">
            <Icon name="activity" size={18} />
            <span>Progressive Web App (PWA) Foundation</span>
          </h3>
          <Badge variant="primary">PWA Ready</Badge>
        </div>

        <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
          This application is built with a mobile-first responsive design, Web App Manifest, Service Worker cache layer, and Apple mobile meta tags. It can be installed as a standalone app on iOS and Android devices.
        </p>

        <div className="grid-2">
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
            <strong className="text-sm">iOS / Safari:</strong>
            <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
              Tap the "Share" button and select <em>"Add to Home Screen"</em>.
            </p>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
            <strong className="text-sm">Android / Chrome:</strong>
            <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
              Tap browser menu (⋮) and select <em>"Install app"</em> or <em>"Add to Home Screen"</em>.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Sample Data Management */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '0.75rem' }}>
          <h3 className="section-title">
            <Icon name="refresh" size={18} />
            <span>Data Management & Demo Tools</span>
          </h3>
        </div>

        <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
          Reset your local storage cache to reload the initial demonstration medications (Metformin, Lisinopril, Atorvastatin, Vitamin D3, Albuterol).
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={resetting}
          >
            <Icon name="rotate-ccw" size={16} />
            <span>{resetting ? 'Resetting...' : 'Restore Sample Data'}</span>
          </button>

          {resetMessage && (
            <span className="text-sm font-semibold" style={{ color: 'var(--success-solid)' }}>
              {resetMessage}
            </span>
          )}
        </div>
      </div>

      {/* 5. Medical Information Notice */}
      <div className="card" style={{ backgroundColor: 'var(--slate-50)', borderStyle: 'dashed' }}>
        <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>
          Medical Information & Safety Notice
        </h4>
        <p className="text-xs text-muted">
          This system is an organization and tracking utility. It does not provide medical advice, diagnosis, treatment, or clinical recommendations. Drug information, scheduling reminders, and clinical interaction checking are for reference purposes. Always consult your prescribing physician.
        </p>
      </div>

      {/* Sync Center Modal */}
      <SyncCenterModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onDataImported={refresh}
      />
    </div>
  );
};
