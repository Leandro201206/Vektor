import React, { useState, useEffect } from 'react';
import { WeightEntry } from '../types';
import { X, Calendar, Scale } from 'lucide-react';

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<WeightEntry, 'id' | 'timestamp'> & { id?: string }) => void;
  initialEntry?: WeightEntry | null;
  latestWeight?: number;
  unit?: string;
}

export const LogEntryModal: React.FC<LogEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry,
  latestWeight = 80.0,
  unit = 'kg',
}) => {
  const [date, setDate] = useState<string>('');
  const [weight, setWeight] = useState<string>('80');
  const [waist, setWaist] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialEntry) {
        setDate(initialEntry.date);
        setWeight(String(initialEntry.weight));
        setWaist(initialEntry.waist ? String(initialEntry.waist) : '');
        setBodyFat(initialEntry.bodyFat ? String(initialEntry.bodyFat) : '');
        setNotes(initialEntry.notes || '');
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        setDate(todayStr);
        setWeight(String(latestWeight || 80.0));
        setWaist('');
        setBodyFat('');
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, initialEntry, latestWeight]);

  if (!isOpen) return null;

  const handleAdjustWeight = (delta: number) => {
    setWeight(prev => String(Number((Math.max(20, (Number(prev) || 20) + delta)).toFixed(1))));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError('Bitte wähle ein Datum aus.');
      return;
    }
    const parsedWeight = Number(weight);
    if (!weight.trim() || !Number.isFinite(parsedWeight) || parsedWeight <= 20 || parsedWeight >= 400) {
      setError('Bitte gib ein realistisches Gewicht ein (20 - 400 kg).');
      return;
    }

    onSave({
      id: initialEntry?.id,
      date,
      weight: Number(parsedWeight.toFixed(1)),
      waist: waist ? Number(parseFloat(waist).toFixed(1)) : undefined,
      bodyFat: bodyFat ? Number(parseFloat(bodyFat).toFixed(1)) : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg text-white">
              {initialEntry ? 'Eintrag bearbeiten' : 'Gewicht erfassen'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-950/60 border border-rose-800 rounded text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Datum
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          {/* Weight Input with Stepper Quick Buttons */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Gewicht ({unit})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="20"
                max="350"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                onFocus={e => e.currentTarget.select()}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2.5 text-xl font-bold font-mono tabular-nums text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Quick Adjustment Buttons */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => handleAdjustWeight(-0.5)}
                className="py-1 px-2 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 border border-neutral-700/60"
              >
                -0.5
              </button>
              <button
                type="button"
                onClick={() => handleAdjustWeight(-0.1)}
                className="py-1 px-2 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 border border-neutral-700/60"
              >
                -0.1
              </button>
              <button
                type="button"
                onClick={() => handleAdjustWeight(+0.1)}
                className="py-1 px-2 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 border border-neutral-700/60"
              >
                +0.1
              </button>
              <button
                type="button"
                onClick={() => handleAdjustWeight(+0.5)}
                className="py-1 px-2 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 border border-neutral-700/60"
              >
                +0.5
              </button>
            </div>
          </div>

          {/* Optional Measurements: Waist & Body Fat */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Bauchumfang (cm) <span className="text-neutral-400 font-normal">opt.</span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="z.B. 88.5"
                value={waist}
                onChange={e => setWaist(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Körperfett (%) <span className="text-neutral-400 font-normal">opt.</span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="z.B. 19.2"
                value={bodyFat}
                onChange={e => setBodyFat(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              Notiz <span className="text-neutral-400 font-normal">(z.B. Ernährung, Sport, Befinden)</span>
            </label>
            <input
              type="text"
              placeholder="Kurze Anmerkung..."
              value={notes}
              maxLength={120}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 placeholder:text-neutral-400"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              {initialEntry ? 'Änderungen speichern' : 'Eintrag speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
