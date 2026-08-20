import React, { useState } from 'react';
import { AppView } from './types/navigation';
import { MedicationProvider } from './context/MedicationContext';
import { AppLayout } from './components/layout/AppLayout';
import { TodayView } from './views/TodayView';
import { MedicationsView } from './views/MedicationsView';
import { ScheduleView } from './views/ScheduleView';
import { HistoryView } from './views/HistoryView';
import { RefillsView } from './views/RefillsView';
import { SettingsView } from './views/SettingsView';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentView) {
      case 'today':
        return <TodayView onNavigate={setCurrentView} />;
      case 'medications':
        return <MedicationsView onOpenAddModal={() => setIsAddModalOpen(true)} />;
      case 'schedule':
        return <ScheduleView />;
      case 'history':
        return <HistoryView />;
      case 'refills':
        return <RefillsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodayView onNavigate={setCurrentView} />;
    }
  };

  return (
    <AppLayout
      currentView={currentView}
      onNavigate={setCurrentView}
      isAddModalOpen={isAddModalOpen}
      onOpenAddModal={() => setIsAddModalOpen(true)}
      onCloseAddModal={() => setIsAddModalOpen(false)}
    >
      {renderActiveView()}
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <MedicationProvider>
      <AppContent />
    </MedicationProvider>
  );
};

export default App;
