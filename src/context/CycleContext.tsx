import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  PeriodEntry,
  SymptomLog,
  UserSettings,
  CycleCalculationResult,
  NavTab
} from '../types';
import { calculateCycleState, formatDateKey } from '../utils/cycleCalculations';

const STORAGE_KEY_ENTRIES = 'cycle_tracker_entries_v1';
const STORAGE_KEY_SYMPTOMS = 'cycle_tracker_symptoms_v1';
const STORAGE_KEY_SETTINGS = 'cycle_tracker_settings_v1';

const defaultSettings: UserSettings = {
  averageCycleLength: 28,
  averagePeriodDuration: 5,
  remindersEnabled: true,
  reminders: {
    expectedPeriod: true,
    periodStarting: true,
    periodEnding: true,
    fertileWindow: true,
    dailySymptomTracking: true,
    reminderTime: '09:00'
  },
  theme: 'light',
  pinLock: { enabled: false, pin: '' },
  onboardingCompleted: false,
  useSmartAverage: true
};

// Example initial period entry matching prompt example (Aug 8, 2026) if onboarding completed or initialized
const initialDefaultEntry: PeriodEntry = {
  id: 'init-aug-8-2026',
  startDate: '2026-08-08',
  endDate: '2026-08-12',
  isConfirmed: true,
  notes: 'Current period start recorded',
  flow: 'medium'
};

interface CycleContextType {
  entries: PeriodEntry[];
  symptomLogs: Record<string, SymptomLog>;
  settings: UserSettings;
  cycleInfo: CycleCalculationResult;
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  isPinUnlocked: boolean;
  setIsPinUnlocked: (unlocked: boolean) => void;
  addOrUpdatePeriodEntry: (entry: Partial<PeriodEntry> & { startDate: string }) => void;
  deletePeriodEntry: (id: string) => void;
  logSymptom: (log: SymptomLog) => void;
  deleteSymptomLog: (dateStr: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  completeOnboarding: (data: {
    startDate: string;
    cycleLength: number;
    periodDuration: number;
    enableReminders: boolean;
  }) => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  deleteAllData: () => void;
  toggleTheme: () => void;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export const CycleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<PeriodEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENTRIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading entries from localStorage', e);
    }
    return [initialDefaultEntry];
  });

  const [symptomLogs, setSymptomLogs] = useState<Record<string, SymptomLog>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SYMPTOMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading symptom logs from localStorage', e);
    }
    return {
      '2026-08-08': {
        date: '2026-08-08',
        symptoms: ['cramps', 'fatigue'],
        mood: 'sensitive',
        flow: 'medium',
        customNotes: 'Started period today. Mild lower back fatigue.'
      },
      '2026-08-09': {
        date: '2026-08-09',
        symptoms: ['cramps', 'bloating'],
        mood: 'tired',
        flow: 'heavy',
        customNotes: 'Hydrating well, day 2.'
      }
    };
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
    }
    return defaultSettings;
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(!settings.pinLock.enabled);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error(e);
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SYMPTOMS, JSON.stringify(symptomLogs));
    } catch (e) {
      console.error(e);
    }
  }, [symptomLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Handle dark mode class on document element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Recalculate cycle info based on entries & settings relative to today's date
  const cycleInfo = useMemo(() => {
    return calculateCycleState(entries, settings, new Date());
  }, [entries, settings]);

  const addOrUpdatePeriodEntry = (entry: Partial<PeriodEntry> & { startDate: string }) => {
    setEntries(prev => {
      const existingIndex = prev.findIndex(
        e => e.id === entry.id || e.startDate === entry.startDate
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...entry
        };
        return updated;
      } else {
        const newEntry: PeriodEntry = {
          id: entry.id || `period-${Date.now()}`,
          startDate: entry.startDate,
          endDate: entry.endDate ?? null,
          isConfirmed: entry.isConfirmed ?? true,
          notes: entry.notes || '',
          flow: entry.flow || 'medium'
        };
        return [...prev, newEntry].sort((a, b) => b.startDate.localeCompare(a.startDate));
      }
    });
  };

  const deletePeriodEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const logSymptom = (log: SymptomLog) => {
    setSymptomLogs(prev => ({
      ...prev,
      [log.date]: log
    }));
  };

  const deleteSymptomLog = (dateStr: string) => {
    setSymptomLogs(prev => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      reminders: newSettings.reminders
        ? { ...prev.reminders, ...newSettings.reminders }
        : prev.reminders,
      pinLock: newSettings.pinLock
        ? { ...prev.pinLock, ...newSettings.pinLock }
        : prev.pinLock
    }));
  };

  const completeOnboarding = (data: {
    startDate: string;
    cycleLength: number;
    periodDuration: number;
    enableReminders: boolean;
  }) => {
    // Add initial entry from onboarding
    addOrUpdatePeriodEntry({
      id: `onboarding-${Date.now()}`,
      startDate: data.startDate,
      endDate: null,
      isConfirmed: true,
      notes: 'Initial recorded period from setup'
    });

    updateSettings({
      averageCycleLength: data.cycleLength,
      averagePeriodDuration: data.periodDuration,
      remindersEnabled: data.enableReminders,
      onboardingCompleted: true
    });
  };

  const exportData = () => {
    const exportObject = {
      app: 'CycleTracker',
      version: 1,
      exportedAt: new Date().toISOString(),
      entries,
      symptomLogs,
      settings
    };
    const jsonStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cycle-tracker-backup-${formatDateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && Array.isArray(parsed.entries)) {
        setEntries(parsed.entries);
        if (parsed.symptomLogs && typeof parsed.symptomLogs === 'object') {
          setSymptomLogs(parsed.symptomLogs);
        }
        if (parsed.settings && typeof parsed.settings === 'object') {
          setSettings(parsed.settings);
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to parse import data', e);
    }
    return false;
  };

  const deleteAllData = () => {
    localStorage.removeItem(STORAGE_KEY_ENTRIES);
    localStorage.removeItem(STORAGE_KEY_SYMPTOMS);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    setEntries([]);
    setSymptomLogs({});
    setSettings(defaultSettings);
    setIsPinUnlocked(true);
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  return (
    <CycleContext.Provider
      value={{
        entries,
        symptomLogs,
        settings,
        cycleInfo,
        currentTab,
        setCurrentTab,
        selectedDate,
        setSelectedDate,
        isPinUnlocked,
        setIsPinUnlocked,
        addOrUpdatePeriodEntry,
        deletePeriodEntry,
        logSymptom,
        deleteSymptomLog,
        updateSettings,
        completeOnboarding,
        exportData,
        importData,
        deleteAllData,
        toggleTheme
      }}
    >
      {children}
    </CycleContext.Provider>
  );
};

export const useCycle = () => {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycle must be used within a CycleProvider');
  }
  return context;
};
