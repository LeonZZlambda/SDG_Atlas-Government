import type { GeneratedProjectData } from '../types/project';
import { calculateDegreeCentrality, calculateBetweennessCentrality, calculatePageRank } from '../utils/graphAlgorithms';
import type { Graph } from '../utils/graphAlgorithms';

export interface SystemicInfluenceMetrics {
  degreeCentrality: Map<number, number>;
  betweennessCentrality: Map<number, number>;
  pageRank: Map<number, number>;
  systemicInfluenceScores: Record<number, number>;
}

export interface ExplanationPanel {
  metricName: string;
  score: number;
  maxScore: number;
  interpretation: string;
  confidence: 'high' | 'medium' | 'low';
  factors: Array<{
    name: string;
    impact: number;
    reason: string;
  }>;
  trend?: 'increasing' | 'decreasing' | 'stable';
  uncertainty?: {
    margin: number;
  };
}

export interface ExecutiveInsight {
  category: 'strength' | 'opportunity' | 'risk' | 'recommendation';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Engine Status Service
 * Extracts business logic from EngineStatusPanel component
 */
export class EngineStatusService {
  private project: GeneratedProjectData;

  constructor(project: GeneratedProjectData) {
    this.project = project;
  }

  /**
   * Calculate systemic influence metrics for selected SDGs
   */
  calculateSystemicInfluence(): SystemicInfluenceMetrics {
    const graph: Graph = {
      nodes: this.project.connections.map(c => ({ id: c.source, label: `ODS ${c.source}` })),
      edges: this.project.connections.map(c => ({ from: c.source, to: c.target, weight: c.value })),
    };

    const degreeCentrality = calculateDegreeCentrality(graph);
    const betweennessCentrality = calculateBetweennessCentrality(graph);
    const pageRank = calculatePageRank(graph);

    return {
      degreeCentrality,
      betweennessCentrality,
      pageRank,
      systemicInfluenceScores: this.project.systemicInfluenceScores,
    };
  }

  /**
   * Generate explanation panels for key metrics
   */
  generateExplanationPanels(): ExplanationPanel[] {
    const panels: ExplanationPanel[] = [];

    // Impact Score Panel
    panels.push({
      metricName: 'Impact Score',
      score: this.project.overallImpactScore,
      maxScore: 100,
      interpretation: this.getImpactInterpretation(),
      confidence: this.getConfidenceLevel(),
      factors: this.getImpactFactors(),
      trend: this.getImpactTrend(),
      uncertainty: {
        margin: this.project.monteCarloStats.stdDevImpact,
      },
    });

    // Sustainability Score Panel
    panels.push({
      metricName: 'Sustainability Index',
      score: this.project.sustainabilityIndex,
      maxScore: 100,
      interpretation: this.getSustainabilityInterpretation(),
      confidence: this.getConfidenceLevel(),
      factors: this.getSustainabilityFactors(),
      trend: 'stable',
      uncertainty: {
        margin: this.project.monteCarloStats.stdDevSustain,
      },
    });

    // Feasibility Score Panel
    panels.push({
      metricName: 'Feasibility Score',
      score: this.project.feasibility,
      maxScore: 100,
      interpretation: this.getFeasibilityInterpretation(),
      confidence: this.getConfidenceLevel(),
      factors: this.getFeasibilityFactors(),
      trend: 'stable',
      uncertainty: {
        margin: this.project.monteCarloStats.stdDevFeasibility,
      },
    });

    return panels;
  }

  /**
   * Generate executive insights
   */
  generateExecutiveInsights(): ExecutiveInsight[] {
    const insights: ExecutiveInsight[] = [];

    // Tradeoff warnings
    if (this.project.tradeoffs.length > 0) {
      insights.push({
        category: 'risk',
        title: 'SDG Tradeoffs Detected',
        description: `${this.project.tradeoffs.length} tradeoff(s) between selected SDGs require attention.`,
        actionable: true,
        priority: this.project.tradeoffs.length > 2 ? 'high' : 'medium',
      });
    }

    // Synergy opportunities
    if (this.project.synergyBalanceIndex > 0.6) {
      insights.push({
        category: 'strength',
        title: 'Strong Synergy Network',
        description: 'Selected SDGs exhibit strong synergistic relationships.',
        actionable: false,
        priority: 'high',
      });
    }

    // Resource efficiency
    if (this.project.costPerBeneficiary < 50) {
      insights.push({
        category: 'opportunity',
        title: 'Cost-Effective Approach',
        description: 'Low cost per beneficiary indicates efficient resource allocation.',
        actionable: true,
        priority: 'medium',
      });
    }

    return insights;
  }

  private getImpactInterpretation(): string {
    const score = this.project.overallImpactScore;
    if (score >= 80) return 'Exceptional impact potential with strong multiplier effects.';
    if (score >= 60) return 'Good impact potential with measurable outcomes expected.';
    if (score >= 40) return 'Moderate impact potential requiring optimization.';
    return 'Limited impact potential - consider revising approach.';
  }

  private getSustainabilityInterpretation(): string {
    const score = this.project.sustainabilityIndex;
    if (score >= 75) return 'Excellent long-term viability with strong sustainability foundations.';
    if (score >= 50) return 'Good sustainability profile with room for improvement.';
    if (score >= 25) return 'Moderate sustainability requiring attention to long-term factors.';
    return 'Low sustainability - significant risks to long-term viability.';
  }

  private getFeasibilityInterpretation(): string {
    const score = this.project.feasibility;
    if (score >= 75) return 'High feasibility with adequate resources and manageable complexity.';
    if (score >= 50) return 'Moderate feasibility with some resource or coordination challenges.';
    if (score >= 25) return 'Challenging feasibility requiring significant resource allocation.';
    return 'Low feasibility - major barriers to implementation.';
  }

  private getConfidenceLevel(): 'high' | 'medium' | 'low' {
    const avgStdDev = (this.project.monteCarloStats.stdDevImpact + 
                      this.project.monteCarloStats.stdDevSustain + 
                      this.project.monteCarloStats.stdDevFeasibility) / 3;
    if (avgStdDev < 5) return 'high';
    if (avgStdDev < 10) return 'medium';
    return 'low';
  }

  private getImpactFactors(): Array<{ name: string; impact: number; reason: string }> {
    return this.project.scoreBreakdown.map(factor => ({
      name: factor.name,
      impact: factor.value,
      reason: factor.isPositive ? 'Positive contributor' : 'Negative factor',
    }));
  }

  private getSustainabilityFactors(): Array<{ name: string; impact: number; reason: string }> {
    return [
      { name: 'Duration Factor', impact: 30, reason: 'Longer projects improve sustainability' },
      { name: 'Synergy Factor', impact: this.project.synergyBalanceIndex * 45, reason: 'SDG synergies boost sustainability' },
      { name: 'Team Factor', impact: 20, reason: 'Adequate team size supports sustainability' },
    ];
  }

  private getFeasibilityFactors(): Array<{ name: string; impact: number; reason: string }> {
    return [
      { name: 'Resource Capacity', impact: this.project.feasibilityBreakdown.resourceCapacity, reason: 'Budget and staff adequacy' },
      { name: 'Implementation Simplicity', impact: this.project.feasibilityBreakdown.implementationSimplicity, reason: 'Complexity of implementation' },
      { name: 'Coordination', impact: this.project.feasibilityBreakdown.coordinationComplexity, reason: 'Stakeholder coordination needs' },
      { name: 'Conflict Penalty', impact: -this.project.feasibilityBreakdown.conflictPenalty, reason: 'SDG conflicts reduce feasibility' },
    ];
  }

  private getImpactTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.project.synergyBalanceIndex > 0.5) return 'increasing';
    if (this.project.synergyBalanceIndex < 0) return 'decreasing';
    return 'stable';
  }
}
