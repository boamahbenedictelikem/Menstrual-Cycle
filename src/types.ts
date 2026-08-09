export type PeriodFlow = 'spotting' | 'light' | 'medium' | 'heavy';

export interface PeriodEntry {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD or null if ongoing
  isConfirmed: boolean; // true if entered by user, false if projected/estimated
  notes?: string;
  flow?: PeriodFlow;
}

export interface SymptomLog {
  date: string; // YYYY-MM-DD
  symptoms: string[]; // e.g. 'cramps', 'headache', 'bloating', 'fatigue', 'mood_changes', 'breast_tenderness', 'back_pain', 'acne'
  mood?: 'happy' | 'calm' | 'sensitive' | 'irritable' | 'anxious' | 'energetic' | 'tired' | 'sad';
  flow?: PeriodFlow | 'none';
  customNotes?: string;
  waterCups?: number;
  energyLevel?: number; // 1-5
}

export interface ReminderSettings {
  expectedPeriod: boolean; // e.g., 2 days before
  periodStarting: boolean; // day of period start
  periodEnding: boolean;   // day period ends
  fertileWindow: boolean;  // day fertile window starts
  dailySymptomTracking: boolean; // evening reminder
  reminderTime: string;    // HH:MM (e.g., '09:00')
}

export interface UserSettings {
  averageCycleLength: number; // default e.g. 28
  averagePeriodDuration: number; // default e.g. 5
  remindersEnabled: boolean;
  reminders: ReminderSettings;
  theme: 'light' | 'dark' | 'system';
  pinLock: {
    enabled: boolean;
    pin: string; // 4-digit code stored locally
  };
  onboardingCompleted: boolean;
  useSmartAverage: boolean; // automatically calculate average from cycle history
}

export type CyclePhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleCalculationResult {
  currentCycleDay: number; // 1-indexed day of cycle
  currentPhase: CyclePhase;
  phaseName: string;
  phaseDescription: string;
  lastPeriodStartDate: string; // YYYY-MM-DD
  estimatedPeriodEndDate: string; // YYYY-MM-DD
  estimatedNextPeriodDate: string; // YYYY-MM-DD
  daysUntilNextPeriod: number;
  estimatedOvulationDate: string; // YYYY-MM-DD
  fertileWindowStart: string; // YYYY-MM-DD
  fertileWindowEnd: string; // YYYY-MM-DD
  effectiveCycleLength: number;
  effectivePeriodDuration: number;
  isPeriodActive: boolean;
  activePeriodDayNumber: number | null; // e.g. Day 2 of current period
}

export interface DayStatus {
  date: string; // YYYY-MM-DD
  isCurrentDay: boolean;
  isConfirmedPeriod: boolean;
  isPredictedPeriod: boolean;
  isFertileWindow: boolean;
  isOvulationDay: boolean;
  hasSymptoms: boolean;
  symptoms: string[];
  flow?: PeriodFlow | 'none';
  notes?: string;
  periodEntryId?: string;
}

export type NavTab = 'home' | 'calendar' | 'history' | 'symptoms' | 'settings';

export interface TestCaseResult {
  title: string;
  description: string;
  passed: boolean;
  details: string;
}
