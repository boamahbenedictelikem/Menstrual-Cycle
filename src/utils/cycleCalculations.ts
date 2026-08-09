import {
  addDays,
  subDays,
  format,
  parseISO,
  differenceInCalendarDays,
  isSameDay,
  isAfter,
  isBefore,
  isWithinInterval,
  isValid
} from 'date-fns';
import {
  PeriodEntry,
  UserSettings,
  CycleCalculationResult,
  DayStatus,
  SymptomLog,
  CyclePhase
} from '../types';

/**
 * Format a Date object or YYYY-MM-DD string into standard YYYY-MM-DD format
 */
export function formatDateKey(date: Date | string): string {
  if (typeof date === 'string') {
    // If already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const parsed = parseISO(date);
    if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
  }
  return format(date as Date, 'yyyy-MM-dd');
}

/**
 * Format date for user display e.g. "August 8, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return dateStr;
    return format(parsed, 'MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Format short display date e.g. "Aug 8"
 */
export function formatShortDate(dateStr: string): string {
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return dateStr;
    return format(parsed, 'MMM d');
  } catch {
    return dateStr;
  }
}

/**
 * Calculates historical average cycle length from user's recorded periods
 */
export function calculateHistoricalAverages(
  entries: PeriodEntry[],
  fallbackCycleLength: number,
  fallbackPeriodDuration: number
): { cycleLength: number; periodDuration: number; recordedCycleCount: number } {
  // Sort entries by start date ascending
  const sorted = [...entries]
    .filter(e => e.startDate && isValid(parseISO(e.startDate)))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (sorted.length === 0) {
    return {
      cycleLength: fallbackCycleLength,
      periodDuration: fallbackPeriodDuration,
      recordedCycleCount: 0
    };
  }

  // Calculate cycle lengths between consecutive period start dates
  const cycleLengths: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentStart = parseISO(sorted[i].startDate);
    const nextStart = parseISO(sorted[i + 1].startDate);
    const length = differenceInCalendarDays(nextStart, currentStart);
    // Ignore extreme outliers for average calculation (e.g. < 14 or > 60 days)
    if (length >= 14 && length <= 60) {
      cycleLengths.push(length);
    }
  }

  // Calculate period durations
  const periodDurations: number[] = [];
  for (const entry of sorted) {
    if (entry.endDate && isValid(parseISO(entry.endDate))) {
      const start = parseISO(entry.startDate);
      const end = parseISO(entry.endDate);
      const duration = differenceInCalendarDays(end, start) + 1;
      if (duration >= 1 && duration <= 15) {
        periodDurations.push(duration);
      }
    }
  }

  const avgCycleLength =
    cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : fallbackCycleLength;

  const avgPeriodDuration =
    periodDurations.length > 0
      ? Math.round(periodDurations.reduce((a, b) => a + b, 0) / periodDurations.length)
      : fallbackPeriodDuration;

  return {
    cycleLength: avgCycleLength,
    periodDuration: avgPeriodDuration,
    recordedCycleCount: cycleLengths.length
  };
}

/**
 * Calculates the current cycle state and future predictions
 */
export function calculateCycleState(
  entries: PeriodEntry[],
  settings: UserSettings,
  targetDate: Date = new Date()
): CycleCalculationResult {
  const targetDateStr = formatDateKey(targetDate);
  const targetDateObj = parseISO(targetDateStr);

  // Filter confirmed or user-entered periods sorted descending by start date
  const sortedEntries = [...entries]
    .filter(e => e.startDate && isValid(parseISO(e.startDate)))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Determine effective cycle length & duration
  let effectiveCycleLength = settings.averageCycleLength;
  let effectivePeriodDuration = settings.averagePeriodDuration;

  if (settings.useSmartAverage && sortedEntries.length >= 2) {
    const averages = calculateHistoricalAverages(
      sortedEntries,
      settings.averageCycleLength,
      settings.averagePeriodDuration
    );
    effectiveCycleLength = averages.cycleLength;
    effectivePeriodDuration = averages.periodDuration;
  }

  // If no period data exists, build default state from targetDate or settings
  if (sortedEntries.length === 0) {
    const fallbackStart = targetDateStr;
    const fallbackStartObj = parseISO(fallbackStart);
    const estEnd = formatDateKey(addDays(fallbackStartObj, effectivePeriodDuration - 1));
    const estNextStart = formatDateKey(addDays(fallbackStartObj, effectiveCycleLength));
    const estNextStartObj = parseISO(estNextStart);
    const estOvulation = formatDateKey(subDays(estNextStartObj, 14));
    const estOvulationObj = parseISO(estOvulation);

    return {
      currentCycleDay: 1,
      currentPhase: 'menstruation',
      phaseName: 'Menstruation Phase',
      phaseDescription: 'Your period has started. Take time for gentle rest.',
      lastPeriodStartDate: fallbackStart,
      estimatedPeriodEndDate: estEnd,
      estimatedNextPeriodDate: estNextStart,
      daysUntilNextPeriod: effectiveCycleLength,
      estimatedOvulationDate: estOvulation,
      fertileWindowStart: formatDateKey(subDays(estOvulationObj, 5)),
      fertileWindowEnd: estOvulation,
      effectiveCycleLength,
      effectivePeriodDuration,
      isPeriodActive: true,
      activePeriodDayNumber: 1
    };
  }

  // Find the most recent period start date on or before targetDate
  let mostRecentEntry = sortedEntries.find(
    e => !isAfter(parseISO(e.startDate), targetDateObj)
  );

  // If all entries are in the future relative to targetDate, use the earliest entry
  if (!mostRecentEntry) {
    mostRecentEntry = sortedEntries[sortedEntries.length - 1];
  }

  const lastPeriodStart = mostRecentEntry.startDate;
  const lastPeriodStartObj = parseISO(lastPeriodStart);

  // Calculate Cycle Day 1 = First day of menstruation
  const daysSinceStart = differenceInCalendarDays(targetDateObj, lastPeriodStartObj);
  const currentCycleDay = daysSinceStart >= 0 ? daysSinceStart + 1 : 1;

  // Estimated period end: Period start + duration - 1 day
  let estPeriodEndStr: string;
  let isPeriodActive = false;
  let activePeriodDayNumber: number | null = null;

  if (mostRecentEntry.endDate) {
    estPeriodEndStr = mostRecentEntry.endDate;
    const endDateObj = parseISO(mostRecentEntry.endDate);
    if (!isBefore(endDateObj, targetDateObj) && !isAfter(lastPeriodStartObj, targetDateObj)) {
      isPeriodActive = true;
      activePeriodDayNumber = differenceInCalendarDays(targetDateObj, lastPeriodStartObj) + 1;
    }
  } else {
    // If ongoing or open-ended, calculate using estimated period duration
    const estEndObj = addDays(lastPeriodStartObj, effectivePeriodDuration - 1);
    estPeriodEndStr = formatDateKey(estEndObj);
    if (daysSinceStart >= 0 && daysSinceStart < effectivePeriodDuration) {
      isPeriodActive = true;
      activePeriodDayNumber = daysSinceStart + 1;
    }
  }

  // Estimated next period = Previous period start date + average cycle length
  const nextPeriodObj = addDays(lastPeriodStartObj, effectiveCycleLength);
  const estimatedNextPeriodDate = formatDateKey(nextPeriodObj);

  // Days remaining until next period
  const daysUntilNextPeriod = differenceInCalendarDays(nextPeriodObj, targetDateObj);

  // Estimated ovulation ≈ Next period date - 14 days
  const ovulationObj = subDays(nextPeriodObj, 14);
  const estimatedOvulationDate = formatDateKey(ovulationObj);

  // Estimated fertile window: 5 days before ovulation plus ovulation day (6 days total)
  const fertileStartObj = subDays(ovulationObj, 5);
  const fertileWindowStart = formatDateKey(fertileStartObj);
  const fertileWindowEnd = estimatedOvulationDate;

  // Determine current phase
  let currentPhase: CyclePhase = 'follicular';
  let phaseName = 'Follicular Phase';
  let phaseDescription = 'Estrogen rises as your body prepares for ovulation. Focus on active energy.';

  if (isPeriodActive) {
    currentPhase = 'menstruation';
    phaseName = 'Menstruation Phase';
    phaseDescription = 'Your period is active. Prioritize hydration and light movement.';
  } else if (
    !isBefore(targetDateObj, fertileStartObj) &&
    !isAfter(targetDateObj, ovulationObj)
  ) {
    currentPhase = 'ovulation';
    phaseName = 'Fertile & Ovulation Phase';
    phaseDescription = 'Peak fertility window. Energy and mood are often highest.';
  } else if (isAfter(targetDateObj, ovulationObj)) {
    currentPhase = 'luteal';
    phaseName = 'Luteal Phase';
    phaseDescription = 'Progesterone rises. You may experience PMS symptoms as your next cycle approaches.';
  }

  return {
    currentCycleDay,
    currentPhase,
    phaseName,
    phaseDescription,
    lastPeriodStartDate: lastPeriodStart,
    estimatedPeriodEndDate: estPeriodEndStr,
    estimatedNextPeriodDate,
    daysUntilNextPeriod,
    estimatedOvulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    effectiveCycleLength,
    effectivePeriodDuration,
    isPeriodActive,
    activePeriodDayNumber
  };
}

/**
 * Returns detailed status for a given calendar date
 */
export function getDayStatus(
  dateStr: string,
  entries: PeriodEntry[],
  symptomLogs: Record<string, SymptomLog>,
  settings: UserSettings,
  todayStr: string = formatDateKey(new Date())
): DayStatus {
  const dateObj = parseISO(dateStr);
  const isCurrentDay = dateStr === todayStr;

  // Check if date belongs to a confirmed period entry
  const confirmedEntry = entries.find(e => {
    if (!e.startDate) return false;
    const startObj = parseISO(e.startDate);
    const endObj = e.endDate
      ? parseISO(e.endDate)
      : addDays(startObj, settings.averagePeriodDuration - 1);

    return (
      (isSameDay(dateObj, startObj) || isAfter(dateObj, startObj)) &&
      (isSameDay(dateObj, endObj) || isBefore(dateObj, endObj))
    );
  });

  const isConfirmedPeriod = !!confirmedEntry && confirmedEntry.isConfirmed;

  // Calculate overall cycle projection to check predicted period & fertile window
  const cycleInfo = calculateCycleState(entries, settings, parseISO(entries[0]?.startDate || todayStr));

  // Projected future period check (if no confirmed period overlaps)
  let isPredictedPeriod = false;
  if (!confirmedEntry) {
    // Check if dateStr matches predicted period ranges in future cycles
    const lastStartObj = parseISO(cycleInfo.lastPeriodStartDate);
    const diffDays = differenceInCalendarDays(dateObj, lastStartObj);
    if (diffDays >= 0) {
      const cycleOffset = Math.floor(diffDays / cycleInfo.effectiveCycleLength);
      const dayInOffsetCycle = diffDays % cycleInfo.effectiveCycleLength;
      if (cycleOffset >= 0 && dayInOffsetCycle < cycleInfo.effectivePeriodDuration) {
        isPredictedPeriod = true;
      }
    }
  }

  // Check ovulation and fertile window
  let isOvulationDay = false;
  let isFertileWindow = false;

  const lastStartObj = parseISO(cycleInfo.lastPeriodStartDate);
  const diffDays = differenceInCalendarDays(dateObj, lastStartObj);
  if (diffDays >= 0) {
    const dayInOffsetCycle = diffDays % cycleInfo.effectiveCycleLength;
    const ovulationDayInCycle = cycleInfo.effectiveCycleLength - 14;
    const fertileStartDayInCycle = ovulationDayInCycle - 5;

    if (dayInOffsetCycle === ovulationDayInCycle) {
      isOvulationDay = true;
      isFertileWindow = true;
    } else if (dayInOffsetCycle >= fertileStartDayInCycle && dayInOffsetCycle <= ovulationDayInCycle) {
      isFertileWindow = true;
    }
  }

  const symptomLog = symptomLogs[dateStr];
  const symptoms = symptomLog?.symptoms || [];
  const hasSymptoms = symptoms.length > 0 || !!symptomLog?.customNotes || !!symptomLog?.flow;

  return {
    date: dateStr,
    isCurrentDay,
    isConfirmedPeriod,
    isPredictedPeriod: !isConfirmedPeriod && isPredictedPeriod,
    isFertileWindow,
    isOvulationDay,
    hasSymptoms,
    symptoms,
    flow: symptomLog?.flow || (confirmedEntry?.flow),
    notes: symptomLog?.customNotes || confirmedEntry?.notes,
    periodEntryId: confirmedEntry?.id
  };
}
