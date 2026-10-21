import React, { useState, useMemo } from 'react';
import { WeightEntry, UserProfile } from '../types';
import { calculateGoalProjection } from '../utils/calculations';
import { Target, Calendar, Sparkles, Clock, TrendingDown, ArrowRight } from 'lucide-react';

interface GoalProjectionCardProps {
  entries: WeightEntry[];
  profile: UserProfile;
}

export const GoalProjectionCard: React.FC<GoalProjectionCardProps> = ({
  entries,
  profile,
}) => {
  const [selectedPaceMode, setSelectedPaceMode] = useState<'current' | 'overall' | 'recommended' | 'custom'>('current');
  const [customPace, setCustomPace] = useState<number>(0.5);

  const baseProjection = useMemo(() => {
    return calculateGoalProjection(entries, profile);
  }, [entries, profile]);

  const activePaceValue = useMemo(() => {
    if (selectedPaceMode === 'current') return baseProjection.currentWeeklyRateKg;
    if (selectedPaceMode === 'overall') return baseProjection.overallWeeklyRateKg;
    if (selectedPaceMode === 'recommended') return -0.5;
    return -customPace;
  }, [selectedPaceMode, baseProjection, customPace]);

  const projection = useMemo(() => {
    return calculateGoalProjection(entries, profile, activePaceValue);
  }, [entries, profile, activePaceValue]);

  if (baseProjection.isGoalReached) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-emerald-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold text-white">Zielgewicht erreicht!</h3>
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          Du hast dein Wunschgewicht von {profile.goalWeight} {profile.unit} erreicht. Herzlichen Glückwunsch!
        </p>
      </div>
    );
  }

  const currentLossRate = Math.abs(baseProjection.currentWeeklyRateKg);
  const overallLossRate = Math.abs(baseProjection.overallWeeklyRateKg);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 sm:p-5 flex flex-col justify-between min-w-0">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">
                Ziel-Prognose & Voraussichtliches Datum
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Mathematische Extrapolation basierend auf deiner dokumentierten Abnehmgeschwindigkeit
            </p>
          </div>

          {/* Segmented Pace Switcher */}
          <div className="grid grid-cols-2 sm:flex w-full sm:w-auto min-w-0 gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => setSelectedPaceMode('current')}
              className={`min-w-0 px-2 py-2 sm:py-1 rounded-md transition-colors text-center leading-snug ${
                selectedPaceMode === 'current'
                  ? 'bg-neutral-800 text-white font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Aktueller Trend ({currentLossRate.toFixed(1)} kg/Wo)
            </button>
            <button
              onClick={() => setSelectedPaceMode('overall')}
              className={`min-w-0 px-2 py-2 sm:py-1 rounded-md transition-colors text-center leading-snug ${
                selectedPaceMode === 'overall'
                  ? 'bg-neutral-800 text-white font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Gesamtschnitt ({overallLossRate.toFixed(1)} kg/Wo)
            </button>
            <button
              onClick={() => setSelectedPaceMode('recommended')}
              className={`min-w-0 px-2 py-2 sm:py-1 rounded-md transition-colors text-center leading-snug ${
                selectedPaceMode === 'recommended'
                  ? 'bg-neutral-800 text-white font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Empfohlen (0.5 kg/Wo)
            </button>
            <button
              onClick={() => setSelectedPaceMode('custom')}
              className={`min-w-0 px-2 py-2 sm:py-1 rounded-md transition-colors text-center leading-snug ${
                selectedPaceMode === 'custom'
                  ? 'bg-neutral-800 text-white font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Individuell
            </button>
          </div>
        </div>

        {/* Custom Pace Slider (if active) */}
        {selectedPaceMode === 'custom' && (
          <div className="mt-4 p-3 bg-neutral-950/60 border border-neutral-800 rounded-lg">
            <div className="flex flex-wrap justify-between items-center gap-2 text-xs mb-1.5">
              <span className="text-neutral-300">Gewählte Zielrate:</span>
              <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                -{customPace.toFixed(2)} kg pro Woche (~{Math.round((customPace * 7700) / 7)} kcal Defizit/Tag)
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={customPace}
              onChange={e => setCustomPace(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-neutral-400 mt-2">
              <span>0.1 kg (sehr sanft)</span>
              <span>0.5 kg (Standard)</span>
              <span>1.0 kg (ambitioniert)</span>
              <span>1.5 kg (intensiv)</span>
            </div>
          </div>
        )}

        {/* Main Forecast Hero Display */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Projected Date Card */}
          <div className="md:col-span-2 bg-neutral-950/70 border border-neutral-800/90 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                Voraussichtliches Zieldatum
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                {projection.projectedDateCurrentPace ? (
                  projection.projectedDateCurrentPace
                ) : (
                  <span className="text-amber-400 text-lg font-sans">
                    Aktuell kein Abwärtstrend messbar
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-400 mt-2">
                Zielgewicht: <span className="font-mono text-neutral-200 font-medium">{profile.goalWeight} {profile.unit}</span> (noch <span className="font-mono text-white font-semibold">{projection.remainingKg} {profile.unit}</span> verbleibend)
              </div>
            </div>

            {projection.daysNeededCurrentPace && (
              <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Noch ca. <strong className="text-white font-mono font-semibold">{projection.weeksNeededCurrentPace} Wochen</strong> ({projection.daysNeededCurrentPace} Tage)
                </span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  Rate: {Math.abs(projection.currentWeeklyRateKg).toFixed(2)} kg/Woche
                </span>
              </div>
            )}
          </div>

          {/* Daily Deficit & Energy Burn */}
          <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                Erforderliches Defizit
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono tabular-nums">
                ~{projection.targetDailyDeficitKcal.toLocaleString('de-DE')}
                <span className="text-sm font-normal text-neutral-400 ml-1.5">kcal / Tag</span>
              </div>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Rechnerischer Kalorieneinsparungs-Bedarf unter Berücksichtigung von ca. 7.700 kcal pro kg Fettgewebe.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] text-emerald-400 font-mono">
              ~{(projection.targetDailyDeficitKcal * 7).toLocaleString('de-DE')} kcal wöchentlich
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Velocity Comparison */}
      <div className="mt-6 pt-4 border-t border-neutral-800">
        <div className="text-xs font-medium text-neutral-400 mb-2">
          Szenarien im Vergleich:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 bg-neutral-950/50 border border-neutral-800/60 rounded-lg">
            <div className="text-neutral-400">Aktueller 7-Tage-Trend ({currentLossRate.toFixed(1)} kg/Wo)</div>
            <div className="font-mono text-neutral-100 font-semibold mt-1">
              {baseProjection.projectedDateCurrentPace || '—'}
            </div>
          </div>
          <div className="p-3 bg-neutral-950/50 border border-neutral-800/60 rounded-lg">
            <div className="text-neutral-400">Gesamter Durchschnitt ({overallLossRate.toFixed(1)} kg/Wo)</div>
            <div className="font-mono text-neutral-100 font-semibold mt-1">
              {baseProjection.projectedDateOverallPace || '—'}
            </div>
          </div>
          <div className="p-3 bg-neutral-950/50 border border-neutral-800/60 rounded-lg">
            <div className="text-neutral-400">Empfohlenes Standardtempo (0.5 kg/Wo)</div>
            <div className="font-mono text-emerald-400 font-semibold mt-1">
              {baseProjection.projectedDateHealthyPace || '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
