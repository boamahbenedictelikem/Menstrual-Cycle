import React, { useState } from 'react';
import { Lock, KeyRound } from 'lucide-react';
import { useCycle } from '../context/CycleContext';

export const PinLockModal: React.FC = () => {
  const { settings, isPinUnlocked, setIsPinUnlocked } = useCycle();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  if (!settings.pinLock.enabled || isPinUnlocked) return null;

  const handleDigit = (digit: string) => {
    if (pinInput.length >= 4) return;
    const newPin = pinInput + digit;
    setPinInput(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (newPin === settings.pinLock.pin) {
        setIsPinUnlocked(true);
        setPinInput('');
      } else {
        setError(true);
        setTimeout(() => setPinInput(''), 400);
      }
    }
  };

  const handleDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-rose-100 dark:border-slate-800 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/80 text-rose-500 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Passcode Protected
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter your 4-digit PIN to access your cycle history
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center space-x-3">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < pinInput.length
                  ? error
                    ? 'border-rose-500 bg-rose-500 animate-bounce'
                    : 'border-rose-500 bg-rose-500'
                  : 'border-slate-300 dark:border-slate-700 bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-500 font-semibold animate-pulse">
            Incorrect PIN. Please try again.
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((key, idx) => {
            if (key === '') return <div key={idx} />;
            if (key === 'back') {
              return (
                <button
                  key={idx}
                  onClick={handleDelete}
                  className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 mx-auto text-xs"
                >
                  Delete
                </button>
              );
            }
            return (
              <button
                key={idx}
                onClick={() => handleDigit(key)}
                className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-600 mx-auto transition-colors"
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
