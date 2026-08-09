import React, { useState } from 'react';
import { Activity, Plus, Calendar, Smile, HeartPulse, FileText, ChevronRight } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { formatDisplayDate, formatDateKey } from '../../utils/cycleCalculations';

import { SymptomLog } from '../../types';

const SYMPTOM_NAMES: Record<string, { label: string; icon: string }> = {
  cramps: { label: 'Cramps', icon: '⚡' },
  headache: { label: 'Headache', icon: '🤕' },
  bloating: { label: 'Bloating', icon: '🎈' },
  fatigue: { label: 'Fatigue', icon: '😴' },
  mood_changes: { label: 'Mood Changes', icon: '🎭' },
  breast_tenderness: { label: 'Breast Tenderness', icon: '🌸' },
  back_pain: { label: 'Back Pain', icon: '⚡' },
  acne: { label: 'Acne', icon: '✨' },
  spotting: { label: 'Spotting', icon: '💧' },
  nausea: { label: 'Nausea', icon: '🤢' }
};

export const SymptomsView: React.FC = () => {
  const { symptomLogs, setSelectedDate } = useCycle();

  const todayStr = formatDateKey(new Date());

  const allLogs = Object.values(symptomLogs) as SymptomLog[];

  // Sort logs by date descending
  const sortedLogEntries = [...allLogs].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  // Compute symptom frequency stats
  const frequencyMap: Record<string, number> = {};
  allLogs.forEach(log => {
    log.symptoms?.forEach(s => {
      frequencyMap[s] = (frequencyMap[s] || 0) + 1;
    });
  });

  const sortedFrequency = Object.entries(frequencyMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Symptom Log
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track physical symptoms, mood variations, and custom notes
          </p>
        </div>

        <button
          onClick={() => setSelectedDate(todayStr)}
          className="py-2.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-rose-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Today</span>
        </button>
      </div>

      {/* Frequency Breakdown Card */}
      {sortedFrequency.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-md space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span>Most Frequent Symptoms</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {sortedFrequency.map(([symKey, count]) => {
              const info = SYMPTOM_NAMES[symKey] || { label: symKey, icon: '📍' };
              return (
                <div
                  key={symKey}
                  className="px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center space-x-2"
                >
                  <span>{info.icon}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{info.label}</span>
                  <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded-full">
                    {count}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log Feed */}
      <div className="space-y-3">
        {sortedLogEntries.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400">
            No symptoms logged yet. Tap "Log Today" or select any day on the calendar.
          </div>
        ) : (
          sortedLogEntries.map(log => (
            <div
              key={log.date}
              onClick={() => setSelectedDate(log.date)}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {formatDisplayDate(log.date)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {log.flow && log.flow !== 'none' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-semibold capitalize">
                      {log.flow} Flow
                    </span>
                  )}
                  {log.mood && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold capitalize">
                      Mood: {log.mood}
                    </span>
                  )}
                </div>
              </div>

              {/* Symptoms Pills */}
              {log.symptoms && log.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {log.symptoms.map(s => {
                    const info = SYMPTOM_NAMES[s] || { label: s, icon: '📍' };
                    return (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center space-x-1"
                      >
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                      </span>
                    );
                  })}
                </div>
              )}

              {log.customNotes && (
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 italic">
                  "{log.customNotes}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
