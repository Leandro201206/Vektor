import React from 'react';
import { CalculatedStats, UserProfile, WeightEntry } from '../types';

interface BodyMetricsCardProps {
  stats: CalculatedStats;
  profile: UserProfile;
  entries: WeightEntry[];
}

export const BodyMetricsCard: React.FC<BodyMetricsCardProps> = ({
  stats,
  profile,
  entries,
}) => {
  // Find latest waist measurement
  const waistEntries = entries
    .filter(e => typeof e.waist === 'number' && e.waist > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const firstWaist = waistEntries[0]?.waist;
  const latestWaist = waistEntries[waistEntries.length - 1]?.waist;
  const waistDelta = firstWaist && latestWaist ? Number((latestWaist - firstWaist).toFixed(1)) : null;

  // Find latest body fat
  const fatEntries = entries
    .filter(e => typeof e.bodyFat === 'number' && e.bodyFat > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const latestFat = fatEntries[fatEntries.length - 1]?.bodyFat;

  // BMI bar relative position (scaled between 16 and 36)
  const minScale = 16;
  const maxScale = 36;
  const bmiPct = Math.max(0, Math.min(100, ((stats.bmi - minScale) / (maxScale - minScale)) * 100));

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
            Körperbau & BMI
          </span>
          <span className="text-xs font-mono text-neutral-400">
            {profile.height} cm
          </span>
        </div>

        {/* Current BMI Number and Category */}
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-semibold tracking-tight text-white font-mono tabular-nums">
              {stats.bmi}
            </div>
            <div className="text-xs mt-1 text-neutral-300 font-medium">
              {stats.bmiCategory}
            </div>
          </div>
          <div className="text-right text-xs text-neutral-400">
            <div>Normalbereich:</div>
            <div className="font-mono text-neutral-300 mt-0.5">
              {stats.bmiHealthyRange.min} – {stats.bmiHealthyRange.max} kg
            </div>
          </div>
        </div>

        {/* Minimalist BMI Gauge Bar */}
        <div className="mt-4">
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden flex">
            {/* Underweight zone (< 18.5 => (18.5-16)/(36-16) = 2.5/20 = 12.5%) */}
            <div className="h-full bg-amber-500/40 w-[12.5%]" title="Untergewicht (< 18.5)" />
            {/* Normal weight zone (18.5 - 24.9 => 6.4/20 = 32%) */}
            <div className="h-full bg-emerald-500/70 w-[32%]" title="Normalgewicht (18.5 - 24.9)" />
            {/* Overweight zone (25 - 29.9 => 5/20 = 25%) */}
            <div className="h-full bg-amber-500/50 w-[25%]" title="Übergewicht (25 - 29.9)" />
            {/* Obese zone (30+ => 30.5%) */}
            <div className="h-full bg-rose-500/60 w-[30.5%]" title="Adipositas (30+)" />
          </div>

          {/* Marker pin */}
          <div className="relative w-full h-3">
            <div
              className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white transition-all duration-300"
              style={{ left: `${bmiPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-neutral-400">
            <span>18.5</span>
            <span>25.0</span>
            <span>30.0</span>
          </div>
        </div>
      </div>

      {/* Additional recorded measurements: Waist & Body Fat */}
      <div className="mt-5 pt-4 border-t border-neutral-800 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] text-neutral-400">Bauchumfang</div>
          {latestWaist ? (
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-semibold font-mono text-neutral-100 tabular-nums">
                {latestWaist} cm
              </span>
              {waistDelta !== null && (
                <span
                  className={`text-xs font-mono tabular-nums ${
                    waistDelta <= 0 ? 'text-emerald-400' : 'text-neutral-400'
                  }`}
                >
                  {waistDelta > 0 ? `+${waistDelta}` : waistDelta} cm
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-neutral-400 mt-1 italic">Nicht erfasst</div>
          )}
        </div>

        <div>
          <div className="text-[11px] text-neutral-400">Körperfettanteil</div>
          {latestFat ? (
            <div className="text-base font-semibold font-mono text-neutral-100 tabular-nums mt-0.5">
              {latestFat} %
            </div>
          ) : (
            <div className="text-xs text-neutral-400 mt-1 italic">Optional</div>
          )}
        </div>
      </div>
    </div>
  );
};
