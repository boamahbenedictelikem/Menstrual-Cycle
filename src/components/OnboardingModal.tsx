import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Heart, Bell, ArrowRight, Check } from 'lucide-react';
import { useCycle } from '../context/CycleContext';
import { formatDateKey } from '../utils/cycleCalculations';

export const OnboardingModal: React.FC = () => {
  const { settings, completeOnboarding } = useCycle();
  const [step, setStep] = useState(1);

  // Default values matching prompt example (e.g., August 8, 2026, 28 days cycle, 5 days period)
  const [startDate, setStartDate] = useState('2026-08-08');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [enableReminders, setEnableReminders] = useState(true);

  if (settings.onboardingCompleted) return null;

  const handleFinish = () => {
    completeOnboarding({
      startDate,
      cycleLength,
      periodDuration,
      enableReminders
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-rose-100 dark:border-slate-800"
      >
        {/* Top Progress bar */}
        <div className="h-2 bg-slate-100 dark:bg-slate-800 flex">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-full flex-1 transition-all duration-300 ${
                s <= step ? 'bg-rose-500' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
                  <CalendarIcon className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    When did your last period start?
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Select the first day of your most recent menstrual cycle.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Period Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    max={formatDateKey(new Date())}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/20 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
                  <Clock className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    What is your average cycle length?
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    The number of days from Day 1 of a period to Day 1 of the next. Most cycles range from 21 to 35 days.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                      {cycleLength} <span className="text-lg font-normal text-slate-500">days</span>
                    </span>
                    <span className="text-xs bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 px-3 py-1 rounded-full font-medium">
                      Average: 28 days
                    </span>
                  </div>

                  <input
                    type="range"
                    min="20"
                    max="45"
                    value={cycleLength}
                    onChange={e => setCycleLength(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />

                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>20 days</span>
                    <span>28 days</span>
                    <span>45 days</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(1)}
                    className="py-3.5 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/20 transition-all"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
                  <Heart className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    How many days does your period usually last?
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Typical bleeding duration is between 3 to 7 days.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                      {periodDuration} <span className="text-lg font-normal text-slate-500">days</span>
                    </span>
                    <span className="text-xs bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 px-3 py-1 rounded-full font-medium">
                      Average: 5 days
                    </span>
                  </div>

                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={periodDuration}
                    onChange={e => setPeriodDuration(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />

                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>2 days</span>
                    <span>5 days</span>
                    <span>10 days</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(2)}
                    className="py-3.5 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/20 transition-all"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
                  <Bell className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Do you want period reminders?
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Receive helpful alerts before your expected period and fertile window.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEnableReminders(true)}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      enableReminders
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      <Check className={`w-5 h-5 ${enableReminders ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                    <span>Yes, remind me</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnableReminders(false)}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      !enableReminders
                        ? 'border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      <span className="text-xs">Off</span>
                    </div>
                    <span>Not right now</span>
                  </button>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
                  🔒 <strong>Privacy Guarantee:</strong> All health data is stored locally on your device and never shared publicly.
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(3)}
                    className="py-3.5 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinish}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/25 transition-all"
                  >
                    <span>Start Tracking</span>
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
