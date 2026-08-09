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
  const { cycleInfo, setCurrentTab, setSelectedDate, entries, addOrUpdatePeriodEntry } = useCycle();

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
      {/* Disclaimer Banner */}
      <div className="p-3 bg-rose-50/80 dark:bg-slate-800/80 border border-rose-100 dark:border-slate-800 rounded-2xl flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-800 dark:text-slate-100">Note:</strong> Cycle predictions are estimates calculated from your history. Individual cycles naturally vary.
        </p>
      </div>

      {/* Main Cycle Ring Dashboard */}
      <CycleRing cycleInfo={cycleInfo} onTap={() => setSelectedDate(todayStr)} />

      {/* Quick Action Button Bar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleQuickLogPeriodStart}
          className="flex-1 py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-md shadow-rose-500/20 transition-all"
        >
          <Droplets className="w-4 h-4" />
          <span>Period Started Today</span>
        </button>

        <button
          onClick={() => setSelectedDate(todayStr)}
          className="flex-1 py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4 text-rose-500" />
          <span>Log Symptoms</span>
        </button>
      </div>

      {/* Key Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CURRENT PERIOD CARD */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center space-x-1.5">
              <Droplets className="w-4 h-4" />
              <span>CURRENT PERIOD</span>
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-medium">
              {cycleInfo.isPeriodActive ? `Day ${cycleInfo.activePeriodDayNumber}` : 'Inactive'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">Started</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                {formatDisplayDate(cycleInfo.lastPeriodStartDate)}
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">Confirmed</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">Estimated End</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                {formatDisplayDate(cycleInfo.estimatedPeriodEndDate)}
                <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">Estimated</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">Avg Duration</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {cycleInfo.effectivePeriodDuration} days
              </span>
            </div>
          </div>
        </div>

        {/* NEXT PERIOD CARD */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center space-x-1.5">
              <CalendarIcon className="w-4 h-4" />
              <span>NEXT PERIOD</span>
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-medium">
              Predicted
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">Expected Start</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {formatDisplayDate(cycleInfo.estimatedNextPeriodDate)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">Days Remaining</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                {cycleInfo.daysUntilNextPeriod > 0
                  ? `${cycleInfo.daysUntilNextPeriod} days`
                  : 'Due today'}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">Cycle Length</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {cycleInfo.effectiveCycleLength} day cycle
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FERTILE & OVULATION PREDICTION TILE */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-violet-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 border border-violet-100 dark:border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Fertility & Ovulation Estimate
            </h3>
          </div>
          <span className="text-[10px] bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-medium">
            Based on cycle history
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-violet-100/50 dark:border-slate-700/50">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Estimated Ovulation
            </span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {formatDisplayDate(cycleInfo.estimatedOvulationDate)}
            </span>
          </div>

          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-violet-100/50 dark:border-slate-700/50">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Fertile Window
            </span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {formatDisplayDate(cycleInfo.fertileWindowStart).split(',')[0]} - {formatDisplayDate(cycleInfo.fertileWindowEnd).split(',')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK NAV SHORTCUTS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setCurrentTab('calendar')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-rose-200 dark:hover:border-rose-900 transition-all text-left"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">View Calendar</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Monthly View</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => setCurrentTab('history')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-rose-200 dark:hover:border-rose-900 transition-all text-left"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Recorded Cycles</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Cycle History</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>
    </div>
  );
};
