export interface WeightEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  weight: number; // in kg
  bodyFat?: number; // percentage
  waist?: number; // cm
  notes?: string;
  timestamp: number;
}

export interface UserProfile {
  startWeight: number; // kg
  currentWeight: number; // kg
  goalWeight: number; // kg
  height: number; // cm
  startDate: string; // YYYY-MM-DD
  targetDate?: string; // YYYY-MM-DD
  unit: 'kg' | 'lbs';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetKgLost: number;
  isUnlocked: boolean;
  unlockedAtDate?: string;
  type: 'weight' | 'percentage' | 'bmi' | 'streak';
}

export interface CalculatedStats {
  currentWeight: number;
  startWeight: number;
  goalWeight: number;
  totalChangeKg: number;
  percentageToGoal: number;
  remainingKg: number;
  sevenDayChangeKg: number;
  weeklyRateKg: number;
  movingAverage7d: number;
  projectedGoalDate: string | null;
  estimatedDeficitKcal: number;
  bmi: number;
  bmiCategory: string;
  bmiHealthyRange: { min: number; max: number };
  bestWeeklyLossKg: number;
  daysLogged: number;
}

export interface GoalProjection {
  remainingKg: number;
  currentWeeklyRateKg: number;
  overallWeeklyRateKg: number;
  projectedDateCurrentPace: string | null;
  projectedDateOverallPace: string | null;
  projectedDateHealthyPace: string | null; // at 0.5 kg/week
  daysNeededCurrentPace: number | null;
  weeksNeededCurrentPace: number | null;
  targetDailyDeficitKcal: number;
  isGoalReached: boolean;
}

export interface NutritionPlan {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  targetCalories: number; // Daily caloric target with deficit
  dailyDeficitKcal: number;
  proteinGrams: number;
  proteinCalories: number;
  proteinPercent: number;
  fatGrams: number;
  fatCalories: number;
  fatPercent: number;
  carbsGrams: number;
  carbsCalories: number;
  carbsPercent: number;
  waterLiters: number;
  fiberGrams: number;
}
