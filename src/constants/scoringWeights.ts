/**
 * Scoring Weights Configuration
 * Defines weight distributions for different scoring calculations
 * Based on UN SDG framework priorities (2023-2030)
 */

export const SCORING_WEIGHTS = {
  impact: 0.35,
  sustainability: 0.25,
  feasibility: 0.25,
  sdgAlignment: 0.15
} as const;

export const IMPACT_WEIGHTS = [0.30, 0.25, 0.20, 0.15, 0.10] as const;
export const SUSTAINABILITY_WEIGHTS = [0.35, 0.30, 0.20, 0.15] as const;
export const FEASIBILITY_WEIGHTS = [0.35, 0.25, 0.25, 0.15] as const;
export const ALIGNMENT_WEIGHTS = [0.30, 0.35, 0.20, 0.15] as const;
