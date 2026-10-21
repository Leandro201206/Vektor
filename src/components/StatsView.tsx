import React, { useState, useMemo } from 'react';
import { WeightEntry, UserProfile, CalculatedStats } from '../types';
import { calculateMilestones, formatDate } from '../utils/calculations';
import { WeightChart } from './Chart';
import { GoalProjectionCard } from './GoalProjectionCard';
import { NutritionCard } from './NutritionCard';
import { CheckCircle2, Lock, Flame, Award, TrendingDown, HeartPulse, Activity, ArrowDown } from 'lucide-react';

interface StatsViewProps {
  entries: WeightEntry[];
  profile: UserProfile;
  stats: CalculatedStats;
}

export const StatsView: React.FC<StatsViewProps> = ({
  entries,
  profile,
  stats,
}) => {
  const [chartTimeRange, setChartTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [showMovingAverage, setShowMovingAverage] = useState(true);

  // Lowest and highest weight stats
  const extrema = useMemo(() => {
    if (!entries.length) return null;
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    let minEntry = sorted[0];
    let maxEntry = sorted[0];
    sorted.forEach(e => {
      if (e.weight < minEntry.weight) minEntry = e;
      if (e.weight > maxEntry.weight) maxEntry = e;
    });
    return {
      min: minEntry,
      max: maxEntry,
      range: Number((maxEntry.weight - minEntry.weight).toFixed(1)),
    };
  }, [entries]);

  const milestones = useMemo(() => {
    return calculateMilestones(entries, profile);
  }, [entries, profile]);

  // Day-of-week fluctuation analysis (Monday to Sunday)
  const dayOfWeekAverages = useMemo(() => {
    if (entries.length < 5) return [];

    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const sums = Array(7).fill(0);
    const counts = Array(7).fill(0);

    entries.forEach(e => {
      const dayIdx = new Date(e.date).getDay();
      sums[dayIdx] += e.weight;
      counts[dayIdx] += 1;
    });

    // Reorder starting Monday: 1, 2, 3, 4, 5, 6, 0
    const ordered = [1, 2, 3, 4, 5, 6, 0].map(idx => {
      const avg = counts[idx] > 0 ? Number((sums[idx] / counts[idx]).toFixed(1)) : 0;
      return {
        day: days[idx],
        avg,
        count: counts[idx],
      };
    });

    return ordered;
  }, [entries]);

  // Monthly summary
  const monthlyBreakdown = useMemo(() => {
    if (entries.length === 0) return [];

    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const groups: { [key: string]: WeightEntry[] } = {};

    sorted.forEach(e => {
      const monthKey = e.date.substring(0, 7); // YYYY-MM
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(e);
    });

    return Object.entries(groups).map(([monthKey, list]) => {
      const firstW = list[0].weight;
      const lastW = list[list.length - 1].weight;
      const delta = Number((lastW - firstW).toFixed(1));
      const [year, month] = monthKey.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
      const label = dateObj.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

      return {
        monthKey,
        label,
        entriesCount: list.length,
        delta,
        firstWeight: firstW,
        lastWeight: lastW,
      };
    });
  }, [entries]);

  // Pace health check evaluation
  const paceFeedback = useMemo(() => {
    const rate = Math.abs(stats.weeklyRateKg);
    if (rate === 0) return { title: 'Gewicht gehalten', text: 'Aktuell keine nennenswerte Abweichung.', color: 'text-neutral-400' };
    if (rate <= 0.4) {
      return {
        title: 'Moderates, schonendes Tempo',
        text: 'Ca. 0,2 - 0,4 kg / Woche ist extrem nachhaltig und schützt vor Jojo-Effekten.',
        color: 'text-emerald-400',
      };
    } else if (rate <= 0.9) {
      return {
        title: 'Optimaler Fettverbrennungs-Bereich',
        text: '0,5 - 0,9 kg / Woche ist der von Ernährungsmedizinern empfohlene Sweet-Spot für Fettverlust.',
        color: 'text-emerald-400',
      };
    } else {
      return {
        title: 'Zügiges Tempo',
        text: 'Über 1,0 kg / Woche. Achte auf ausreichend Proteine und Mineralstoffe zur Muskelerhaltung.',
        color: 'text-amber-400',
      };
    }
  }, [stats.weeklyRateKg]);

  const unlockedCount = milestones.filter(m => m.isUnlocked).length;

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-x-clip">
      {/* Top Banner: Deficit & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Caloric Deficit Equivalent */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Eingesparte Kalorien
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold tracking-tight font-mono text-white tabular-nums">
              {stats.estimatedDeficitKcal.toLocaleString('de-DE')}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              kcal Gesamteinsparung (~7.700 kcal / kg Fett)
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
            Entspricht etwa {Math.round(stats.estimatedDeficitKcal / 600)} Stunden Ausdauersport
          </div>
        </div>

        {/* Pace Evaluation */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Abnehm-Geschwindigkeit
            </span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className={`text-base font-semibold ${paceFeedback.color}`}>
              {paceFeedback.title}
            </div>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {paceFeedback.text}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>Aktuelle 7-Tage-Rate:</span>
            <span className="font-mono text-white tabular-nums">
              {stats.weeklyRateKg > 0 ? `+${stats.weeklyRateKg}` : stats.weeklyRateKg} kg/Woche
            </span>
          </div>
        </div>

        {/* Milestone Progress KPI */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Meilensteine
            </span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight font-mono text-white tabular-nums">
              {unlockedCount}
            </span>
            <span className="text-sm font-mono text-neutral-400">/ {milestones.length} erreicht</span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
            <span>Nächste Etappe:</span>
            <span className="text-emerald-400 font-medium truncate max-w-[150px]">
              {milestones.find(m => !m.isUnlocked)?.title || 'Alle abgeschlossen!'}
            </span>
          </div>
        </div>
      </div>

      {/* Goal Arrival Forecast & Target Rate Module */}
      <GoalProjectionCard entries={entries} profile={profile} />

      {/* Macronutrient & Calorie Requirement Calculator */}
      <NutritionCard currentWeight={stats.currentWeight} profile={profile} />

      {/* Interactive Weight Progression & Moving Average Line Chart */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Gewichtsentwicklung & Gleitender Durchschnitt
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Langzeit-Visualisierung mit 7-Tage-Glättungslinie zur Ausblendung kurzfristiger Schwankungen
            </p>
          </div>
          {extrema && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
              <span className="text-neutral-400">
                Tiefststand: <strong className="text-emerald-400 font-semibold">{extrema.min.weight.toFixed(1)} {profile.unit}</strong> ({formatDate(extrema.min.date)})
              </span>
              <span className="text-neutral-500 hidden md:inline">·</span>
              <span className="text-neutral-400 hidden md:inline">
                Spannweite: <strong className="text-neutral-200">{extrema.range} {profile.unit}</strong>
              </span>
            </div>
          )}
        </div>

        <WeightChart
          entries={entries}
          goalWeight={profile.goalWeight}
          startWeight={profile.startWeight}
          timeRange={chartTimeRange}
          onTimeRangeChange={setChartTimeRange}
          showMovingAverage={showMovingAverage}
          onToggleMovingAverage={() => setShowMovingAverage(prev => !prev)}
          unit={profile.unit}
        />
      </div>

      {/* Milestones Checklist Grid */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <div className="pb-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Fortschritts-Meilensteine</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Automatisch validiert anhand deiner dokumentierten Gewichtsverläufe
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {milestones.map(m => {
            const currentLost = profile.startWeight - stats.currentWeight;
            const remainingToMilestone = Number((m.targetKgLost - currentLost).toFixed(1));

            return (
              <div
                key={m.id}
                className={`p-4 rounded-lg border transition-all flex items-start gap-3.5 ${
                  m.isUnlocked
                    ? 'bg-neutral-950/60 border-neutral-700/80'
                    : 'bg-neutral-950/20 border-neutral-800/80 opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {m.isUnlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-neutral-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-white truncate">
                      {m.title}
                    </span>
                    {m.isUnlocked && m.unlockedAtDate && (
                      <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                        {m.unlockedAtDate}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {m.description}
                  </p>
                  {!m.isUnlocked && remainingToMilestone > 0 && (
                    <div className="text-[11px] font-mono text-neutral-400 mt-2">
                      Noch {remainingToMilestone} kg bis zum Freischalten
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lower Analytics: Monthly Breakdown & Day-of-week patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Breakdown */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-medium pb-3 border-b border-neutral-800">
            Monats-Bilanz
          </h3>
          <div className="divide-y divide-neutral-800/80 mt-2">
            {monthlyBreakdown.map(m => (
              <div key={m.monthKey} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-neutral-200">{m.label}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {m.entriesCount} Messungen ({m.firstWeight} → {m.lastWeight} kg)
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      m.delta <= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {m.delta > 0 ? `+${m.delta}` : m.delta} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Day of Week Fluctuations */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-medium pb-3 border-b border-neutral-800">
            Durchschnitt nach Wochentag
          </h3>
          <p className="text-xs text-neutral-400 mt-2 mb-4">
            Zeigt natürliche Wassereinlagerungen (z.B. nach dem Wochenende).
          </p>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2 min-w-0">
            {dayOfWeekAverages.map(d => (
              <div
                key={d.day}
                className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-1 sm:p-2 min-w-0 text-center"
              >
                <div className="text-xs font-medium text-neutral-400">{d.day}</div>
                <div className="mt-2 text-[10px] sm:text-xs font-mono font-semibold text-neutral-100 tabular-nums">
                  {d.avg ? d.avg.toFixed(1) : '—'}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {d.count}x
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
