/**
 * Scoring Engine
 * 
 * Calculates shooting scores based on:
 * - Distance multipliers
 * - Grouping bonuses
 * - Final score formula
 * 
 * All distances are in metres.
 * All group sizes are in millimetres.
 */

// ============================================================
// Distance Multipliers
// ============================================================

const DISTANCE_MULTIPLIERS: Record<number, number> = {
  5: 1.00,
  7: 1.20,
  10: 1.50,
  12: 1.70,
  15: 2.00,
  20: 2.50,
  25: 3.00,
  30: 3.50,
  40: 4.50,
  50: 5.50,
};

/**
 * Get the sorted distances for interpolation.
 */
const sortedDistances = Object.entries(DISTANCE_MULTIPLIERS)
  .map(([d, m]) => ({ distance: Number(d), multiplier: m }))
  .sort((a, b) => a.distance - b.distance);

/**
 * Interpolate smoothly between two values.
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Calculate the distance multiplier for a given shooting distance.
 * 
 * For exact known distances, returns the exact multiplier.
 * For distances between known values, interpolates smoothly.
 * For distances below the minimum, returns the minimum multiplier.
 * For distances above the maximum, extrapolates linearly.
 * 
 * @param distanceMeters - Shooting distance in metres
 * @returns The calculated distance multiplier
 */
export function calculateDistanceMultiplier(distanceMeters: number): number {
  if (distanceMeters <= sortedDistances[0].distance) {
    return sortedDistances[0].multiplier;
  }

  if (distanceMeters >= sortedDistances[sortedDistances.length - 1].distance) {
    // Extrapolate beyond the max known distance
    const last = sortedDistances[sortedDistances.length - 1];
    const prev = sortedDistances[sortedDistances.length - 2];
    const stepMultiplier = last.multiplier - prev.multiplier;
    const stepDistance = last.distance - prev.distance;
    const extraSteps = (distanceMeters - last.distance) / stepDistance;
    return last.multiplier + stepMultiplier * extraSteps;
  }

  // Find surrounding distances and interpolate
  for (let i = 0; i < sortedDistances.length - 1; i++) {
    const lower = sortedDistances[i];
    const upper = sortedDistances[i + 1];

    if (distanceMeters >= lower.distance && distanceMeters <= upper.distance) {
      const t = (distanceMeters - lower.distance) / (upper.distance - lower.distance);
      return Math.round(lerp(lower.multiplier, upper.multiplier, t) * 100) / 100;
    }
  }

  return sortedDistances[sortedDistances.length - 1].multiplier;
}

// ============================================================
// Grouping Bonus
// ============================================================

/**
 * Calculate the grouping bonus based on group size.
 * 
 * Group sizes are measured in millimetres (centre-to-centre
 * distance between the two farthest shots).
 * 
 * | Group Size  | Bonus |
 * | ----------- | ----: |
 * | Under 20 mm |   +20 |
 * | Under 30 mm |   +15 |
 * | Under 40 mm |   +10 |
 * | Under 50 mm |    +5 |
 * | Above 50 mm |    +0 |
 *
 * @param groupSizeMm - The group size in millimetres
 * @returns The bonus points to add
 */
export function calculateGroupingBonus(groupSizeMm: number | null): number {
  if (groupSizeMm === null || groupSizeMm === undefined) return 0;

  if (groupSizeMm < 20) return 20;
  if (groupSizeMm < 30) return 15;
  if (groupSizeMm < 40) return 10;
  if (groupSizeMm < 50) return 5;
  return 0;
}

// ============================================================
// Final Score Formula
// ============================================================

export interface ScoreInput {
  /** Raw score on the target (e.g., sum of ring values) */
  rawTargetScore: number;
  /** Shooting distance in metres */
  distanceMeters: number;
  /** Group size in millimetres (optional) */
  groupSizeMm?: number | null;
}

export interface ScoreResult {
  /** The raw target score before any multipliers */
  rawTargetScore: number;
  /** The distance multiplier applied */
  distanceMultiplier: number;
  /** The group size in millimetres */
  groupSizeMm: number | null;
  /** The grouping bonus points */
  groupingBonus: number;
  /** The final calculated score */
  finalScore: number;
}

/**
 * Calculate the final score for a shooting session.
 * 
 * Formula: Final Score = (Raw Target Score × Distance Multiplier) + Grouping Bonus
 * 
 * @param input - The scoring input parameters
 * @returns The complete scoring result
 */
export function calculateFinalScore(input: ScoreInput): ScoreResult {
  const distanceMultiplier = calculateDistanceMultiplier(input.distanceMeters);
  const groupingBonus = calculateGroupingBonus(input.groupSizeMm ?? null);

  const multipliedScore = input.rawTargetScore * distanceMultiplier;
  const finalScore = Math.round((multipliedScore + groupingBonus) * 100) / 100;

  return {
    rawTargetScore: input.rawTargetScore,
    distanceMultiplier,
    groupSizeMm: input.groupSizeMm ?? null,
    groupingBonus,
    finalScore,
  };
}

// ============================================================
// Worked Examples
// ============================================================

/**
 * Example 1: Close range, tight group
 * 5 metres, score 85, group size 15mm
 * Multiplier: 1.00
 * Grouping Bonus: +20 (under 20mm)
 * Final Score: (85 × 1.00) + 20 = 105
 */

/**
 * Example 2: Medium range, moderate group
 * 15 metres, score 78, group size 35mm
 * Multiplier: 2.00
 * Grouping Bonus: +10 (under 40mm)
 * Final Score: (78 × 2.00) + 10 = 166
 */

/**
 * Example 3: Long range, loose group
 * 25 metres, score 65, group size 55mm
 * Multiplier: 3.00
 * Grouping Bonus: +0 (above 50mm)
 * Final Score: (65 × 3.00) + 0 = 195
 */

/**
 * Example 4: Interpolated distance
 * 8 metres (between 7m and 10m), score 90, group size 22mm
 * Multiplier: 1.35 (interpolated between 1.20 and 1.50)
 * Grouping Bonus: +15 (under 30mm)
 * Final Score: (90 × 1.35) + 15 = 136.5
 */