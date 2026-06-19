/**
 * Engine Drivers Generation Logic
 * Generates positive and negative drivers for different engine types
 */

import { DRIVER_GENERATION_THRESHOLDS } from '../constants/engineWeights';
import type { GeneratedProjectData, ProjectInputs } from '../types/project';
import type { GraphStatistics } from './graphAlgorithms';

export interface Drivers {
  positive: string[];
  negative: string[];
}

export interface DriverGenerationContext {
  hasSdgs: boolean;
  selectedSDGs: number[];
  graphStats?: GraphStatistics;
  graph?: { edges: { length: number } };
  positiveEdges: number;
  negativeEdges: number;
  degCentrality?: Map<number, number> | null;
  betweennessCentrality?: Map<number, number> | null;
  sbi?: number | null;
  project?: GeneratedProjectData | null;
  inputs?: ProjectInputs;
  calculateSystemicInfluence?: (id: number) => number;
}

export function generateDrivers(
  engineId: string,
  context: DriverGenerationContext,
  t: (key: string, params?: Record<string, unknown>) => string
): Drivers {
  const positive: string[] = [];
  const negative: string[] = [];

  if (!context.hasSdgs) return { positive, negative };

  switch (engineId) {
    case 'graph':
      return generateGraphDrivers(context, t);
    case 'mcda':
      return generateMCDADrivers(context, t);
    case 'impact':
      return generateImpactDrivers(context, t);
    case 'sustain':
      return generateSustainabilityDrivers(context, t);
    default:
      return { positive, negative };
  }
}

function generateGraphDrivers(
  context: DriverGenerationContext,
  t: (key: string, params?: Record<string, unknown>) => string
): Drivers {
  const positive: string[] = [];
  const negative: string[] = [];

  const { graphStats, positiveEdges, negativeEdges, degCentrality, selectedSDGs } = context;

  // Positive drivers
  if (graphStats?.density && graphStats.density > DRIVER_GENERATION_THRESHOLDS.NETWORK_DENSITY_HIGH) {
    positive.push(t('engine_high_network_density', { percent: (graphStats.density * 100).toFixed(0) }));
  }

  if (positiveEdges > 0 && context.graph && positiveEdges > context.graph.edges.length * DRIVER_GENERATION_THRESHOLDS.SYNERGY_RATIO_HIGH) {
    positive.push(t('engine_strong_synergies'));
  }

  if (degCentrality) {
    const avgDeg = Array.from(degCentrality.values()).reduce((a, b) => a + b, 0) / degCentrality.size;
    if (avgDeg > DRIVER_GENERATION_THRESHOLDS.CENTRALITY_HIGH) {
      positive.push(t('engine_high_centrality'));
    }
  }

  // Negative drivers
  if (selectedSDGs.length < DRIVER_GENERATION_THRESHOLDS.NETWORK_SIZE_MIN) {
    negative.push(t('engine_limited_network_size'));
  }

  if (negativeEdges > 0) {
    negative.push(t(negativeEdges === 1 ? 'engine_tradeoffs_detected' : 'engine_tradeoffs_detected_plural', { count: negativeEdges }));
  }

  if (graphStats?.averageClusteringCoefficient && graphStats.averageClusteringCoefficient < DRIVER_GENERATION_THRESHOLDS.CLUSTERING_MODERATE) {
    negative.push(t('engine_low_clustering'));
  }

  return { positive, negative };
}

function generateMCDADrivers(
  context: DriverGenerationContext,
  t: (key: string, params?: Record<string, unknown>) => string
): Drivers {
  const positive: string[] = [];
  const negative: string[] = [];

  const { sbi, selectedSDGs, project } = context;

  // Positive drivers
  if (sbi && sbi > 0.6) {
    positive.push(t('engine_high_sbi'));
  }

  if (selectedSDGs.length >= DRIVER_GENERATION_THRESHOLDS.NETWORK_SIZE_MIN && selectedSDGs.length <= 7) {
    positive.push(t('engine_ideal_goals_range'));
  }

  if (project && project.tradeoffs.length === 0) {
    positive.push(t('engine_zero_tradeoffs'));
  }

  // Negative drivers
  if (selectedSDGs.length < 3) {
    negative.push(t('engine_low_goals_range'));
  }

  if (sbi && sbi < 0) {
    negative.push(t('engine_tradeoffs_predominance'));
  }

  if (selectedSDGs.length > DRIVER_GENERATION_THRESHOLDS.NETWORK_SIZE_MAX) {
    negative.push(t('engine_high_coordination_complexity'));
  }

  return { positive, negative };
}

function generateImpactDrivers(
  context: DriverGenerationContext,
  t: (key: string, params?: Record<string, unknown>) => string
): Drivers {
  const positive: string[] = [];
  const negative: string[] = [];

  const { project, positiveEdges, sbi, selectedSDGs, degCentrality, betweennessCentrality, inputs, calculateSystemicInfluence } = context;

  // Positive drivers
  if (project && project.overallImpactScore && project.overallImpactScore >= 70) {
    positive.push(t('engine_high_impact_score'));
  }

  if (positiveEdges > 0) {
    positive.push(t('engine_positive_connections', { count: positiveEdges }));
  }

  if (sbi && sbi > 0.5) {
    positive.push(t('engine_synergy_multiplier'));
  }

  // Add dominant SDG driver based on Systemic Influence Score
  if (degCentrality && betweennessCentrality && calculateSystemicInfluence) {
    const systemicInfluences = selectedSDGs.map(id => ({
      id,
      score: calculateSystemicInfluence(id)
    }));
    const maxInfluence = systemicInfluences.reduce((a, b) => a.score > b.score ? a : b);
    if (maxInfluence.score > 0.3) {
      positive.push(t('engine_dominates_systemic_influence', { id: maxInfluence.id }));
    }
  }

  // Negative drivers
  if (project && project.tradeoffs.length > 0) {
    negative.push(t(project.tradeoffs.length === 1 ? 'engine_conflicts_reducing_impact' : 'engine_conflicts_reducing_impact_plural', { count: project.tradeoffs.length }));
  }

  if (selectedSDGs.length < 3) {
    negative.push(t('engine_low_thematic_diversity'));
  }

  if (inputs && inputs.beneficiaries && inputs.beneficiaries < DRIVER_GENERATION_THRESHOLDS.BENEFICIARY_MIN) {
    negative.push(t('engine_limited_beneficiary_reach'));
  }

  return { positive, negative };
}

function generateSustainabilityDrivers(
  context: DriverGenerationContext,
  t: (key: string, params?: Record<string, unknown>) => string
): Drivers {
  const positive: string[] = [];
  const negative: string[] = [];

  const { project, negativeEdges, graphStats, selectedSDGs, inputs } = context;

  // Positive drivers
  if (project && project.sustainabilityIndex && project.sustainabilityIndex >= 70) {
    positive.push(t('engine_high_resilience'));
  }

  if (negativeEdges === 0) {
    positive.push(t('engine_zero_structural_conflicts'));
  }

  if (graphStats?.averageClusteringCoefficient && graphStats.averageClusteringCoefficient > DRIVER_GENERATION_THRESHOLDS.CLUSTERING_HIGH) {
    positive.push(t('engine_high_network_cohesion'));
  }

  if (inputs && inputs.duration && inputs.duration >= 12) {
    positive.push(t('engine_adequate_time_horizon'));
  }

  // Negative drivers
  if (project && project.tradeoffs.length > 0) {
    negative.push(t('engine_conflicts_affecting_sustainability'));
  }

  if (selectedSDGs.length < DRIVER_GENERATION_THRESHOLDS.NETWORK_SIZE_MIN) {
    negative.push(t('engine_low_network_redundancy'));
  }

  if (inputs && inputs.teamSize && inputs.teamSize < DRIVER_GENERATION_THRESHOLDS.TEAM_SIZE_MIN) {
    negative.push(t('engine_limited_team_capacity'));
  }

  return { positive, negative };
}
