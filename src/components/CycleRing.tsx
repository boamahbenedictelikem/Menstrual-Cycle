import React from 'react';
import { motion } from 'motion/react';
import { CycleCalculationResult } from '../types';

interface CycleRingProps {
  cycleInfo: CycleCalculationResult;
  onTap?: () => void;
}

export const CycleRing: React.FC<CycleRingProps> = ({ cycleInfo, onTap }) => {
  const {
    currentCycleDay,
    effectiveCycleLength,
    currentPhase,
    phaseName,
    isPeriodActive,
    activePeriodDayNumber,
    daysUntilNextPeriod
  } = cycleInfo;

  // Calculate percentage of cycle completed
  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentCycleDay - 1) / effectiveCycleLength) * 100)
  );

  // Colors based on phase
  const getPhaseColors = () => {
    switch (currentPhase) {
      case 'menstruation':
        return {
          stroke: '#f43f5e', // rose-500
          gradientFrom: '#f43f5e',
          gradientTo: '#fb7185',
          bgRing: 'stroke-rose-100 dark:stroke-rose-950/40',
          badgeBg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300',
          glow: 'shadow-rose-500/20'
        };
      case 'ovulation':
        return {
          stroke: '#8b5cf6', // violet-500
          gradientFrom: '#8b5cf6',
          gradientTo: '#c084fc',
          bgRing: 'stroke-violet-100 dark:stroke-violet-950/40',
          badgeBg: 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300',
          glow: 'shadow-violet-500/20'
        };
      case 'luteal':
        return {
          stroke: '#f59e0b', // amber-500
          gradientFrom: '#f59e0b',
          gradientTo: '#fbbf24',
          bgRing: 'stroke-amber-100 dark:stroke-amber-950/40',
          badgeBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300',
          glow: 'shadow-amber-500/20'
        };
      default: // follicular
        return {
          stroke: '#10b981', // emerald-500
          gradientFrom: '#10b981',
          gradientTo: '#34d399',
          bgRing: 'stroke-emerald-100 dark:stroke-emerald-950/40',
          badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300',
          glow: 'shadow-emerald-500/20'
        };
    }
  };

  const colors = getPhaseColors();

  // SVG ring calculations
  const size = 240;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      onClick={onTap}
      className={`relative flex flex-col items-center justify-center p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl ${colors.glow} transition-all cursor-pointer group hover:scale-[1.01]`}
    >
      <div className="relative w-[240px] h-[240px] flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.gradientFrom} />
              <stop offset="100%" stopColor={colors.gradientTo} />
            </linearGradient>
          </defs>

          {/* Background Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            className={`${colors.bgRing} transition-colors`}
            fill="none"
          />

          {/* Animated Progress Ring */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#ringGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full mb-1 ${colors.badgeBg}`}>
            {phaseName}
          </span>

          {isPeriodActive ? (
            <>
              <span className="text-xs font-medium text-rose-500 dark:text-rose-400 uppercase tracking-wider">
                CURRENT PERIOD
              </span>
              <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 my-0.5">
                Day {activePeriodDayNumber ?? 1}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Cycle Day {currentCycleDay} of {effectiveCycleLength}
              </span>
            </>
          ) : (
            <>
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                Day {currentCycleDay}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium my-0.5">
                of {effectiveCycleLength}-day cycle
              </span>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {daysUntilNextPeriod > 0
                  ? `${daysUntilNextPeriod} days to next period`
                  : 'Expected today'}
              </span>
            </>
          )}

          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Tap to log details
          </span>
        </div>
      </div>
    </div>
  );
};
