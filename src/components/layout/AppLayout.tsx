import React from 'react';
import { AppView } from '../../types/navigation';
import { useMedications } from '../../hooks/useMedications';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { AddMedicationModal } from '../medications/AddMedicationModal';

interface AppLayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isAddModalOpen: boolean;
  onOpenAddModal: () => void;
  onCloseAddModal: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onNavigate,
  isAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
  children
}) => {
  const { stats, lowSupplyMedications, addMedication } = useMedications();

  return (
    <div className="app-root">
      {/* Desktop Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={onNavigate}
        pendingDoseCount={stats.pendingCount}
        lowSupplyCount={lowSupplyMedications.length}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          currentView={currentView}
          onOpenAddModal={onOpenAddModal}
          onNavigate={onNavigate}
        />

        <main className="content-container">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        onNavigate={onNavigate}
        pendingDoseCount={stats.pendingCount}
        lowSupplyCount={lowSupplyMedications.length}
      />

      {/* Add Medication Modal */}
      <AddMedicationModal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        onAdd={addMedication}
      />
    </div>
  );
};
