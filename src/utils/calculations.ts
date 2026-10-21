import { WeightEntry, UserProfile, CalculatedStats, Milestone, GoalProjection, NutritionPlan } from '../types';

/**
 * Calculates BMI and category based on WHO guidelines
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: string;
  categoryClass: string;
  healthyWeightMin: number;
  healthyWeightMax: number;
} {
  if (!heightCm || heightCm <= 0 || !weightKg || weightKg <= 0) {
    return {
      bmi: 0,
      category: 'Unbekannt',
      categoryClass: 'text-neutral-400',
      healthyWeightMin: 0,
      healthyWeightMax: 0,
    };
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  const healthyWeightMin = Number((18.5 * heightM * heightM).toFixed(1));
  const healthyWeightMax = Number((24.9 * heightM * heightM).toFixed(1));

  let category = 'Normalgewicht';
  let categoryClass = 'text-emerald-500';

  if (bmi < 18.5) {
    category = 'Untergewicht';
    categoryClass = 'text-amber-500';
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    category = 'Normalgewicht';
    categoryClass = 'text-emerald-500';
  } else if (bmi >= 25 && bmi <= 29.9) {
    category = 'Leichtes Übergewicht';
    categoryClass = 'text-amber-500';
  } else if (bmi >= 30 && bmi <= 34.9) {
    category = 'Adipositas Grad I';
    categoryClass = 'text-rose-500';
  } else {
    category = 'Adipositas Grad II+';
    categoryClass = 'text-rose-600';
  }

  return { bmi, category, categoryClass, healthyWeightMin, healthyWeightMax };
}

/**
 * Calculates 7-day moving average for each point in an array of entries (sorted by date asc)
 */
export function calculateMovingAverages(
  entries: WeightEntry[],
  windowDays = 7
): { id: string; date: string; weight: number; movingAverage: number }[] {
  if (!entries.length) return [];

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  return sorted.map((entry, index) => {
    // Collect entries within the last `windowDays` days
    const entryDate = new Date(entry.date).getTime();
    const windowStart = entryDate - (windowDays - 1) * 24 * 60 * 60 * 1000;

    const windowEntries = sorted.filter(e => {
      const d = new Date(e.date).getTime();
      return d >= windowStart && d <= entryDate;
    });

    const sum = windowEntries.reduce((acc, curr) => acc + curr.weight, 0);
    const avg = Number((sum / windowEntries.length).toFixed(2));

    return {
      id: entry.id,
      date: entry.date,
      weight: entry.weight,
      movingAverage: avg,
    };
  });
}

/**
 * Aggregates statistics for summary cards and dashboard metrics
 */
export function calculateOverallStats(
  entries: WeightEntry[],
  profile: UserProfile
): CalculatedStats {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const startWeight = profile.startWeight || (sorted[0]?.weight ?? 0);
  const currentEntry = sorted[sorted.length - 1];
  const currentWeight = currentEntry ? currentEntry.weight : startWeight;
  const goalWeight = profile.goalWeight || startWeight;

  const totalChangeKg = Number((currentWeight - startWeight).toFixed(1));
  const totalGoalDelta = startWeight - goalWeight;
  const actualLost = startWeight - currentWeight;

  // Percentage toward goal (if losing weight: totalGoalDelta > 0)
  let percentageToGoal = 0;
  if (totalGoalDelta > 0) {
    percentageToGoal = Math.max(0, Math.min(100, Math.round((actualLost / totalGoalDelta) * 100)));
  } else if (totalGoalDelta < 0) {
    // If gaining weight / muscle
    percentageToGoal = Math.max(0, Math.min(100, Math.round(((currentWeight - startWeight) / (goalWeight - startWeight)) * 100)));
  }

  const remainingKg = Number(Math.max(0, currentWeight - goalWeight).toFixed(1));

  // 7-day change: find entry ~7 days ago
  let sevenDayChangeKg = 0;
  let weeklyRateKg = 0;
  if (sorted.length >= 2) {
    const latestDate = new Date(currentEntry.date).getTime();
    const sevenDaysAgoTime = latestDate - 7 * 24 * 60 * 60 * 1000;

    // Find the closest entry at or before 7 days ago
    const olderEntries = sorted.filter(e => new Date(e.date).getTime() <= sevenDaysAgoTime);
    if (olderEntries.length > 0) {
      const referenceEntry = olderEntries[olderEntries.length - 1];
      const daysDiff = Math.max(1, (latestDate - new Date(referenceEntry.date).getTime()) / (24 * 60 * 60 * 1000));
      const delta = currentWeight - referenceEntry.weight;
      sevenDayChangeKg = Number(delta.toFixed(1));
      weeklyRateKg = Number(((delta / daysDiff) * 7).toFixed(2));
    } else {
      // Compare to first entry
      const daysDiff = Math.max(1, (latestDate - new Date(sorted[0].date).getTime()) / (24 * 60 * 60 * 1000));
      const delta = currentWeight - sorted[0].weight;
      sevenDayChangeKg = Number(delta.toFixed(1));
      weeklyRateKg = Number(((delta / daysDiff) * 7).toFixed(2));
    }
  }

  // Moving average (last 7 entries)
  const recentSlice = sorted.slice(-7);
  const movingAverage7d = recentSlice.length > 0
    ? Number((recentSlice.reduce((s, e) => s + e.weight, 0) / recentSlice.length).toFixed(1))
    : currentWeight;

  // Goal projection
  let projectedGoalDate: string | null = null;
  if (remainingKg > 0 && weeklyRateKg < -0.05) {
    const weeksNeeded = remainingKg / Math.abs(weeklyRateKg);
    const daysNeeded = Math.round(weeksNeeded * 7);
    const targetTime = Date.now() + daysNeeded * 24 * 60 * 60 * 1000;
    const projected = new Date(targetTime);
    projectedGoalDate = projected.toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // Total calorie deficit equivalent (~7,700 kcal per kg of fat tissue)
  const netLostKg = Math.max(0, startWeight - currentWeight);
  const estimatedDeficitKcal = Math.round(netLostKg * 7700);

  // BMI calculations
  const bmiInfo = calculateBMI(currentWeight, profile.height);

  // Best weekly loss
  let bestWeeklyLossKg = 0;
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i - 1].weight - sorted[i].weight;
    if (diff > bestWeeklyLossKg) {
      bestWeeklyLossKg = Number(diff.toFixed(1));
    }
  }

  return {
    currentWeight,
    startWeight,
    goalWeight,
    totalChangeKg,
    percentageToGoal,
    remainingKg,
    sevenDayChangeKg,
    weeklyRateKg,
    movingAverage7d,
    projectedGoalDate,
    estimatedDeficitKcal,
    bmi: bmiInfo.bmi,
    bmiCategory: bmiInfo.category,
    bmiHealthyRange: { min: bmiInfo.healthyWeightMin, max: bmiInfo.healthyWeightMax },
    bestWeeklyLossKg,
    daysLogged: sorted.length,
  };
}

/**
 * Calculates milestone achievements based on logged entries
 */
export function calculateMilestones(entries: WeightEntry[], profile: UserProfile): Milestone[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const startWeight = profile.startWeight || (sorted[0]?.weight ?? 0);
  const goalWeight = profile.goalWeight || startWeight;
  const totalGoalKg = Math.max(0.1, startWeight - goalWeight);

  const milestonesList: {
    id: string;
    title: string;
    description: string;
    targetKgLost: number;
    type: 'weight' | 'percentage' | 'bmi' | 'streak';
  }[] = [
    {
      id: 'first-kg',
      title: 'Der erste Schritt',
      description: '1 kg erfolgreich abgenommen',
      targetKgLost: 1,
      type: 'weight',
    },
    {
      id: 'two-point-five-kg',
      title: '2,5 kg Meilenstein',
      description: '2,5 kg reines Gewicht reduziert',
      targetKgLost: 2.5,
      type: 'weight',
    },
    {
      id: 'five-percent',
      title: '5 % Körpergewicht',
      description: 'Spürbare Entlastung für Herz und Gelenke',
      targetKgLost: Number((startWeight * 0.05).toFixed(1)),
      type: 'percentage',
    },
    {
      id: 'five-kg',
      title: 'Die 5-kg Marke',
      description: '5 kg erfolgreich abgenommen',
      targetKgLost: 5,
      type: 'weight',
    },
    {
      id: 'halfway',
      title: 'Bergfest: 50 % geschafft',
      description: 'Die Hälfte deines Zielweges erreicht',
      targetKgLost: Number((totalGoalKg * 0.5).toFixed(1)),
      type: 'percentage',
    },
    {
      id: 'ten-percent',
      title: '10 % Körpergewicht',
      description: 'Signifikanter gesundheitlicher Durchbruch',
      targetKgLost: Number((startWeight * 0.1).toFixed(1)),
      type: 'percentage',
    },
    {
      id: 'ten-kg',
      title: '10-kg Meilenstein',
      description: 'Zweistelliger Gewichtsverlust',
      targetKgLost: 10,
      type: 'weight',
    },
    {
      id: 'goal-reached',
      title: 'Ziel erreicht!',
      description: `Wunschgewicht von ${goalWeight} kg erreicht`,
      targetKgLost: totalGoalKg,
      type: 'weight',
    },
  ];

  return milestonesList.map(m => {
    // Check if any entry satisfies startWeight - entry.weight >= m.targetKgLost
    const reachedEntry = sorted.find(e => (startWeight - e.weight) >= m.targetKgLost);
    return {
      ...m,
      isUnlocked: Boolean(reachedEntry),
      unlockedAtDate: reachedEntry ? formatDate(reachedEntry.date) : undefined,
    };
  });
}

/**
 * Format date in German standard representation
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const [, month, day] = dateStr.split('-');
  return `${day}.${month}.`;
}

/**
 * Calculates detailed goal date projection and scenario estimates
 */
export function calculateGoalProjection(
  entries: WeightEntry[],
  profile: UserProfile,
  customWeeklyRate?: number
): GoalProjection {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const currentWeight = sorted[sorted.length - 1]?.weight ?? profile.startWeight;
  const startWeight = profile.startWeight || (sorted[0]?.weight ?? currentWeight);
  const goalWeight = profile.goalWeight || startWeight;

  const remainingKg = Number(Math.max(0, currentWeight - goalWeight).toFixed(1));
  const isGoalReached = currentWeight <= goalWeight;

  // Recent 7-day rate
  let currentWeeklyRateKg = 0;
  if (sorted.length >= 2) {
    const latestDate = new Date(sorted[sorted.length - 1].date).getTime();
    const sevenDaysAgoTime = latestDate - 7 * 24 * 60 * 60 * 1000;
    const olderEntries = sorted.filter(e => new Date(e.date).getTime() <= sevenDaysAgoTime);
    const ref = olderEntries.length > 0 ? olderEntries[olderEntries.length - 1] : sorted[0];
    const daysDiff = Math.max(1, (latestDate - new Date(ref.date).getTime()) / (24 * 60 * 60 * 1000));
    currentWeeklyRateKg = Number((((currentWeight - ref.weight) / daysDiff) * 7).toFixed(2));
  }

  // Overall weekly rate from first entry to latest entry
  let overallWeeklyRateKg = 0;
  if (sorted.length >= 2) {
    const firstDate = new Date(sorted[0].date).getTime();
    const lastDate = new Date(sorted[sorted.length - 1].date).getTime();
    const totalDays = Math.max(1, (lastDate - firstDate) / (24 * 60 * 60 * 1000));
    overallWeeklyRateKg = Number((((currentWeight - sorted[0].weight) / totalDays) * 7).toFixed(2));
  }

  const effectiveWeeklyRate = customWeeklyRate !== undefined ? customWeeklyRate : currentWeeklyRateKg;

  // Date calculation helper
  const computeDate = (rateKgPerWeek: number): { dateStr: string; days: number; weeks: number } | null => {
    if (rateKgPerWeek >= -0.05 || remainingKg <= 0) return null;
    const weeks = remainingKg / Math.abs(rateKgPerWeek);
    const days = Math.round(weeks * 7);
    const targetDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const dateStr = targetDate.toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return { dateStr, days, weeks: Number(weeks.toFixed(1)) };
  };

  const currentPaceResult = computeDate(effectiveWeeklyRate);
  const overallPaceResult = computeDate(overallWeeklyRateKg);
  const healthyPaceResult = computeDate(-0.5); // standard recommendation 0.5 kg/week

  // Daily deficit required to maintain currentWeeklyRate (~7700 kcal per kg)
  const targetDailyDeficitKcal = effectiveWeeklyRate < 0
    ? Math.round((Math.abs(effectiveWeeklyRate) * 7700) / 7)
    : 500;

  return {
    remainingKg,
    currentWeeklyRateKg: effectiveWeeklyRate,
    overallWeeklyRateKg,
    projectedDateCurrentPace: currentPaceResult?.dateStr ?? null,
    projectedDateOverallPace: overallPaceResult?.dateStr ?? null,
    projectedDateHealthyPace: healthyPaceResult?.dateStr ?? null,
    daysNeededCurrentPace: currentPaceResult?.days ?? null,
    weeksNeededCurrentPace: currentPaceResult?.weeks ?? null,
    targetDailyDeficitKcal,
    isGoalReached,
  };
}

/**
 * Calculates science-based calorie and macronutrient requirements
 * based on Mifflin-St Jeor formula and evidence-based sport nutrition guidelines
 */
export function calculateNutritionRecommendations(
  weightKg: number,
  heightCm: number,
  dailyDeficitKcal = 500,
  activityMultiplier = 1.4, // standard lightly to moderately active
  age = 30
): NutritionPlan {
  // Mifflin-St Jeor BMR (using neutral baseline)
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  const tdee = Math.round(bmr * activityMultiplier);
  const targetCalories = Math.max(1200, Math.round(tdee - dailyDeficitKcal));

  // Protein: 2.0g per kg body weight (optimal for muscle retention and high satiety in deficit)
  const proteinGrams = Math.round(weightKg * 2.0);
  const proteinCalories = proteinGrams * 4;

  // Fat: 0.85g per kg body weight (essential hormones and fat-soluble vitamins)
  const fatGrams = Math.round(weightKg * 0.85);
  const fatCalories = fatGrams * 9;

  // Carbohydrates: remaining calories divided by 4 kcal/g
  const remainingForCarbs = Math.max(120, targetCalories - (proteinCalories + fatCalories));
  const carbsGrams = Math.round(remainingForCarbs / 4);
  const carbsCalories = carbsGrams * 4;

  const totalMacroCalories = proteinCalories + fatCalories + carbsCalories;
  const proteinPercent = Math.round((proteinCalories / totalMacroCalories) * 100);
  const fatPercent = Math.round((fatCalories / totalMacroCalories) * 100);
  const carbsPercent = Math.max(0, 100 - proteinPercent - fatPercent);

  // Hydration: 35ml per kg body weight
  const waterLiters = Number(((weightKg * 35) / 1000).toFixed(1));

  // Dietary fiber: ~14g per 1000 kcal
  const fiberGrams = Math.round((targetCalories / 1000) * 14);

  return {
    bmr,
    tdee,
    targetCalories,
    dailyDeficitKcal,
    proteinGrams,
    proteinCalories,
    proteinPercent,
    fatGrams,
    fatCalories,
    fatPercent,
    carbsGrams,
    carbsCalories,
    carbsPercent,
    waterLiters,
    fiberGrams,
  };
}
