import React from 'react';
import { AppView } from '../../types/navigation';
import { Icon } from '../common/Icon';

interface MobileNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  pendingDoseCount: number;
  lowSupplyCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onNavigate,
  pendingDoseCount,
  lowSupplyCount
}) => {
  const items: Array<{ id: AppView; label: string; icon: string; badge?: number }> = [
    { id: 'today', label: 'Today', icon: 'today', badge: pendingDoseCount > 0 ? pendingDoseCount : undefined },
    { id: 'medications', label: 'Meds', icon: 'medications' },
    { id: 'schedule', label: 'Schedule', icon: 'schedule' },
    { id: 'refills', label: 'Refills', icon: 'refills', badge: lowSupplyCount > 0 ? lowSupplyCount : undefined },
    { id: 'history', label: 'History', icon: 'history' }
  ];

  return (
    <nav className="mobile-nav" aria-label="Mobile Navigation">
      <div className="mobile-nav-items">
        {items.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
            >
              <div className="mobile-nav-icon">
                <Icon name={item.icon} size={22} />
              </div>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="mobile-nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
