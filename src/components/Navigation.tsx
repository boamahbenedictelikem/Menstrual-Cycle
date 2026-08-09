import React from 'react';
import { Home, Calendar, History, Activity, Settings, Moon, Sun, Lock } from 'lucide-react';
import { useCycle } from '../context/CycleContext';
import { NavTab } from '../types';

export const Navigation: React.FC = () => {
  const { currentTab, setCurrentTab, settings, toggleTheme } = useCycle();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
    { id: 'symptoms', label: 'Symptoms', icon: <Activity className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Top Bar for Desktop/Tablet and Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-rose-100/80 dark:border-slate-800 transition-colors shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-200 dark:shadow-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                Cycle Tracker
              </h1>
              <p className="text-[10px] text-rose-500 dark:text-rose-400 font-bold tracking-wider uppercase">
                Privacy Protected
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-rose-50/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-rose-100/50 dark:border-slate-800">
            {navItems.map(item => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
                      : 'text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-white/80 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            {settings.pinLock.enabled && (
              <span title="PIN Lock Active" className="p-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-full text-xs flex items-center gap-1 px-2">
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">Locked</span>
              </span>
            )}

            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-rose-100 dark:border-slate-800 px-2 py-2 transition-colors">
        <nav className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map(item => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                  active
                    ? 'text-rose-600 dark:text-rose-400 font-semibold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    active ? 'bg-rose-100 dark:bg-rose-950/60' : ''
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
