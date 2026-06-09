// Initiative Schema Types

export type DependencySeverity = 'low' | 'medium' | 'high';
export type DependencyCategory = 'infrastructure' | 'staff' | 'institutional' | 'policy' | 'financial';
export type InitiativeCategory = 'social' | 'environmental' | 'economic' | 'governance' | 'infrastructure';

export interface Dependency {
  id: string;
  category: DependencyCategory;
  severity: DependencySeverity;
  description: string;
  requiredResources?: string[];
  estimatedResolutionTime?: number; // in months
  blocking: boolean; // Whether this dependency blocks the initiative
}

export interface Risk {
  id: string;
  category: string;
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  mitigationStrategy?: string;
}

export interface InfrastructureRequirement {
  type: string;
  description: string;
  estimatedCost?: number;
  timeline?: number; // in months
}

export interface Initiative {
  id: string;
  name: string;
  description: string;
  category: InitiativeCategory;
  
  // SDG Mappings
  sdgIds: number[];
  sdgAlignmentWeights?: Record<number, number>; // Custom weights per SDG
  
  // Dependencies
  dependencies: Dependency[];
  
  // Risks
  risks: Risk[];
  
  // Infrastructure
  infrastructureRequirements: InfrastructureRequirement[];
  
  // Resources
  estimatedBudget: number;
  requiredStaff: number;
  timeline: number; // in months
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'active' | 'completed' | 'on-hold';
}

export interface ScoreBreakdown {
  metric: string;
  score: number; // 0-100
  weight: number; // 0-1
  contribution: number; // weighted contribution to total
  factors: ScoreFactor[];
}

export interface ScoreFactor {
  name: string;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface InitiativeScores {
  impact: number; // 0-100
  sustainability: number; // 0-100
  feasibility: number; // 0-100
  sdgAlignment: number; // 0-100
  overall: number; // 0-100 (weighted average)
  
  breakdowns: {
    impact: ScoreBreakdown;
    sustainability: ScoreBreakdown;
    feasibility: ScoreBreakdown;
    sdgAlignment: ScoreBreakdown;
  };
  
  explanations: {
    impact: string;
    sustainability: string;
    feasibility: string;
    sdgAlignment: string;
    overall: string;
  };
}

export interface Bottleneck {
  type: 'dependency' | 'resource' | 'risk' | 'timeline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedInitiatives: string[];
  recommendation: string;
}

export interface InitiativeAnalysis {
  initiative: Initiative;
  scores: InitiativeScores;
  bottlenecks: Bottleneck[];
  dependencies: Dependency[];
  criticalPath: string[]; // IDs of initiatives in critical path
}

export interface Tradeoff {
  type: 'conflict' | 'synergy' | 'neutral';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedSDGs: number[];
  affectedInitiatives: string[];
  recommendation: string;
  coefficient: number;
}

export interface TradeoffAnalysis {
  overallTradeoffScore: number; // -100 to 100 (negative = more conflicts)
  tradeoffs: Tradeoff[];
  criticalConflicts: Tradeoff[];
  strongSynergies: Tradeoff[];
  netSynergy: number; // sum of all coefficients
  recommendations: string[];
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  target?: number;
  trend: 'up' | 'down' | 'stable';
  category: 'impact' | 'efficiency' | 'risk' | 'sustainability';
  description: string;
  calculation: string;
}

export interface KPIDashboard {
  kpis: KPI[];
  overallHealth: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

export interface SystemicRisk {
  id: string;
  type: 'resource' | 'dependency' | 'timeline' | 'strategic' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  scope: 'initiative' | 'portfolio' | 'systemic';
  description: string;
  affectedInitiatives: string[];
  propagationPath: string[]; // IDs of initiatives in propagation path
  mitigationStrategies: string[];
  earlyWarningIndicators: string[];
}

export interface RiskCluster {
  id: string;
  type: string;
  initiatives: string[];
  sharedRisks: string[];
  clusterSeverity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CascadingRisk {
  triggerInitiative: string;
  affectedInitiatives: string[];
  cascadePath: string[];
  probability: number;
  impact: number;
  timeline: number; // months to cascade
}

export interface SystemicRiskReport {
  risks: SystemicRisk[];
  overallSystemicRiskScore: number; // 0-100
  riskClusters: RiskCluster[];
  cascadingRisks: CascadingRisk[];
  recommendations: string[];
}

export interface CivicInsight {
  category: 'opportunity' | 'risk' | 'recommendation' | 'warning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionable: boolean;
  suggestedActions?: string[];
  relatedSDGs?: number[];
  relatedMetrics?: string[];
}

export interface CivicInsightReport {
  insights: CivicInsight[];
  summary: string;
  keyOpportunities: CivicInsight[];
  keyRisks: CivicInsight[];
  overallRecommendation: string;
}
