import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Calendar, Clock, FileText, ChevronRight } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { formatDisplayDate, formatDateKey } from '../../utils/cycleCalculations';
import { PeriodEntry } from '../../types';
import { differenceInCalendarDays, parseISO, isValid } from 'date-fns';

export const HistoryView: React.FC = () => {
  const { entries, addOrUpdatePeriodEntry, deletePeriodEntry, setSelectedDate } = useCycle();
  const [editingEntry, setEditingEntry] = useState<PeriodEntry | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formStart, setFormStart] = useState('2026-07-11');
  const [formEnd, setFormEnd] = useState('2026-07-15');
  const [formNotes, setFormNotes] = useState('');

  const sortedEntries = [...entries].sort((a, b) => b.startDate.localeCompare(a.startDate));

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setFormStart(formatDateKey(new Date()));
    setFormEnd(formatDateKey(new Date()));
    setFormNotes('');
    setIsAdding(true);
  };

  const handleOpenEdit = (entry: PeriodEntry) => {
    setEditingEntry(entry);
    setFormStart(entry.startDate);
    setFormEnd(entry.endDate || entry.startDate);
    setFormNotes(entry.notes || '');
    setIsAdding(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    addOrUpdatePeriodEntry({
      id: editingEntry?.id,
      startDate: formStart,
      endDate: formEnd,
      isConfirmed: true,
      notes: formNotes
    });
    setIsAdding(false);
    setEditingEntry(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Cycle History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Recorded menstrual cycles and duration tracking
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-rose-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cycle</span>
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {isAdding && (
        <form
          onSubmit={handleSaveForm}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-100 dark:border-slate-800 shadow-xl space-y-4"
        >
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            {editingEntry ? 'Edit Cycle Entry' : 'Add Historical Cycle'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500">First Day (Start)</label>
              <input
                type="date"
                required
                value={formStart}
                onChange={e => setFormStart(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500">Last Day (End)</label>
              <input
                type="date"
                value={formEnd}
                onChange={e => setFormEnd(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-500">Notes (Optional)</label>
            <input
              type="text"
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              placeholder="e.g. Mild cramps, started on vacation"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm"
            >
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* History Cards List */}
      <div className="space-y-3">
        {sortedEntries.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400">
            No cycle records found. Tap "Add Cycle" to record past periods.
          </div>
        ) : (
          sortedEntries.map((entry, index) => {
            const startObj = parseISO(entry.startDate);
            const endObj = entry.endDate ? parseISO(entry.endDate) : null;

            const periodDuration = endObj && isValid(endObj)
              ? differenceInCalendarDays(endObj, startObj) + 1
              : null;

            // Calculate cycle length to next recorded period
            let cycleLength: number | null = null;
            if (index > 0) { // sorted descending so previous cycle in time is at index + 1
              const nextEarlierEntry = sortedEntries[index + 1];
              if (nextEarlierEntry) {
                cycleLength = differenceInCalendarDays(
                  startObj,
                  parseISO(nextEarlierEntry.startDate)
                );
              }
            }

            return (
              <div
                key={entry.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-500 flex items-center justify-center font-bold">
                      🌸
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                        {formatDisplayDate(entry.startDate)}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {entry.endDate ? `Ended ${formatDisplayDate(entry.endDate)}` : 'Ongoing / Unspecified end'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-xl"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePeriodEntry(entry.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Duration & Cycle Badges */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-slate-400 block text-[10px]">Period Duration</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {periodDuration ? `${periodDuration} days` : 'Active / N/A'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-slate-400 block text-[10px]">Cycle Length</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {cycleLength ? `${cycleLength} days` : 'N/A (First record)'}
                    </span>
                  </div>
                </div>

                {entry.notes && (
                  <p className="text-xs italic text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                    "{entry.notes}"
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
