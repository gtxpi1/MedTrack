import React from 'react';
import { AppView } from '../../types/navigation';
import { Icon } from '../common/Icon';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  pendingDoseCount: number;
  lowSupplyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  pendingDoseCount,
  lowSupplyCount
}) => {
  const navItems: Array<{ id: AppView; label: string; icon: string; badge?: number; badgeColor?: string }> = [
    { id: 'today', label: 'Today', icon: 'today', badge: pendingDoseCount > 0 ? pendingDoseCount : undefined },
    { id: 'medications', label: 'Medications', icon: 'medications' },
    { id: 'schedule', label: 'Schedule', icon: 'schedule' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'refills', label: 'Refills', icon: 'refills', badge: lowSupplyCount > 0 ? lowSupplyCount : undefined, badgeColor: 'badge-warning' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <aside className="sidebar" aria-label="Main Navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Icon name="pill" size={22} />
        </div>
        <div className="brand-text">
          <h1>MedTrack</h1>
          <span>Daily Care Companion</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <div className="nav-link-left">
                <span className="nav-icon">
                  <Icon name={item.icon} size={20} />
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`badge ${item.badgeColor || 'badge-primary'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info / Medical Disclaimer */}
      <div className="sidebar-footer">
        <div className="disclaimer-box">
          <strong>Demonstration Data</strong>
          <p>For tracking assistance only. Does not replace professional medical advice.</p>
        </div>
      </div>
    </aside>
  );
};
