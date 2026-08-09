import React from 'react';
import { motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Sparkles,
  Info,
  ChevronRight,
  Clock,
  HeartPulse,
  Activity,
  Droplets
} from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { CycleRing } from '../CycleRing';
import { formatDisplayDate, formatDateKey } from '../../utils/cycleCalculations';

export const HomeView: React.FC = () => {
  const { cycleInfo, setCurrentTab, setSelectedDate, entries, addOrUpdatePeriodEntry, settings } = useCycle();

  const todayStr = formatDateKey(new Date());

  const handleQuickLogPeriodStart = () => {
    addOrUpdatePeriodEntry({
      startDate: todayStr,
      endDate: null,
      isConfirmed: true,
      notes: 'Period started today'
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header Banner matching Sleek Interface design */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Hello{settings.userName ? `, ${settings.userName}` : ''}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm mt-1">
            Cycle day {cycleInfo.currentCycleDay} — <span className="capitalize text-rose-500 dark:text-rose-400">{cycleInfo.phaseName}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2.5 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl shadow-sm border border-rose-50 dark:border-slate-800 self-start sm:self-auto">
          <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
            {cycleInfo.isPeriodActive ? 'Active Period' : 'Tracking Active'}
          </span>
          <div className="w-2.5 h-2.5 bg-rose-400 rounded-full animate-pulse" />
        </div>
      </header>

      {/* Main Cycle Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cycle Ring Main Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 shadow-sm border border-rose-50 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-50 dark:bg-rose-950/30 rounded-full -mr-24 -mt-24 opacity-50 pointer-events-none" />
          <CycleRing cycleInfo={cycleInfo} onTap={() => setSelectedDate(todayStr)} />
          
          <div className="mt-8 grid grid-cols-2 gap-8 text-center w-full border-t border-rose-50 dark:border-slate-800 pt-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Started</p>
              <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                {formatDisplayDate(cycleInfo.lastPeriodStartDate)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Est. End</p>
              <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                {formatDisplayDate(cycleInfo.estimatedPeriodEndDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Next Period & Fertile Window Cards Column */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Indigo Next Period Card */}
          <div className="bg-indigo-500 rounded-[32px] p-6 text-white shadow-lg shadow-indigo-100 dark:shadow-none flex-1 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 opacity-10 p-4 pointer-events-none">
              <CalendarIcon className="w-24 h-24" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-100/90 mb-1">Next Period</p>
              <h3 className="text-2xl font-black tracking-tight mb-1">
                {formatDisplayDate(cycleInfo.estimatedNextPeriodDate)}
              </h3>
              <p className="text-xs font-semibold text-indigo-100/80">
                {cycleInfo.daysUntilNextPeriod > 0
                  ? `${cycleInfo.daysUntilNextPeriod} days to go`
                  : 'Due today'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20">
              <p className="text-[11px] italic text-indigo-100/80">
                * Based on {cycleInfo.effectiveCycleLength}-day average cycle length
              </p>
            </div>
          </div>

          {/* Fertile Window Card */}
          <div className="bg-rose-50 dark:bg-slate-900 rounded-[32px] p-6 border border-rose-100 dark:border-slate-800 flex-1 flex flex-col justify-between">
            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-3">Fertile Window</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Est. Ovulation</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {formatDisplayDate(cycleInfo.estimatedOvulationDate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Window</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {formatDisplayDate(cycleInfo.fertileWindowStart).split(',')[0]} - {formatDisplayDate(cycleInfo.fertileWindowEnd).split(',')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Button Bar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleQuickLogPeriodStart}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-rose-200 dark:shadow-none transition-all"
        >
          <Droplets className="w-4 h-4" />
          <span>Period Started Today</span>
        </button>

        <button
          onClick={() => setSelectedDate(todayStr)}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50/50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4 text-rose-500" />
          <span>Log Symptoms</span>
        </button>
      </div>

      {/* History and Shortcuts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-rose-50 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Cycles</h4>
            <button
              onClick={() => setCurrentTab('history')}
              className="text-xs text-rose-500 font-bold flex items-center hover:underline"
            >
              View all <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {entries.slice(0, 2).map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {formatDisplayDate(entry.startDate)}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {entry.endDate ? `Recorded` : 'Active'}
                </span>
              </div>
            ))}
            {entries.length === 0 && (
              <p className="text-xs text-slate-400 italic">No cycle entries yet recorded.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-rose-50 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Daily Symptoms</h4>
            <p className="text-xs text-slate-400 mt-1">Track flow, mood, cramps, and notes</p>
            <div className="flex mt-3 -space-x-1">
              <div className="w-8 h-8 rounded-full bg-rose-100 border-2 border-white dark:border-slate-900 flex items-center justify-center text-rose-500 text-xs font-bold">🩸</div>
              <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white dark:border-slate-900 flex items-center justify-center text-amber-500 text-xs font-bold">⚡</div>
              <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white dark:border-slate-900 flex items-center justify-center text-indigo-500 text-xs font-bold">😊</div>
            </div>
          </div>
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md shadow-rose-200 dark:shadow-none transition-all"
          >
            Log Data
          </button>
        </div>
      </div>
    </div>
  );
};
