import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { calculateNutritionRecommendations } from '../utils/calculations';
import { Flame, Droplet, Apple, ShieldCheck, Activity, Info } from 'lucide-react';

interface NutritionCardProps {
  currentWeight: number;
  profile: UserProfile;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({
  currentWeight,
  profile,
}) => {
  const [deficitKcal, setDeficitKcal] = useState<number>(500);
  const [activityMultiplier, setActivityMultiplier] = useState<number>(1.375); // lightly active
  const [age, setAge] = useState<number>(30);

  const plan = useMemo(() => {
    return calculateNutritionRecommendations(
      currentWeight,
      profile.height,
      deficitKcal,
      activityMultiplier,
      age
    );
  }, [currentWeight, profile.height, deficitKcal, activityMultiplier, age]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
      {/* Header with Activity and Deficit controls */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-white">
                Empfohlene Makronährstoffe & Kalorienbedarf
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Wissenschaftliche Berechnung (Mifflin-St Jeor) für optimalen Fettverlust bei maximalem Muskelerhalt
            </p>
          </div>

          {/* Quick Deficit Segmented selector */}
          <div className="flex items-center p-0.5 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => setDeficitKcal(300)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                deficitKcal === 300
                  ? 'bg-neutral-800 text-white font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Sanft (-300 kcal)
            </button>
            <button
              onClick={() => setDeficitKcal(500)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                deficitKcal === 500
                  ? 'bg-neutral-800 text-emerald-300 font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Moderat (-500 kcal)
            </button>
            <button
              onClick={() => setDeficitKcal(750)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                deficitKcal === 750
                  ? 'bg-neutral-800 text-amber-300 font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Intensiv (-750 kcal)
            </button>
          </div>
        </div>

        {/* Activity & Baseline parameters */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-950/50 p-3 rounded-lg border border-neutral-800/60">
          <div>
            <label className="text-neutral-400 block mb-1">Aktivitätslevel im Alltag:</label>
            <select
              value={activityMultiplier}
              onChange={e => setActivityMultiplier(parseFloat(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-neutral-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="1.2">Vorwiegend sitzend (Bürojob, wenig Bewegung)</option>
              <option value="1.375">Leicht aktiv (1–3 Tage Sport / viel Spazieren)</option>
              <option value="1.55">Moderat aktiv (3–5 Tage intensiver Sport)</option>
              <option value="1.725">Sehr aktiv (6–7 Tage Training / körperliche Arbeit)</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Geschätztes Alter:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="16"
                max="90"
                value={age}
                onChange={e => setAge(parseInt(e.target.value, 10) || 30)}
                className="w-24 bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 font-mono text-neutral-200 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-neutral-400">Jahre</span>
            </div>
          </div>
        </div>

        {/* Big Key Numbers: TDEE vs Target Calories */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-xl">
            <div className="text-[11px] uppercase tracking-wider text-neutral-400">
              Grundumsatz (BMR)
            </div>
            <div className="mt-1.5 text-2xl font-bold font-mono text-neutral-300 tabular-nums">
              {plan.bmr.toLocaleString('de-DE')} <span className="text-xs text-neutral-400 font-normal">kcal</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Kalorienverbrauch in völliger Ruhe
            </div>
          </div>

          <div className="p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-xl">
            <div className="text-[11px] uppercase tracking-wider text-neutral-400">
              Gesamtverbrauch (TDEE)
            </div>
            <div className="mt-1.5 text-2xl font-bold font-mono text-neutral-300 tabular-nums">
              {plan.tdee.toLocaleString('de-DE')} <span className="text-xs text-neutral-400 font-normal">kcal</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Inklusive Alltag & Aktivitäten
            </div>
          </div>

          <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl">
            <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-medium">
              Empfohlene Zufuhr
            </div>
            <div className="mt-1.5 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {plan.targetCalories.toLocaleString('de-DE')} <span className="text-xs text-emerald-500/80 font-normal">kcal</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Tägliches Defizit von {plan.dailyDeficitKcal} kcal
            </div>
          </div>
        </div>

        {/* Stacked Macro Distribution Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-neutral-300 font-medium">Makronährstoff-Verteilung</span>
            <span className="text-neutral-400 font-mono text-[11px]">
              Protein {plan.proteinPercent}% · Fett {plan.fatPercent}% · Kohlenhydrate {plan.carbsPercent}%
            </span>
          </div>

          <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${plan.proteinPercent}%` }}
              className="h-full bg-emerald-500 transition-all duration-300"
              title={`Protein: ${plan.proteinGrams}g (${plan.proteinPercent}%)`}
            />
            <div
              style={{ width: `${plan.fatPercent}%` }}
              className="h-full bg-amber-500 transition-all duration-300"
              title={`Fett: ${plan.fatGrams}g (${plan.fatPercent}%)`}
            />
            <div
              style={{ width: `${plan.carbsPercent}%` }}
              className="h-full bg-sky-500 transition-all duration-300"
              title={`Kohlenhydrate: ${plan.carbsGrams}g (${plan.carbsPercent}%)`}
            />
          </div>
        </div>

        {/* Three Macro Breakdown Cards */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Protein */}
          <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Protein (Eiweiß)
              </span>
              <span className="font-mono text-neutral-400 text-[11px]">{plan.proteinPercent} %</span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
              {plan.proteinGrams} g
            </div>
            <div className="text-[11px] text-neutral-400 mt-1 font-mono">
              ~{plan.proteinCalories} kcal (2.0 g / kg)
            </div>
            <p className="text-[11px] text-neutral-400 mt-2 leading-tight">
              Essentiell für Muskelerhalt im Kaloriendefizit und langanhaltende Sättigung.
            </p>
          </div>

          {/* Fat */}
          <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Fett
              </span>
              <span className="font-mono text-neutral-400 text-[11px]">{plan.fatPercent} %</span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
              {plan.fatGrams} g
            </div>
            <div className="text-[11px] text-neutral-400 mt-1 font-mono">
              ~{plan.fatCalories} kcal (0.85 g / kg)
            </div>
            <p className="text-[11px] text-neutral-400 mt-2 leading-tight">
              Lebenswichtig für Testosteron/Östrogen, Zellmembranen und fettlösliche Vitamine (A, D, E, K).
            </p>
          </div>

          {/* Carbohydrates */}
          <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Kohlenhydrate
              </span>
              <span className="font-mono text-neutral-400 text-[11px]">{plan.carbsPercent} %</span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
              {plan.carbsGrams} g
            </div>
            <div className="text-[11px] text-neutral-400 mt-1 font-mono">
              ~{plan.carbsCalories} kcal (Restmenge)
            </div>
            <p className="text-[11px] text-neutral-400 mt-2 leading-tight">
              Liefert sofortige Muskel- und Gehirnenergie, unterstützt intensive Trainingseinheiten.
            </p>
          </div>
        </div>
      </div>

      {/* Micronutrient & Hydration Footer Strip */}
      <div className="mt-5 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <Droplet className="w-3.5 h-3.5 text-sky-400" />
          <span>Empfohlenes Trinkvolumen:</span>
          <strong className="text-neutral-200 font-mono">{plan.waterLiters} Liter</strong>
          <span className="text-[11px] text-neutral-400">(35 ml / kg)</span>
        </div>

        <div className="flex items-center gap-2">
          <Apple className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mindest-Ballaststoffe:</span>
          <strong className="text-neutral-200 font-mono">~{plan.fiberGrams} g / Tag</strong>
          <span className="text-[11px] text-neutral-400">(Darmgesundheit & Mikrobiom)</span>
        </div>
      </div>
    </div>
  );
};
