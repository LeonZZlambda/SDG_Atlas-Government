/**
 * Domain types for project data
 * Replaces 'any' types with proper domain models
 */

export interface MonteCarloStats {
  stdDevImpact: number;
  stdDevSustain: number;
  stdDevFeasibility: number;
}

export interface ScoreBreakdownItem {
  name: string;
  value: number;
  isPositive: boolean;
}

export interface Connection {
  source: number;
  target: number;
  value: number;
}

export interface SensitivityItem {
  sdgId: number;
  contribution: number;
  reason: string;
}

export interface FeasibilityBreakdown {
  resourceCapacity: number;
  implementationSimplicity: number;
  coordinationComplexity: number;
  conflictPenalty: number;
}

export interface GeneratedProjectData {
  suggestedName: string;
  summary: string;
  objectives: string[];
  targetAudience: string;
  timeline: string;
  indicators: string[];
  resources: string;
  risks: string[];
  partners: string;
  synergyBalanceIndex: number;
  connections: Connection[];
  tradeoffs: string[];
  overallImpactScore: number;
  scoreBreakdown: ScoreBreakdownItem[];
  reachEstimated: number;
  sustainabilityIndex: number;
  alignmentScore: number;
  feasibility: number;
  complexity: number;
  systemicInfluenceScores: Record<number, number>;
  sensitivity: SensitivityItem[];
  monteCarloStats: MonteCarloStats;
  feasibilityBreakdown: FeasibilityBreakdown;
  costPerBeneficiary: number;
}

export interface ProjectInputs {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}
