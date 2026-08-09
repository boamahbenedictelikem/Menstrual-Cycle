import React from 'react';
import { CycleProvider, useCycle } from './context/CycleContext';
import { Navigation } from './components/Navigation';
import { OnboardingModal } from './components/OnboardingModal';
import { DayDetailsModal } from './components/DayDetailsModal';
import { PinLockModal } from './components/PinLockModal';

import { HomeView } from './components/views/HomeView';
import { CalendarView } from './components/views/CalendarView';
import { HistoryView } from './components/views/HistoryView';
import { SymptomsView } from './components/views/SymptomsView';
import { SettingsView } from './components/views/SettingsView';

const MainAppContent: React.FC = () => {
  const { currentTab } = useCycle();

  const renderView = () => {
    switch (currentTab) {
      case 'home':
        return <HomeView />;
      case 'calendar':
        return <CalendarView />;
      case 'history':
        return <HistoryView />;
      case 'symptoms':
        return <SymptomsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors selection:bg-rose-500 selection:text-white">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {renderView()}
      </main>

      <OnboardingModal />
      <DayDetailsModal />
      <PinLockModal />
    </div>
  );
};

export default function App() {
  return (
    <CycleProvider>
      <MainAppContent />
    </CycleProvider>
  );
}
