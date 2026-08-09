import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, Droplets, Smile, Check, Trash2 } from 'lucide-react';
import { useCycle } from '../context/CycleContext';
import { PeriodFlow, SymptomLog } from '../types';
import { formatDisplayDate, getDayStatus } from '../utils/cycleCalculations';

const SYMPTOM_OPTIONS = [
  { id: 'cramps', label: 'Cramps', icon: '⚡' },
  { id: 'headache', label: 'Headache', icon: '🤕' },
  { id: 'bloating', label: 'Bloating', icon: '🎈' },
  { id: 'fatigue', label: 'Fatigue', icon: '😴' },
  { id: 'mood_changes', label: 'Mood Changes', icon: '🎭' },
  { id: 'breast_tenderness', label: 'Breast Tenderness', icon: '🌸' },
  { id: 'back_pain', label: 'Back Pain', icon: '⚡' },
  { id: 'acne', label: 'Acne / Skin', icon: '✨' },
  { id: 'spotting', label: 'Spotting', icon: '💧' },
  { id: 'nausea', label: 'Nausea', icon: '🤢' }
];

const MOOD_OPTIONS: Array<{ id: NonNullable<SymptomLog['mood']>; label: string; icon: string }> = [
  { id: 'happy', label: 'Happy', icon: '😊' },
  { id: 'calm', label: 'Calm', icon: '😌' },
  { id: 'sensitive', label: 'Sensitive', icon: '🥺' },
  { id: 'irritable', label: 'Irritable', icon: '😤' },
  { id: 'anxious', label: 'Anxious', icon: '😰' },
  { id: 'energetic', label: 'Energetic', icon: '⚡' },
  { id: 'tired', label: 'Tired', icon: '🥱' },
  { id: 'sad', label: 'Sad', icon: '😢' }
];

const FLOW_OPTIONS: Array<{ id: PeriodFlow | 'none'; label: string; color: string }> = [
  { id: 'none', label: 'None', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  { id: 'spotting', label: 'Spotting', color: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' },
  { id: 'light', label: 'Light', color: 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200' },
  { id: 'medium', label: 'Medium', color: 'bg-rose-500 text-white' },
  { id: 'heavy', label: 'Heavy', color: 'bg-rose-700 text-white' }
];

export const DayDetailsModal: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    entries,
    symptomLogs,
    settings,
    addOrUpdatePeriodEntry,
    deletePeriodEntry,
    logSymptom,
    deleteSymptomLog
  } = useCycle();

  const [isPeriodDay, setIsPeriodDay] = useState(false);
  const [flow, setFlow] = useState<PeriodFlow | 'none'>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<SymptomLog['mood'] | undefined>(undefined);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!selectedDate) return;

    const status = getDayStatus(selectedDate, entries, symptomLogs, settings);
    const existingLog = symptomLogs[selectedDate];

    setIsPeriodDay(status.isConfirmedPeriod);
    setFlow(existingLog?.flow || status.flow || (status.isConfirmedPeriod ? 'medium' : 'none'));
    setSelectedSymptoms(existingLog?.symptoms || []);
    setSelectedMood(existingLog?.mood);
    setNotes(existingLog?.customNotes || status.notes || '');
  }, [selectedDate, entries, symptomLogs, settings]);

  if (!selectedDate) return null;

  const dayStatus = getDayStatus(selectedDate, entries, symptomLogs, settings);

  const handleToggleSymptom = (symId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symId) ? prev.filter(s => s !== symId) : [...prev, symId]
    );
  };

  const handleSave = () => {
    // Save period entry if period toggled or flow selected
    if (isPeriodDay || flow !== 'none') {
      const existingEntry = entries.find(e => e.startDate === selectedDate);
      addOrUpdatePeriodEntry({
        id: existingEntry?.id,
        startDate: selectedDate,
        endDate: existingEntry?.endDate || null,
        isConfirmed: true,
        flow: flow !== 'none' ? flow : 'medium',
        notes
      });
    } else if (!isPeriodDay && dayStatus.periodEntryId) {
      // Remove period entry if explicitly unselected
      deletePeriodEntry(dayStatus.periodEntryId);
    }

    // Save symptom log
    if (selectedSymptoms.length > 0 || selectedMood || notes || flow !== 'none') {
      logSymptom({
        date: selectedDate,
        symptoms: selectedSymptoms,
        mood: selectedMood,
        flow,
        customNotes: notes
      });
    } else {
      deleteSymptomLog(selectedDate);
    }

    setSelectedDate(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-rose-100 dark:border-slate-800 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-rose-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                {formatDisplayDate(selectedDate)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dayStatus.isConfirmedPeriod
                  ? 'Confirmed Period Day'
                  : dayStatus.isPredictedPeriod
                  ? 'Estimated Period Day'
                  : dayStatus.isFertileWindow
                  ? 'Estimated Fertile Window'
                  : 'Daily Tracking'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedDate(null)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Period Toggle & Flow */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-rose-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  Period Active Today
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextState = !isPeriodDay;
                  setIsPeriodDay(nextState);
                  if (nextState && flow === 'none') setFlow('medium');
                  if (!nextState) setFlow('none');
                }}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  isPeriodDay ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isPeriodDay ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Flow selector */}
            {(isPeriodDay || flow !== 'none') && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Flow Intensity
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {FLOW_OPTIONS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setFlow(f.id);
                        if (f.id !== 'none') setIsPeriodDay(true);
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all ${
                        flow === f.id
                          ? `${f.color} ring-2 ring-rose-500 ring-offset-1 dark:ring-offset-slate-900`
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mood Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Smile className="w-4 h-4 text-amber-500" />
              <span>Mood</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MOOD_OPTIONS.map(m => {
                const active = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(active ? undefined : m.id)}
                    className={`py-2.5 px-2 rounded-2xl border text-xs font-medium flex flex-col items-center space-y-1 transition-all ${
                      active
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Symptoms
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SYMPTOM_OPTIONS.map(sym => {
                const active = selectedSymptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => handleToggleSymptom(sym.id)}
                    className={`p-3 rounded-2xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                      active
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{sym.icon}</span>
                      <span>{sym.label}</span>
                    </div>
                    {active && <Check className="w-4 h-4 text-rose-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Record any personal reflections, physical sensations, or health notes..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-rose-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between space-x-3">
          <button
            type="button"
            onClick={() => {
              deleteSymptomLog(selectedDate);
              if (dayStatus.periodEntryId) deletePeriodEntry(dayStatus.periodEntryId);
              setSelectedDate(null);
            }}
            className="p-3 text-slate-400 hover:text-rose-600 rounded-2xl transition-colors flex items-center space-x-1 text-xs font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Log</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-md shadow-rose-500/20 transition-all"
            >
              Save Entry
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
