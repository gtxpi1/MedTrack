import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  className?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  className = '',
  color
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={`progress-container ${className}`}
      style={{ height: `${height}px` }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="progress-fill"
        style={{
          width: `${clamped}%`,
          ...(color ? { background: color } : {})
        }}
      />
    </div>
  );
};
