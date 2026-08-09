import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Lock,
  Moon,
  Sun,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  XCircle,
  Play,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { runAllCycleTests } from '../../utils/testSuite';
import { TestCaseResult, ReminderSettings } from '../../types';
import { triggerTestNotification, requestNotificationPermission } from '../../utils/notifications';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    deleteAllData,
    toggleTheme
  } = useCycle();

  const [pinInput, setPinInput] = useState(settings.pinLock.pin || '');
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleRunTests = () => {
    const results = runAllCycleTests();
    setTestResults(results);
  };

  const handleTogglePin = (enabled: boolean) => {
    if (enabled && !pinInput) {
      alert('Please enter a 4-digit PIN first.');
      return;
    }
    updateSettings({
      pinLock: {
        enabled,
        pin: pinInput
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          setImportStatus('Data imported successfully!');
        } else {
          setImportStatus('Error importing file. Invalid format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReminderToggle = (key: keyof ReminderSettings) => {
    updateSettings({
      reminders: {
        ...settings.reminders,
        [key]: !settings.reminders[key]
      }
    });
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      alert('Notification permissions granted!');
      updateSettings({ remindersEnabled: true });
    } else {
      alert('Notification permissions were not granted or are unsupported in this browser.');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage cycle calculations, privacy, notifications, and backups
        </p>
      </div>

      {/* SECTION 1: CYCLE CONFIGURATION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center space-x-1.5">
          <Clock className="w-4 h-4" />
          <span>Cycle Calculation Defaults</span>
        </h3>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-100 block">
                Average Cycle Length
              </label>
              <span className="text-xs text-slate-400">Typical range: 21-35 days</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="20"
                max="45"
                value={settings.averageCycleLength}
                onChange={e =>
                  updateSettings({ averageCycleLength: Number(e.target.value) })
                }
                className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-slate-800 dark:text-slate-100"
              />
              <span className="text-xs text-slate-500">days</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-100 block">
                Average Period Duration
              </label>
              <span className="text-xs text-slate-400">Typical range: 3-7 days</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="2"
                max="12"
                value={settings.averagePeriodDuration}
                onChange={e =>
                  updateSettings({ averagePeriodDuration: Number(e.target.value) })
                }
                className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-slate-800 dark:text-slate-100"
              />
              <span className="text-xs text-slate-500">days</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-100 block">
                Smart Average Prediction
              </label>
              <span className="text-xs text-slate-400">Auto-calculate from your recent cycle history</span>
            </div>
            <button
              type="button"
              onClick={() =>
                updateSettings({ useSmartAverage: !settings.useSmartAverage })
              }
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                settings.useSmartAverage ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.useSmartAverage ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: NOTIFICATIONS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center space-x-1.5">
            <Bell className="w-4 h-4" />
            <span>Reminders & Notifications</span>
          </h3>

          <button
            onClick={handleRequestNotifications}
            className="text-xs text-rose-600 dark:text-rose-400 font-semibold underline"
          >
            Request Browser Permission
          </button>
        </div>

        <div className="space-y-3 text-sm">
          {[
            { key: 'expectedPeriod' as const, label: 'Expected Period Alert', desc: '2 days prior to predicted start' },
            { key: 'periodStarting' as const, label: 'Period Starting Day', desc: 'On estimated start date' },
            { key: 'periodEnding' as const, label: 'Period Ending Alert', desc: 'On estimated end date' },
            { key: 'fertileWindow' as const, label: 'Fertile Window Alert', desc: 'When fertile window opens' },
            { key: 'dailySymptomTracking' as const, label: 'Daily Check-In', desc: 'Daily log reminder' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-100 block">{item.label}</span>
                <span className="text-[11px] text-slate-400">{item.desc}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => triggerTestNotification(item.key)}
                  className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200"
                >
                  Test
                </button>
                <button
                  type="button"
                  onClick={() => handleReminderToggle(item.key)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    settings.reminders[item.key] ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.reminders[item.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: THEME & PRIVACY PIN LOCK */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center space-x-1.5">
          <Lock className="w-4 h-4" />
          <span>App Security & Appearance</span>
        </h3>

        <div className="space-y-4 text-sm">
          {/* Theme selector */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-100 block">Appearance Theme</span>
              <span className="text-xs text-slate-400">Choose light, dark, or system mode</span>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              {(['light', 'dark', 'system'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => updateSettings({ theme: t })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                    settings.theme === t
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* PIN Lock config */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-100 block">4-Digit PIN Lock</span>
                <span className="text-xs text-slate-400">Require passcode on launch</span>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePin(!settings.pinLock.enabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  settings.pinLock.enabled ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.pinLock.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 4-digit PIN"
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm w-36 text-center font-bold tracking-widest text-slate-800 dark:text-slate-100"
              />
              <button
                onClick={() => handleTogglePin(true)}
                className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Update PIN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: BACKUP & DATA MANAGEMENT */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Data Privacy & Backup</span>
        </h3>

        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Local Storage Privacy:</strong> All your cycle data, symptoms, and notes are saved exclusively in your browser's encrypted local storage.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={exportData}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4 text-rose-500" />
            <span>Export Data (JSON)</span>
          </button>

          <label className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-rose-500" />
            <span>Import Data (JSON)</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {importStatus && (
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {importStatus}
          </p>
        )}

        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-rose-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All Stored Data</span>
          </button>
        </div>
      </div>

      {/* SECTION 5: AUTOMATED CYCLE CALCULATION TESTS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Automated Calculation Verification</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Run test cases for 21/28/35-day cycles, month/year crossings, and irregular data
            </p>
          </div>

          <button
            onClick={handleRunTests}
            className="px-3.5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Test Suite</span>
          </button>
        </div>

        {testResults && (
          <div className="space-y-2.5 pt-2">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-xs space-y-1 ${
                  t.passed
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-100">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                    <span>{t.title}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      t.passed
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {t.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{t.description}</p>
                <p className="text-[10px] text-slate-400 font-mono">{t.details}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-rose-100 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
              Delete All Data?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will permanently erase all period entries, symptom logs, and settings from this browser. This cannot be undone.
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteAllData();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
