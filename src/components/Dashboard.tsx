import React, { useState } from 'react';
import { WeightEntry, UserProfile, CalculatedStats } from '../types';
import { WeightChart } from './Chart';
import { WeeklyDeltaChart } from './WeeklyDeltaChart';
import { BodyMetricsCard } from './BodyMetricsCard';
import { formatDateShort, formatDate } from '../utils/calculations';
import { Plus, Target, Scale, Flame, ArrowDownRight, ArrowUpRight, Clock, Edit2 } from 'lucide-react';

interface DashboardProps {
  entries: WeightEntry[];
  profile: UserProfile;
  stats: CalculatedStats;
  onOpenLogModal: (entry?: WeightEntry) => void;
  onSelectView: (view: 'dashboard' | 'entries' | 'stats') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  entries,
  profile,
  stats,
  onOpenLogModal,
  onSelectView,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [showMovingAverage, setShowMovingAverage] = useState<boolean>(true);

  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const recentEntries = sortedEntries.slice(0, 5);

  const hasPace = stats.weeklyRateKg !== 0;
  const isLosing = stats.totalChangeKg <= 0;

  return (
    <div className="space-y-6">
      {/* 4-Column Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Current Weight */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Aktuelles Gewicht
            </span>
            <Scale className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-white font-mono tabular-nums">
              {stats.currentWeight.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-neutral-400">kg</span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>7-Tage-Delta:</span>
            <span
              className={`font-mono font-medium flex items-center tabular-nums ${
                stats.sevenDayChangeKg <= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {stats.sevenDayChangeKg <= 0 ? (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 inline" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 inline" />
              )}
              {stats.sevenDayChangeKg > 0 ? `+${stats.sevenDayChangeKg}` : stats.sevenDayChangeKg} kg
            </span>
          </div>
        </div>

        {/* KPI 2: Total Progress */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Gesamter Fortschritt
            </span>
            <Target className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span
              className={`text-3xl font-semibold tracking-tight font-mono tabular-nums ${
                isLosing ? 'text-emerald-400' : 'text-neutral-100'
              }`}
            >
              {stats.totalChangeKg > 0 ? `+${stats.totalChangeKg}` : stats.totalChangeKg}
            </span>
            <span className="text-sm font-mono text-neutral-400">kg</span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Zielerreichung:</span>
            <span className="font-mono text-neutral-200 tabular-nums font-medium">
              {stats.percentageToGoal} %
            </span>
          </div>
        </div>

        {/* KPI 3: Remaining to Goal */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Bis zum Zielgewicht
            </span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-white font-mono tabular-nums">
              {stats.remainingKg.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-neutral-400">kg</span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Zielwert:</span>
            <span className="font-mono text-neutral-200 tabular-nums">
              {profile.goalWeight} kg
            </span>
          </div>
        </div>

        {/* KPI 4: 7-Day Trend Rate */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Trend-Geschwindigkeit
            </span>
            <Flame className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span
              className={`text-3xl font-semibold tracking-tight font-mono tabular-nums ${
                stats.weeklyRateKg <= -0.2 ? 'text-emerald-400' : 'text-neutral-100'
              }`}
            >
              {stats.weeklyRateKg > 0 ? `+${stats.weeklyRateKg}` : stats.weeklyRateKg}
            </span>
            <span className="text-sm font-mono text-neutral-400">kg / Wo</span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>7-Tage-Schnitt:</span>
            <span className="font-mono text-neutral-200 tabular-nums">
              {stats.movingAverage7d.toFixed(1)} kg
            </span>
          </div>
        </div>
      </div>

      {/* Goal Progress Bar & Forecast */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
            Weg zum Ziel
          </div>
          {stats.projectedGoalDate && (
            <div className="text-xs text-emerald-400 font-medium">
              Voraussichtliche Zielankunft: {stats.projectedGoalDate}
            </div>
          )}
        </div>

        {/* The visual progress bar */}
        <div className="relative pt-2 pb-1">
          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${stats.percentageToGoal}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-neutral-400 font-mono mt-2">
            <span>Start: {profile.startWeight} kg</span>
            <span className="text-neutral-200 font-semibold">{stats.percentageToGoal}% geschafft</span>
            <span>Ziel: {profile.goalWeight} kg</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart */}
      <WeightChart
        entries={entries}
        goalWeight={profile.goalWeight}
        startWeight={profile.startWeight}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        showMovingAverage={showMovingAverage}
        onToggleMovingAverage={() => setShowMovingAverage(prev => !prev)}
        unit={profile.unit}
      />

      {/* Secondary Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyDeltaChart entries={entries} unit={profile.unit} />
        <BodyMetricsCard stats={stats} profile={profile} entries={entries} />
      </div>

      {/* Recent Entries Quick List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Letzte Messungen
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              Insgesamt {entries.length} Einträge dokumentiert
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectView('entries')}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Alle anzeigen
            </button>
            <button
              onClick={() => onOpenLogModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-md text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Eintrag loggen
            </button>
          </div>
        </div>

        <div className="divide-y divide-neutral-800/80">
          {recentEntries.map((entry, idx) => {
            const nextEntry = sortedEntries[idx + 1];
            const diff = nextEntry ? Number((entry.weight - nextEntry.weight).toFixed(1)) : null;

            return (
              <div
                key={entry.id}
                className="py-3 flex items-center justify-between hover:bg-neutral-800/40 px-2 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="font-mono text-xs text-neutral-400 w-24">
                    {formatDate(entry.date)}
                  </div>
                  <div className="text-sm font-semibold font-mono text-white tabular-nums">
                    {entry.weight.toFixed(1)} {profile.unit}
                  </div>
                  {diff !== null && (
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        diff <= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                  {entry.notes && (
                    <span className="text-xs text-neutral-400 hidden sm:inline max-w-xs truncate">
                      {entry.notes}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {entry.waist && (
                    <span className="text-xs font-mono text-neutral-400 hidden md:inline">
                      {entry.waist} cm
                    </span>
                  )}
                  <button
                    onClick={() => onOpenLogModal(entry)}
                    className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors opacity-0 group-hover:opacity-100"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
