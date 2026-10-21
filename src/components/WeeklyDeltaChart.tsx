import React, { useMemo } from 'react';
import { WeightEntry } from '../types';

interface WeeklyDeltaChartProps {
  entries: WeightEntry[];
  unit?: string;
}

export const WeeklyDeltaChart: React.FC<WeeklyDeltaChartProps> = ({
  entries,
  unit = 'kg',
}) => {
  // Aggregate entries by week (ISO calendar week or 7-day groups)
  const weeklyChanges = useMemo(() => {
    if (entries.length < 2) return [];

    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

    // Group into 7-day chunks starting from the first entry
    const weeks: { weekLabel: string; delta: number; avgWeight: number; startDate: string }[] = [];
    const chunkSize = 7;

    for (let i = 0; i < sorted.length; i += chunkSize) {
      const chunk = sorted.slice(i, i + chunkSize);
      const startW = chunk[0].weight;
      const endW = chunk[chunk.length - 1].weight;
      const delta = Number((endW - startW).toFixed(1));
      const avg = Number((chunk.reduce((s, c) => s + c.weight, 0) / chunk.length).toFixed(1));
      
      const weekIndex = Math.floor(i / chunkSize) + 1;
      weeks.push({
        weekLabel: `W${weekIndex}`,
        startDate: chunk[0].date,
        delta,
        avgWeight: avg,
      });
    }

    // Keep the last 8 weeks for clean scannability
    return weeks.slice(-8);
  }, [entries]);

  if (!weeklyChanges.length) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 text-center text-xs text-neutral-400">
        Noch nicht genügend Wochendaten für die Wöchentliche Dynamik vorhanden.
      </div>
    );
  }

  // Find max absolute delta for vertical scaling
  const maxAbs = Math.max(1, ...weeklyChanges.map(w => Math.abs(w.delta)));

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
          Wöchentliche Dynamik
        </div>
        <div className="text-xs text-neutral-400 mt-0.5">
          Veränderung im 7-Tage-Rhythmus
        </div>
      </div>

      <div className="mt-5 grid grid-cols-8 gap-1 sm:gap-2 items-end h-32 pt-4 pb-2 border-b border-neutral-800">
        {weeklyChanges.map((w, idx) => {
          const isLoss = w.delta <= 0;
          const barHeightPct = Math.min(100, Math.max(15, (Math.abs(w.delta) / maxAbs) * 100));

          return (
            <div key={idx} className="flex flex-col items-center justify-end h-full group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-neutral-950 border border-neutral-700 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap z-20 font-mono shadow-md">
                {w.delta > 0 ? `+${w.delta}` : w.delta} {unit}
              </div>

              {/* Bar */}
              <div
                className={`w-full max-w-[28px] rounded-t transition-all ${
                  isLoss
                    ? 'bg-emerald-500/80 group-hover:bg-emerald-400'
                    : 'bg-rose-500/70 group-hover:bg-rose-400'
                }`}
                style={{ height: `${barHeightPct}%` }}
              />

              {/* Delta Label */}
              <span
                className={`text-[10px] font-mono mt-1.5 tabular-nums ${
                  isLoss ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {w.delta > 0 ? `+${w.delta}` : w.delta}
              </span>
            </div>
          );
        })}
      </div>

      {/* Week X-axis Labels */}
      <div className="grid grid-cols-8 gap-1 sm:gap-2 mt-2">
        {weeklyChanges.map((w, idx) => (
          <div key={idx} className="text-center font-mono text-[10px] text-neutral-400">
            {w.weekLabel}
          </div>
        ))}
      </div>
    </div>
  );
};
