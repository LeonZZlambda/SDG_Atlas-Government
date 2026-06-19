/**
 * Engine Weights Configuration
 * Defines weight distributions for engine calculations
 */

export const SYSTEMIC_INFLUENCE_WEIGHTS = {
  DEGREE: 0.4,
  BETWEENNESS: 0.3,
  POSITIVE_INFLUENCE: 0.3
} as const;

export const DRIVER_GENERATION_THRESHOLDS = {
  NETWORK_DENSITY_HIGH: 0.5,
  SYNERGY_RATIO_HIGH: 0.7,
  CENTRALITY_HIGH: 0.5,
  NETWORK_SIZE_MIN: 4,
  NETWORK_SIZE_MAX: 10,
  TEAM_SIZE_MIN: 5,
  BENEFICIARY_MIN: 1000,
  CLUSTERING_HIGH: 0.5,
  CLUSTERING_MODERATE: 0.3
} as const;
