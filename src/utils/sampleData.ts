import { WeightEntry, UserProfile } from '../types';

export const defaultProfile: UserProfile = {
  startWeight: 115,
  currentWeight: 115,
  goalWeight: 100,
  height: 0,
  startDate: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })(),
  unit: 'kg',
};

// Generates realistic 60-day historical data ending at today's relative timeline
export function generateSampleEntries(): WeightEntry[] {
  const entries: WeightEntry[] = [];
  const totalDays = 60;
  const startKg = 91.5;
  const endKg = 84.4;

  const now = new Date();

  // Create an authentic weight progression with natural water fluctuations
  for (let i = 0; i < totalDays; i++) {
    // Days ago
    const daysAgo = totalDays - 1 - i;
    const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];

    // Smooth baseline progression
    const progressFactor = i / (totalDays - 1);
    const baseline = startKg - progressFactor * (startKg - endKg);

    // Natural day-to-day fluctuation: -0.4 to +0.4 kg
    // Weekend bumps (carb/water retention)
    const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday
    const weekendBump = (dayOfWeek === 1 || dayOfWeek === 0) ? 0.3 : -0.1;
    const sinNoise = Math.sin(i * 0.7) * 0.35;
    const noise = Math.round((sinNoise + weekendBump) * 10) / 10;

    const currentWeight = Number((baseline + noise).toFixed(1));

    // Waist measurement (starting ~98cm down to ~91cm)
    const waist = Number((98 - progressFactor * 7 + (Math.sin(i) * 0.4)).toFixed(1));

    let notes: string | undefined = undefined;
    if (i === 0) notes = 'Start der Ernährungsumstellung & Tracker';
    else if (i === 14) notes = 'Erste 2 Wochen rum, deutlich mehr Energie';
    else if (i === 28) notes = '5 kg Marke geknackt! Altes T-Shirt passt wieder';
    else if (i === 42) notes = 'Intervallfasten 16:8 etabliert';
    else if (i === 55) notes = 'Laufrunde um 2 km gesteigert';

    entries.push({
      id: `sample-${i}-${dateStr}`,
      date: dateStr,
      weight: currentWeight,
      waist: i % 4 === 0 ? waist : undefined,
      bodyFat: i % 7 === 0 ? Number((26.5 - progressFactor * 3.5).toFixed(1)) : undefined,
      notes,
      timestamp: d.getTime(),
    });
  }

  return entries;
}
