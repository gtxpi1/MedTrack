import React from 'react';
import { AppView } from '../../types/navigation';
import { formatHeaderDate, getDayPeriodGreeting } from '../../utils/dateUtils';
import { Icon } from '../common/Icon';

interface HeaderProps {
  currentView: AppView;
  onOpenAddModal: () => void;
  onNavigate: (view: AppView) => void;
  onOpenSyncModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenAddModal,
  onNavigate,
  onOpenSyncModal
}) => {
  const getHeaderInfo = () => {
    switch (currentView) {
      case 'today':
        return {
          title: formatHeaderDate(),
          subtitle: `${getDayPeriodGreeting()}! Here is your daily regimen.`
        };
      case 'medications':
        return {
          title: 'My Medications',
          subtitle: 'Active prescriptions and supplements'
        };
      case 'schedule':
        return {
          title: 'Daily Schedule',
          subtitle: 'Timeline of scheduled medication times'
        };
      case 'history':
        return {
          title: 'Dose History',
          subtitle: 'Past logs and adherence record'
        };
      case 'refills':
        return {
          title: 'Supply & Refills',
          subtitle: 'Inventory tracking and low stock alerts'
        };
      case 'settings':
        return {
          title: 'Settings & Data',
          subtitle: 'Storage preferences and application details'
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <header className="app-header">
      <div className="header-left">
        <div>
          <h2 className="header-date-title">{title}</h2>
          <p className="header-date-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {onOpenSyncModal && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenSyncModal}
            title="Sync / Transfer data to tablet or phone"
          >
            <Icon name="refresh" size={15} />
            <span>Sync Devices</span>
          </button>
        )}

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenAddModal}
        >
          <Icon name="plus" size={16} />
          <span>Add Med</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={() => onNavigate('settings')}
          aria-label="Settings"
          title="Settings"
        >
          <Icon name="settings" size={18} />
        </button>
      </div>
    </header>
  );
};
