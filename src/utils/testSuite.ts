import { parseISO, addDays, format } from 'date-fns';
import { calculateCycleState, calculateHistoricalAverages } from './cycleCalculations';
import { PeriodEntry, UserSettings, TestCaseResult } from '../types';

const defaultTestSettings: UserSettings = {
  averageCycleLength: 28,
  averagePeriodDuration: 5,
  remindersEnabled: false,
  reminders: {
    expectedPeriod: true,
    periodStarting: true,
    periodEnding: true,
    fertileWindow: true,
    dailySymptomTracking: false,
    reminderTime: '09:00'
  },
  theme: 'system',
  pinLock: { enabled: false, pin: '' },
  onboardingCompleted: true,
  useSmartAverage: false
};

export function runAllCycleTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  // Test 1: Standard 28 day cycle
  try {
    const periodStart = '2026-08-08';
    const entries: PeriodEntry[] = [
      { id: 't1', startDate: periodStart, endDate: '2026-08-12', isConfirmed: true }
    ];
    const settings = { ...defaultTestSettings, averageCycleLength: 28, averagePeriodDuration: 5 };
    const res = calculateCycleState(entries, settings, parseISO('2026-08-08'));

    const expectedEnd = '2026-08-12'; // Aug 8 + 5 - 1 = Aug 12
    const expectedNext = '2026-09-05'; // Aug 8 + 28 days = Sept 5
    const expectedOvulation = '2026-08-22'; // Sept 5 - 14 days = Aug 22

    const passed =
      res.estimatedPeriodEndDate === expectedEnd &&
      res.estimatedNextPeriodDate === expectedNext &&
      res.estimatedOvulationDate === expectedOvulation &&
      res.currentCycleDay === 1;

    results.push({
      title: '28-Day Cycle Calculation',
      description: 'Verifies next period (Sept 5), end date (Aug 12), and ovulation (Aug 22) for 28-day cycle starting Aug 8, 2026.',
      passed,
      details: `Calculated End: ${res.estimatedPeriodEndDate} (Exp: ${expectedEnd}), Next: ${res.estimatedNextPeriodDate} (Exp: ${expectedNext}), Ovulation: ${res.estimatedOvulationDate} (Exp: ${expectedOvulation})`
    });
  } catch (err) {
    results.push({
      title: '28-Day Cycle Calculation',
      description: 'Standard 28 day cycle test execution',
      passed: false,
      details: String(err)
    });
  }

  // Test 2: Short 21 day cycle
  try {
    const entries: PeriodEntry[] = [
      { id: 't2', startDate: '2026-08-01', endDate: '2026-08-04', isConfirmed: true }
    ];
    const settings = { ...defaultTestSettings, averageCycleLength: 21, averagePeriodDuration: 4 };
    const res = calculateCycleState(entries, settings, parseISO('2026-08-01'));

    const expectedNext = '2026-08-22'; // Aug 1 + 21 = Aug 22
    const expectedOvulation = '2026-08-08'; // Aug 22 - 14 = Aug 8

    const passed = res.estimatedNextPeriodDate === expectedNext && res.estimatedOvulationDate === expectedOvulation;

    results.push({
      title: '21-Day Cycle Calculation',
      description: 'Verifies short cycle duration where next period is Aug 22 and ovulation is Aug 8.',
      passed,
      details: `Calculated Next: ${res.estimatedNextPeriodDate} (Exp: ${expectedNext}), Ovulation: ${res.estimatedOvulationDate} (Exp: ${expectedOvulation})`
    });
  } catch (err) {
    results.push({
      title: '21-Day Cycle Calculation',
      description: 'Short cycle test execution',
      passed: false,
      details: String(err)
    });
  }

  // Test 3: Long 35 day cycle
  try {
    const entries: PeriodEntry[] = [
      { id: 't3', startDate: '2026-08-01', endDate: '2026-08-07', isConfirmed: true }
    ];
    const settings = { ...defaultTestSettings, averageCycleLength: 35, averagePeriodDuration: 7 };
    const res = calculateCycleState(entries, settings, parseISO('2026-08-01'));

    const expectedNext = '2026-09-05'; // Aug 1 + 35 = Sept 5
    const expectedOvulation = '2026-08-22'; // Sept 5 - 14 = Aug 22

    const passed = res.estimatedNextPeriodDate === expectedNext && res.estimatedOvulationDate === expectedOvulation;

    results.push({
      title: '35-Day Cycle Calculation',
      description: 'Verifies long 35-day cycle calculation.',
      passed,
      details: `Calculated Next: ${res.estimatedNextPeriodDate} (Exp: ${expectedNext}), Ovulation: ${res.estimatedOvulationDate}`
    });
  } catch (err) {
    results.push({
      title: '35-Day Cycle Calculation',
      description: 'Long cycle test execution',
      passed: false,
      details: String(err)
    });
  }

  // Test 4: Periods crossing into a new month
  try {
    const entries: PeriodEntry[] = [
      { id: 't4', startDate: '2026-08-28', endDate: null, isConfirmed: true }
    ];
    const settings = { ...defaultTestSettings, averageCycleLength: 28, averagePeriodDuration: 5 };
    const res = calculateCycleState(entries, settings, parseISO('2026-08-28'));

    const expectedEnd = '2026-09-01'; // Aug 28 + 5 - 1 = Sept 1
    const expectedNext = '2026-09-25'; // Aug 28 + 28 = Sept 25

    const passed = res.estimatedPeriodEndDate === expectedEnd && res.estimatedNextPeriodDate === expectedNext;

    results.push({
      title: 'Month Boundary Crossing',
      description: 'Ensures dates spanning August to September compute properly across month boundaries.',
      passed,
      details: `Calculated End: ${res.estimatedPeriodEndDate} (Exp: ${expectedEnd}), Next: ${res.estimatedNextPeriodDate} (Exp: ${expectedNext})`
    });
  } catch (err) {
    results.push({
      title: 'Month Boundary Crossing',
      description: 'Month boundary crossing execution',
      passed: false,
      details: String(err)
    });
  }

  // Test 5: Periods crossing into a new year
  try {
    const entries: PeriodEntry[] = [
      { id: 't5', startDate: '2026-12-29', endDate: null, isConfirmed: true }
    ];
    const settings = { ...defaultTestSettings, averageCycleLength: 28, averagePeriodDuration: 5 };
    const res = calculateCycleState(entries, settings, parseISO('2026-12-29'));

    const expectedEnd = '2027-01-02'; // Dec 29 + 5 - 1 = Jan 2, 2027
    const expectedNext = '2027-01-26'; // Dec 29 + 28 = Jan 26, 2027

    const passed = res.estimatedPeriodEndDate === expectedEnd && res.estimatedNextPeriodDate === expectedNext;

    results.push({
      title: 'Year Boundary Crossing',
      description: 'Ensures dates spanning December 2026 to January 2027 calculate correctly across year transition.',
      passed,
      details: `Calculated End: ${res.estimatedPeriodEndDate} (Exp: ${expectedEnd}), Next: ${res.estimatedNextPeriodDate} (Exp: ${expectedNext})`
    });
  } catch (err) {
    results.push({
      title: 'Year Boundary Crossing',
      description: 'Year boundary crossing execution',
      passed: false,
      details: String(err)
    });
  }

  // Test 6: Irregular cycles average calculation
  try {
    const entries: PeriodEntry[] = [
      { id: 'c1', startDate: '2026-05-01', endDate: '2026-05-06', isConfirmed: true }, // 28 days to next
      { id: 'c2', startDate: '2026-05-29', endDate: '2026-06-03', isConfirmed: true }, // 29 days to next
      { id: 'c3', startDate: '2026-06-27', endDate: '2026-07-02', isConfirmed: true }  // avg = (28+29)/2 = 28.5 -> 29 days
    ];
    const avg = calculateHistoricalAverages(entries, 28, 5);

    const passed = avg.cycleLength >= 28 && avg.cycleLength <= 29;

    results.push({
      title: 'Irregular Cycle Averages',
      description: 'Computes dynamically averaged cycle lengths (28, 29 days -> ~29 days average).',
      passed,
      details: `Calculated Avg Cycle Length: ${avg.cycleLength} days (Recorded cycles: ${avg.recordedCycleCount})`
    });
  } catch (err) {
    results.push({
      title: 'Irregular Cycle Averages',
      description: 'Irregular cycle test execution',
      passed: false,
      details: String(err)
    });
  }

  // Test 7: Missing period data fallback
  try {
    const entries: PeriodEntry[] = [];
    const settings = { ...defaultTestSettings, averageCycleLength: 30, averagePeriodDuration: 6 };
    const res = calculateCycleState(entries, settings, parseISO('2026-08-09'));

    const passed =
      res.effectiveCycleLength === 30 &&
      res.effectivePeriodDuration === 6 &&
      res.daysUntilNextPeriod === 30;

    results.push({
      title: 'Missing Period Data Handling',
      description: 'Gracefully uses user default settings when zero historical entries exist without crashing.',
      passed,
      details: `Cycle Length Fallback: ${res.effectiveCycleLength}, Days Until Next: ${res.daysUntilNextPeriod}`
    });
  } catch (err) {
    results.push({
      title: 'Missing Period Data Handling',
      description: 'Missing period data test execution',
      passed: false,
      details: String(err)
    });
  }

  return results;
}
