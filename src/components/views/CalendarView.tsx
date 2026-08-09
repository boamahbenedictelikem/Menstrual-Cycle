import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Sparkles } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { formatDateKey, getDayStatus } from '../../utils/cycleCalculations';

export const CalendarView: React.FC = () => {
  const { entries, symptomLogs, settings, setSelectedDate } = useCycle();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const today = new Date();
  const todayStr = formatDateKey(today);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Month Navigation Header and Calendar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 border border-rose-50 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-2xl text-rose-500">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
              aria-label="Previous month"
              className="p-2.5 rounded-2xl border border-rose-100 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 text-xs font-extrabold rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 hover:bg-rose-100 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
              aria-label="Next month"
              className="p-2.5 rounded-2xl border border-rose-100 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">
            {weekDays.map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const dateStr = formatDateKey(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const status = getDayStatus(dateStr, entries, symptomLogs, settings, todayStr);

              // Styling calculation
              let dayBg = 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300';
              let badgeDot = null;

              if (status.isConfirmedPeriod) {
                dayBg = 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20';
              } else if (status.isPredictedPeriod) {
                dayBg = 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-dashed border-rose-300 dark:border-rose-800 font-semibold';
              } else if (status.isOvulationDay) {
                dayBg = 'bg-violet-600 text-white font-bold shadow-md shadow-violet-500/20';
              } else if (status.isFertileWindow) {
                dayBg = 'bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-medium';
              }

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative min-h-[52px] sm:min-h-[64px] p-1 rounded-2xl flex flex-col items-center justify-between transition-all ${
                    !isCurrentMonth ? 'opacity-30' : ''
                  } ${dayBg} ${
                    status.isCurrentDay
                      ? 'ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-slate-900 font-extrabold'
                      : ''
                  }`}
                >
                  <span className="text-xs sm:text-sm mt-0.5">{format(day, 'd')}</span>

                  {/* Indicators / Icons inside cell */}
                  <div className="flex items-center space-x-1 my-0.5">
                    {status.isOvulationDay && (
                      <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                    )}
                    {status.hasSymptoms && !status.isConfirmedPeriod && !status.isOvulationDay && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-md space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Calendar Key & Legend
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded-lg bg-rose-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Period (Confirmed)</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded-lg bg-rose-100 dark:bg-rose-950 border border-dashed border-rose-300 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Period (Estimated)</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded-lg bg-violet-600 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Ovulation Day</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded-lg bg-violet-100 dark:bg-violet-950 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Fertile Window</span>
          </div>
        </div>
      </div>
    </div>
  );
};
