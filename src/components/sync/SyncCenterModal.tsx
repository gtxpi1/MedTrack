import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import { SyncService, CabinetExportData } from '../../services/SyncService';
import { Medication } from '../../types/medication';
import { Icon } from '../common/Icon';
import { Badge } from '../common/Badge';

interface SyncCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
}

export const SyncCenterModal: React.FC<SyncCenterModalProps> = ({
  isOpen,
  onClose,
  onDataImported
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [syncCode, setSyncCode] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Import State
  const [importText, setImportText] = useState('');
  const [scannedData, setScannedData] = useState<CabinetExportData | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [importStatusMsg, setImportStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const code = SyncService.generateSyncCode();
      setSyncCode(code);
      setCopySuccess(false);
      setScannedData(null);
      setImportStatusMsg(null);
      setScanError('');
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setScanError('');
    setScannedData(null);
    setIsScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setScanError('Could not access camera. Please allow camera permissions or paste the sync code below.');
      setIsScanning(false);
    }
  };

  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            const parsed = SyncService.parseSyncPayload(code.data);
            if (parsed) {
              setScannedData(parsed);
              stopCamera();
              return;
            }
          }
        }
      }
    }
    animationFrameId.current = requestAnimationFrame(tickScan);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(syncCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleManualTextParse = () => {
    if (!importText.trim()) return;
    const parsed = SyncService.parseSyncPayload(importText);
    if (parsed) {
      setScannedData(parsed);
      setImportStatusMsg(null);
    } else {
      setImportStatusMsg({
        text: 'Invalid Sync Code format. Please make sure you copied the entire code.',
        type: 'error'
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = SyncService.parseSyncPayload(content);
      if (parsed) {
        setScannedData(parsed);
        setImportStatusMsg(null);
      } else {
        setImportStatusMsg({
          text: 'Invalid backup file format. Please upload a valid MedTrack backup JSON.',
          type: 'error'
        });
      }
    };
    reader.readAsText(file);
  };

  const executeImport = () => {
    if (!scannedData) return;

    const success = SyncService.importCabinetData(scannedData, importMode);
    if (success) {
      setImportStatusMsg({
        text: `Successfully synced ${scannedData.medications.length} medications!`,
        type: 'success'
      });
      setTimeout(() => {
        onDataImported();
        onClose();
      }, 1200);
    } else {
      setImportStatusMsg({
        text: 'Failed to write to local storage.',
        type: 'error'
      });
    }
  };

  if (!isOpen) return null;

  const currentExportData = SyncService.exportCabinetData();

  return (
    <div className="modal-backdrop" onClick={() => { stopCamera(); onClose(); }}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon name="refresh" size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Sync & Transfer Devices</h2>
              <p className="text-xs text-muted">Share cabinet data between phone, tablet, or backup file</p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => { stopCamera(); onClose(); }}
            aria-label="Close"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 1.25rem' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.75rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'export' ? 'var(--primary-700)' : 'var(--slate-500)',
              borderBottom: activeTab === 'export' ? '2px solid var(--primary-600)' : '2px solid transparent'
            }}
            onClick={() => { stopCamera(); setActiveTab('export'); }}
          >
            📱 Share / Sync to Tablet
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.75rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'import' ? 'var(--primary-700)' : 'var(--slate-500)',
              borderBottom: activeTab === 'import' ? '2px solid var(--primary-600)' : '2px solid transparent'
            }}
            onClick={() => setActiveTab('import')}
          >
            📥 Receive from Phone / Import
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* TAB 1: EXPORT / SHARE TO TABLET */}
          {activeTab === 'export' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', textAlign: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0' }}>Scan with your Tablet</h4>
                <p className="text-xs text-muted" style={{ margin: 0 }}>
                  Open MedTrack on your tablet, tap <strong>"Receive from Phone"</strong> and scan this QR code.
                </p>
              </div>

              {/* QR Code Container */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {syncCode ? (
                  <QRCodeSVG
                    value={syncCode}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                ) : (
                  <div>Generating sync code...</div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyCode}
                >
                  <Icon name={copySuccess ? 'check' : 'copy'} size={14} />
                  <span>{copySuccess ? 'Copied Sync Code!' : 'Copy Sync Code'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => SyncService.downloadBackupFile()}
                >
                  <Icon name="download" size={14} />
                  <span>Download Backup (.json)</span>
                </button>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', backgroundColor: 'var(--slate-50)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', width: '100%' }}>
                📦 <strong>Ready to Transfer:</strong> {currentExportData.medications.length} active medication profiles, supply counters, and daily schedules.
              </div>
            </div>
          )}

          {/* TAB 2: RECEIVE / IMPORT */}
          {activeTab === 'import' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Status alerts */}
              {importStatusMsg && (
                <div
                  style={{
                    backgroundColor: importStatusMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: importStatusMsg.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {importStatusMsg.text}
                </div>
              )}

              {/* Scanned / Loaded Summary Ready to Import */}
              {scannedData ? (
                <div
                  style={{
                    backgroundColor: 'var(--primary-50)',
                    border: '1px solid var(--primary-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--primary-900)', fontSize: '0.9375rem' }}>
                      ✓ Cabinet Data Ready to Transfer ({scannedData.medications.length} Medications)
                    </strong>
                    <Badge variant="success">Verified</Badge>
                  </div>

                  <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem' }}>
                    {scannedData.medications.map((m: Medication, idx: number) => (
                      <div key={idx} style={{ color: 'var(--slate-700)' }}>
                        • <strong>{m.name}</strong> ({m.strength}) — {m.supply.currentSupply} {m.supply.supplyUnit}
                      </div>
                    ))}
                  </div>

                  {/* Mode Selection */}
                  <div style={{ borderTop: '1px solid var(--primary-200)', paddingTop: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Transfer Method:</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${importMode === 'replace' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setImportMode('replace')}
                      >
                        Mirror Phone (Exact Twin)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${importMode === 'merge' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setImportMode('merge')}
                      >
                        Merge with Existing
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={executeImport}
                    >
                      <Icon name="check" size={16} />
                      <span>Confirm & Apply Transfer</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setScannedData(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Camera Scanner Viewfinder */}
                  {isScanning ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          maxWidth: '320px',
                          height: '240px',
                          borderRadius: 'var(--radius-lg)',
                          overflow: 'hidden',
                          backgroundColor: '#000000'
                        }}
                      >
                        <video
                          ref={videoRef}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        
                        {/* Target reticle */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '180px',
                            height: '180px',
                            border: '2px dashed #38bdf8',
                            borderRadius: '12px'
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={stopCamera}
                      >
                        Stop Camera
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '0.875rem', justifyContent: 'center', gap: '0.5rem' }}
                      onClick={startCamera}
                    >
                      <Icon name="camera" size={20} />
                      <span>Scan Phone QR Code with Camera</span>
                    </button>
                  )}

                  {scanError && (
                    <div className="text-xs text-danger" style={{ textAlign: 'center' }}>
                      {scanError}
                    </div>
                  )}

                  <div style={{ textAlign: 'center', margin: '0.25rem 0', color: 'var(--slate-400)', fontSize: '0.8rem' }}>
                    ─── OR PASTE SYNC CODE / UPLOAD FILE ───
                  </div>

                  {/* Paste Sync String */}
                  <div className="form-group">
                    <label className="form-label">Paste Sync Code</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Paste the code copied from your phone here..."
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleManualTextParse}
                      >
                        Parse
                      </button>
                    </div>
                  </div>

                  {/* Upload File */}
                  <div style={{ textAlign: 'center' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json,application/json"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Icon name="upload" size={14} />
                      <span>Upload Backup File (.json)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { stopCamera(); onClose(); }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
