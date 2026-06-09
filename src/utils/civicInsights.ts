import type { Initiative, InitiativeScores, TradeoffAnalysis, Bottleneck } from '../types/initiative';
import { SDG_METADATA } from './projectGenerator';

/**
 * Civic Insight Generation Engine
 * Rule-based system to generate actionable insights for civic initiatives
 */

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

/**
 * Generate civic insights based on initiative analysis
 */
export function generateCivicInsights(
  initiative: Initiative,
  scores: InitiativeScores,
  tradeoffAnalysis: TradeoffAnalysis,
  bottlenecks: Bottleneck[]
): CivicInsightReport {
  const insights: CivicInsight[] = [];
  
  // Score-based insights
  insights.push(...generateScoreInsights(scores, initiative));
  
  // Tradeoff-based insights
  insights.push(...generateTradeoffInsights(tradeoffAnalysis));
  
  // Bottleneck-based insights
  insights.push(...generateBottleneckInsights(bottlenecks));
  
  // SDG-specific insights
  insights.push(...generateSDGSpecificInsights(initiative, scores));
  
  // Resource-based insights
  insights.push(...generateResourceInsights(initiative, scores));
  
  // Risk-based insights
  insights.push(...generateRiskInsights(initiative));
  
  // Dependency-based insights
  insights.push(...generateDependencyInsights(initiative));
  
  const keyOpportunities = insights
    .filter(i => i.category === 'opportunity' && (i.priority === 'high' || i.priority === 'critical'))
    .slice(0, 3);
  
  const keyRisks = insights
    .filter(i => i.category === 'risk' && (i.priority === 'high' || i.priority === 'critical'))
    .slice(0, 3);
  
  const summary = generateInsightSummary(insights, scores);
  const overallRecommendation = generateOverallRecommendation(insights, scores);
  
  return {
    insights,
    summary,
    keyOpportunities,
    keyRisks,
    overallRecommendation
  };
}

/**
 * Generate insights based on scores
 */
function generateScoreInsights(scores: InitiativeScores, initiative: Initiative): CivicInsight[] {
  const insights: CivicInsight[] = [];
  
  // Impact insights
  if (scores.impact >= 80) {
    insights.push({
      category: 'opportunity',
      priority: 'high',
      title: 'High Impact Potential',
      description: 'This initiative shows exceptional potential for creating meaningful impact in the community.',
      actionable: true,
      suggestedActions: ['Scale implementation', 'Document success factors', 'Share best practices'],
      relatedMetrics: ['impact'],
      relatedSDGs: initiative.sdgIds
    });
  } else if (scores.impact < 40) {
    insights.push({
      category: 'risk',
      priority: 'high',
      title: 'Low Impact Potential',
      description: 'Current impact projections are below optimal levels. Consider revising approach or scope.',
      actionable: true,
      suggestedActions: ['Review target beneficiaries', 'Expand reach strategies', 'Increase resource allocation'],
      relatedMetrics: ['impact'],
      relatedSDGs: initiative.sdgIds
    });
  }
  
  // Feasibility insights
  if (scores.feasibility < 50) {
    insights.push({
      category: 'warning',
      priority: 'medium',
      title: 'Feasibility Concerns',
      description: 'Implementation may face significant challenges based on current resource and dependency analysis.',
      actionable: true,
      suggestedActions: ['Secure additional resources', 'Address critical dependencies', 'Develop contingency plans'],
      relatedMetrics: ['feasibility']
    });
  }
  
  // Sustainability insights
  if (scores.sustainability >= 75) {
    insights.push({
      category: 'opportunity',
      priority: 'medium',
      title: 'Strong Sustainability Profile',
      description: 'Initiative demonstrates excellent long-term viability and environmental/social alignment.',
      actionable: true,
      suggestedActions: ['Leverage for funding applications', 'Use as model for other initiatives'],
      relatedMetrics: ['sustainability']
    });
  }
  
  return insights;
}

/**
 * Generate insights based on tradeoff analysis
 */
function generateTradeoffInsights(tradeoffAnalysis: TradeoffAnalysis): CivicInsight[] {
  const insights: CivicInsight[] = [];
  
  if (tradeoffAnalysis.criticalConflicts.length > 0) {
    insights.push({
      category: 'risk',
      priority: 'critical',
      title: 'Critical SDG Conflicts Detected',
      description: `${tradeoffAnalysis.criticalConflicts.length} critical conflict(s) between selected SDGs may undermine initiative success.`,
      actionable: true,
      suggestedActions: ['Reconsider SDG selection', 'Develop mitigation strategies', 'Phase implementation'],
      relatedSDGs: tradeoffAnalysis.criticalConflicts.flatMap(t => t.affectedSDGs)
    });
  }
  
  if (tradeoffAnalysis.strongSynergies.length >= 3) {
    insights.push({
      category: 'opportunity',
      priority: 'high',
      title: 'Exceptional Synergy Network',
      description: `Strong synergies between ${tradeoffAnalysis.strongSynergies.length} SDG pairs create multiplier effects.`,
      actionable: true,
      suggestedActions: ['Highlight in communications', 'Use for cross-sector partnerships'],
      relatedSDGs: tradeoffAnalysis.strongSynergies.flatMap(t => t.affectedSDGs)
    });
  }
  
  if (tradeoffAnalysis.overallTradeoffScore < -30) {
    insights.push({
      category: 'warning',
      priority: 'high',
      title: 'Negative Tradeoff Balance',
      description: 'Overall tradeoff analysis indicates more conflicts than synergies.',
      actionable: true,
      suggestedActions: ['Revise SDG combination', 'Focus on high-synergy pairs']
    });
  }
  
  return insights;
}

/**
 * Generate insights based on bottlenecks
 */
function generateBottleneckInsights(bottlenecks: Bottleneck[]): CivicInsight[] {
  const insights: CivicInsight[] = [];
  
  const criticalBottlenecks = bottlenecks.filter(b => b.severity === 'critical');
  
  if (criticalBottlenecks.length > 0) {
    insights.push({
      category: 'risk',
      priority: 'critical',
      title: 'Critical Bottlenecks Identified',
      description: `${criticalBottlenecks.length} critical bottleneck(s) could prevent initiative success.`,
      actionable: true,
      suggestedActions: criticalBottlenecks.map(b => b.recommendation)
    });
  }
  
  const resourceBottlenecks = bottlenecks.filter(b => b.type === 'resource');
  if (resourceBottlenecks.length > 0) {
    insights.push({
      category: 'warning',
      priority: 'medium',
      title: 'Resource Constraints',
      description: 'Resource limitations may impact timeline and quality of implementation.',
      actionable: true,
      suggestedActions: ['Secure additional funding', 'Optimize resource allocation', 'Consider phased approach']
    });
  }
  
  return insights;
}

/**
 * Generate SDG-specific insights
 */
function generateSDGSpecificInsights(initiative: Initiative, _scores: InitiativeScores): CivicInsight[] {
  const insights: CivicInsight[] = [];
  
  const sdgDetails = initiative.sdgIds.map(id => SDG_METADATA.find(s => s.id === id)).filter(Boolean);
  
  // Check for environmental SDGs
  const environmentalSDGs = [6, 7, 11, 12, 13, 14, 15];
  const hasEnvironmental = initiative.sdgIds.some(id => environmentalSDGs.includes(id));
  
  if (hasEnvironmental) {
    insights.push({
      category: 'opportunity',
      priority: 'medium',
      title: 'Environmental Focus',
      description: 'Initiative addresses environmental sustainability, aligning with global climate priorities.',
      actionable: true,
      suggestedActions: ['Leverage climate funding opportunities', 'Partner with environmental organizations'],
      relatedSDGs: initiative.sdgIds.filter(id => environmentalSDGs.includes(id))
    });
  }
  
  // Check for social SDGs
  const socialSDGs = [1, 2, 3, 4, 5, 8, 10, 16];
  const hasSocial = initiative.sdgIds.some(id => socialSDGs.includes(id));
  
  if (hasSocial) {
    insights.push({
      category: 'opportunity',
      priority: 'medium',
      title: 'Social Impact Focus',
      description: 'Initiative addresses critical social needs and community development.',
      actionable: true,
      suggestedActions: ['Engage community stakeholders', 'Measure social impact metrics'],
      relatedSDGs: initiative.sdgIds.filter(id => socialSDGs.includes(id))
    });
  }
  
  // Check for cross-sector alignment
  const sectors = new Set();
  sdgDetails.forEach(sdg => {
    if (sdg) {
      if ([1, 2, 3, 4, 5, 8, 10, 16].includes(sdg.id)) sectors.add('social');
      if ([6, 7, 11, 12, 13, 14, 15].includes(sdg.id)) sectors.add('environmental');
      if ([8, 9, 11].includes(sdg.id)) sectors.add('economic');
      if ([16, 17].includes(sdg.id)) sectors.add('governance');
    }
  });
  
  if (sectors.size >= 3) {
    insights.push({
      category: 'opportunity',
      priority: 'high',
      title: 'Cross-Sector Alignment',
      description: `Initiative spans ${sectors.size} sectors, enabling holistic impact and diverse partnerships.`,
      actionable: true,
      suggestedActions: ['Develop cross-sector partnerships', 'Create integrated monitoring framework']
    });
  }
  
  return insights;
}

/**
 * Generate resource-based insights
 */
function generateResourceInsights(initiative: Initiative, _scores: InitiativeScores): CivicInsight[] {
  const insights: CivicInsight[] = [];
  
  const budgetPerMonth = initiative.estimatedBudget / initiative.timeline;
  const staffPerMonth = initiative.requiredStaff / initiative.timeline;
  
  if (budgetPerMonth > 100000) {
    insights.push({
      category: 'warning',
      priority: 'medium',
      title: 'High Monthly Burn Rate',
      description: 'Monthly budget requirements are significant, requiring careful financial management.',
      actionable: true,
      suggestedActions: ['Implement strict budget controls', 'Phase spending', 'Secure multi-year funding']
    });
  }
  
  if (initiative.timeline > 36) {
    insights.push({
      category: 'warning',
      priority: 'low',
      title: 'Extended Timeline',
      description: 'Long implementation timeline increases risk of changing circumstances.',
      actionable: true,
      suggestedActions: ['Set clear milestones', 'Build in review points', 'Maintain flexibility']
    });
  }
  
  if (staffPerMonth > 10) {
    insights.push({
      category: 'recommendation',
      priority: 'low',
      title: 'Staffing Considerations',
      description: 'Significant staffing requirements need careful planning and coordination.',
      actionable: true,
      suggestedActions: ['Develop staffing plan', 'Consider outsourcing options', 'Build team gradually']
    });
  }
  
  return insights;
}

/**
 * Generate risk-based insights
 */
function generateRiskInsights(initiative: Initiative): CivicInsight[] {
  const insights: CivicInsight[] = [];
  
  const highRisks = initiative.risks.filter(r => r.probability > 0.7 && r.impact > 0.7);
  
  if (highRisks.length > 0) {
    insights.push({
      category: 'risk',
      priority: 'high',
      title: 'High-Impact Risks Identified',
      description: `${highRisks.length} risk(s) with high probability and impact require immediate attention.`,
      actionable: true,
      suggestedActions: highRisks.map(r => r.mitigationStrategy || 'Develop mitigation strategy')
    });
  }
  
  const unmitigatedRisks = initiative.risks.filter(r => !r.mitigationStrategy);
  if (unmitigatedRisks.length > 0) {
    insights.push({
      category: 'recommendation',
      priority: 'medium',
      title: 'Unmitigated Risks',
      description: `${unmitigatedRisks.length} risk(s) lack mitigation strategies.`,
      actionable: true,
      suggestedActions: ['Develop mitigation plans for all identified risks']
    });
  }
  
  return insights;
}

/**
 * Generate dependency-based insights
 */
function generateDependencyInsights(initiative: Initiative): CivicInsight[] {
  const insights: CivicInsight[] = [];
  
  const blockingDeps = initiative.dependencies.filter(d => d.blocking);
  
  if (blockingDeps.length > 0) {
    insights.push({
      category: 'risk',
      priority: 'high',
      title: 'Blocking Dependencies',
      description: `${blockingDeps.length} dependenc(ies) will block initiative progress until resolved.`,
      actionable: true,
      suggestedActions: ['Prioritize resolving blocking dependencies', 'Develop parallel work streams where possible']
    });
  }
  
  const highSeverityDeps = initiative.dependencies.filter(d => d.severity === 'high');
  if (highSeverityDeps.length >= 2) {
    insights.push({
      category: 'warning',
      priority: 'medium',
      title: 'Multiple High-Severity Dependencies',
      description: 'Multiple high-severity dependencies increase implementation complexity.',
      actionable: true,
      suggestedActions: ['Create dependency resolution plan', 'Allocate dedicated resources']
    });
  }
  
  return insights;
}

/**
 * Generate insight summary
 */
function generateInsightSummary(insights: CivicInsight[], scores: InitiativeScores): string {
  const opportunityCount = insights.filter(i => i.category === 'opportunity').length;
  const riskCount = insights.filter(i => i.category === 'risk').length;
  const warningCount = insights.filter(i => i.category === 'warning').length;
  
  let summary = `Analysis generated ${insights.length} insights: `;
  summary += `${opportunityCount} opportunity(ies), ${riskCount} risk(s), ${warningCount} warning(s). `;
  
  if (scores.overall >= 70) {
    summary += 'Overall initiative profile is strong with favorable conditions for success.';
  } else if (scores.overall >= 50) {
    summary += 'Initiative shows moderate potential with some areas requiring attention.';
  } else {
    summary += 'Initiative faces significant challenges requiring substantial revision.';
  }
  
  return summary;
}

/**
 * Generate overall recommendation
 */
function generateOverallRecommendation(insights: CivicInsight[], scores: InitiativeScores): string {
  const criticalCount = insights.filter(i => i.priority === 'critical').length;
  const highRiskCount = insights.filter(i => i.category === 'risk' && i.priority === 'high').length;
  
  if (criticalCount > 0) {
    return 'CRITICAL: Address critical issues before proceeding. Initiative success is at significant risk without immediate intervention.';
  } else if (highRiskCount > 2) {
    return 'CAUTION: Multiple high-priority risks require attention. Consider revising approach before implementation.';
  } else if (scores.overall >= 70) {
    return 'PROCEED: Initiative shows strong potential. Address identified recommendations and proceed with implementation.';
  } else if (scores.overall >= 50) {
    return 'CONDITIONAL: Initiative has moderate potential. Address key concerns before full-scale implementation.';
  } else {
    return 'REVIEW: Initiative requires significant revision. Major concerns across multiple dimensions need resolution.';
  }
}
