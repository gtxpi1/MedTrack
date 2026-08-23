import React, { useState } from 'react';
import { Icon } from './Icon';

interface PhotoLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title: string;
  subtitle?: string;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.max(prev - 0.35, 0.75));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(1);
  };

  const handleClose = () => {
    setZoomLevel(1);
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleClose}
    >
      {/* Top Header Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          marginBottom: '0.75rem',
          padding: '0 0.5rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 style={{ color: '#ffffff', fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>
            {title}
          </h3>
          {subtitle && (
            <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.85rem' }}>
              {subtitle}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Zoom Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}
          >
            <button
              type="button"
              className="btn btn-ghost"
              style={{ color: '#ffffff', padding: '0.4rem 0.6rem', minHeight: 'auto', borderRadius: 0 }}
              onClick={handleZoomOut}
              title="Zoom out"
              aria-label="Zoom out"
            >
              -
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ color: '#ffffff', padding: '0.4rem 0.6rem', minHeight: 'auto', fontSize: '0.75rem', borderRadius: 0 }}
              onClick={handleResetZoom}
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ color: '#ffffff', padding: '0.4rem 0.6rem', minHeight: 'auto', borderRadius: 0 }}
              onClick={handleZoomIn}
              title="Zoom in"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-icon"
            style={{ color: '#ffffff', backgroundColor: 'rgba(255, 255, 255, 0.15)', width: '36px', height: '36px' }}
            onClick={handleClose}
            aria-label="Close enlarged photo"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
      </div>

      {/* Image Container with Zoom */}
      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '900px',
          maxHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0.5rem',
          cursor: zoomLevel > 1 ? 'grab' : 'zoom-in'
        }}
        onClick={(e) => {
          e.stopPropagation();
          // Toggle between 1x and 1.8x on tap
          setZoomLevel((prev) => (prev === 1 ? 1.8 : 1));
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            maxWidth: '100%',
            maxHeight: '75vh',
            objectFit: 'contain',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}
        />
      </div>

      {/* Footer Helper Note */}
      <div
        style={{
          marginTop: '0.75rem',
          color: 'rgba(255, 255, 255, 0.65)',
          fontSize: '0.8rem',
          textAlign: 'center'
        }}
      >
        Tap photo to toggle zoom · Pinch or use +/- to inspect label details
      </div>
    </div>
  );
};
