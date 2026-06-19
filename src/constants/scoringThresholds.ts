/**
 * Scoring Thresholds Configuration
 * Defines threshold values for score categorization
 */

export const SCORE_THRESHOLDS = {
  EXCEPTIONAL: 91,
  HIGH: 71,
  MODERATE: 41,
  LOW: 0
} as const;

export const IMPACT_THRESHOLDS = {
  HIGH: 50,
  MODERATE: 30,
  LOW: 0
} as const;

export const SUSTAINABILITY_THRESHOLDS = {
  HIGHLY_RESILIENT: 91,
  RESILIENT: 71,
  STABLE: 41,
  FRAGILE: 0
} as const;

export const FEASIBILITY_THRESHOLDS = {
  HIGH: 70,
  MODERATE: 40,
  LOW: 0
} as const;

export const ALIGNMENT_THRESHOLDS = {
  HIGH: 50,
  MODERATE: 25,
  LOW: 0
} as const;
