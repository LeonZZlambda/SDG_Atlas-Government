import type { Initiative, InitiativeScores } from '../types/initiative';

/**
 * Dynamic KPI Calculation Engine
 * Recalculates KPIs based on initiative parameters and scores instead of static values
 */

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

/**
 * Calculate dynamic KPIs for an initiative
 */
export function calculateDynamicKPIs(initiative: Initiative, scores: InitiativeScores): KPIDashboard {
  const kpis: KPI[] = [];
  
  // Impact KPIs
  kpis.push(...calculateImpactKPIs(initiative, scores));
  
  // Efficiency KPIs
  kpis.push(...calculateEfficiencyKPIs(initiative, scores));
  
  // Risk KPIs
  kpis.push(...calculateRiskKPIs(initiative, scores));
  
  // Sustainability KPIs
  kpis.push(...calculateSustainabilityKPIs(initiative, scores));
  
  const overallHealth = calculateOverallHealth(kpis, scores);
  const trend = calculateTrend(kpis);
  const recommendations = generateKPIRecommendations(kpis, scores);
  
  return {
    kpis,
    overallHealth,
    trend,
    recommendations
  };
}

/**
 * Calculate impact-related KPIs
 */
function calculateImpactKPIs(initiative: Initiative, _scores: InitiativeScores): KPI[] {
  const kpis: KPI[] = [];
  
  // Beneficiary Efficiency
  const beneficiaryEfficiency = initiative.estimatedBudget > 0 
    ? (1000000 / initiative.estimatedBudget) * 100 
    : 0;
  kpis.push({
    id: 'beneficiary_efficiency',
    name: 'Beneficiary Efficiency',
    value: Math.min(100, beneficiaryEfficiency),
    unit: 'score',
    target: 70,
    trend: beneficiaryEfficiency > 70 ? 'up' : beneficiaryEfficiency > 50 ? 'stable' : 'down',
    category: 'impact',
    description: 'Cost efficiency per expected beneficiary',
    calculation: '(1M / budget) * 100'
  });
  
  // Timeline Efficiency
  const timelineEfficiency = (36 / initiative.timeline) * 100;
  kpis.push({
    id: 'timeline_efficiency',
    name: 'Timeline Efficiency',
    value: Math.min(100, timelineEfficiency),
    unit: 'score',
    target: 80,
    trend: timelineEfficiency > 80 ? 'up' : timelineEfficiency > 60 ? 'stable' : 'down',
    category: 'impact',
    description: 'Efficiency based on implementation timeline',
    calculation: '(36 / timeline) * 100'
  });
  
  // SDG Coverage Index
  const sdgCoverage = (initiative.sdgIds.length / 17) * 100;
  kpis.push({
    id: 'sdg_coverage',
    name: 'SDG Coverage Index',
    value: sdgCoverage,
    unit: '%',
    target: 30,
    trend: 'stable',
    category: 'impact',
    description: 'Percentage of SDGs addressed',
    calculation: '(SDG count / 17) * 100'
  });
  
  // Impact Velocity
  const impactVelocity = _scores.impact / initiative.timeline;
  kpis.push({
    id: 'impact_velocity',
    name: 'Impact Velocity',
    value: impactVelocity,
    unit: 'points/month',
    target: 2,
    trend: impactVelocity > 2 ? 'up' : impactVelocity > 1 ? 'stable' : 'down',
    category: 'impact',
    description: 'Impact score per month of implementation',
    calculation: 'impact score / timeline'
  });
  
  return kpis;
}

/**
 * Calculate efficiency-related KPIs
 */
function calculateEfficiencyKPIs(initiative: Initiative, _scores: InitiativeScores): KPI[] {
  const kpis: KPI[] = [];
  
  // Budget Utilization Rate
  const budgetUtilization = _scores.feasibility * 0.5 + _scores.impact * 0.5;
  kpis.push({
    id: 'budget_utilization',
    name: 'Budget Utilization Rate',
    value: budgetUtilization,
    unit: '%',
    target: 75,
    trend: budgetUtilization > 75 ? 'up' : budgetUtilization > 50 ? 'stable' : 'down',
    category: 'efficiency',
    description: 'Expected efficiency of budget utilization',
    calculation: '(feasibility + impact) / 2'
  });
  
  // Staff Productivity Index
  const staffProductivity = initiative.requiredStaff > 0 
    ? (_scores.impact * 10) / initiative.requiredStaff 
    : 0;
  kpis.push({
    id: 'staff_productivity',
    name: 'Staff Productivity Index',
    value: Math.min(100, staffProductivity),
    unit: 'score',
    target: 50,
    trend: staffProductivity > 50 ? 'up' : staffProductivity > 30 ? 'stable' : 'down',
    category: 'efficiency',
    description: 'Expected productivity per staff member',
    calculation: '(impact * 10) / staff count'
  });
  
  // Resource Efficiency Score
  const resourceEfficiency = (_scores.feasibility + _scores.sustainability) / 2;
  kpis.push({
    id: 'resource_efficiency',
    name: 'Resource Efficiency Score',
    value: resourceEfficiency,
    unit: 'score',
    target: 70,
    trend: resourceEfficiency > 70 ? 'up' : resourceEfficiency > 50 ? 'stable' : 'down',
    category: 'efficiency',
    description: 'Overall efficiency of resource utilization',
    calculation: '(feasibility + sustainability) / 2'
  });
  
  return kpis;
}

/**
 * Calculate risk-related KPIs
 */
function calculateRiskKPIs(initiative: Initiative, _scores: InitiativeScores): KPI[] {
  const kpis: KPI[] = [];
  
  // Risk Exposure Index
  const avgRiskProbability = initiative.risks.length > 0 
    ? initiative.risks.reduce((sum, r) => sum + r.probability, 0) / initiative.risks.length 
    : 0;
  const riskExposure = avgRiskProbability * 100;
  kpis.push({
    id: 'risk_exposure',
    name: 'Risk Exposure Index',
    value: riskExposure,
    unit: '%',
    target: 30,
    trend: riskExposure < 30 ? 'up' : riskExposure < 50 ? 'stable' : 'down',
    category: 'risk',
    description: 'Average probability of identified risks',
    calculation: 'average risk probability * 100'
  });
  
  // Dependency Risk Score
  const blockingDeps = initiative.dependencies.filter(d => d.blocking).length;
  const dependencyRisk = Math.min(100, blockingDeps * 25);
  kpis.push({
    id: 'dependency_risk',
    name: 'Dependency Risk Score',
    value: dependencyRisk,
    unit: 'score',
    target: 25,
    trend: dependencyRisk < 25 ? 'up' : dependencyRisk < 50 ? 'stable' : 'down',
    category: 'risk',
    description: 'Risk level based on blocking dependencies',
    calculation: 'blocking dependencies * 25'
  });
  
  // Mitigation Coverage
  const mitigatedRisks = initiative.risks.filter(r => r.mitigationStrategy).length;
  const mitigationCoverage = initiative.risks.length > 0 
    ? (mitigatedRisks / initiative.risks.length) * 100 
    : 100;
  kpis.push({
    id: 'mitigation_coverage',
    name: 'Mitigation Coverage',
    value: mitigationCoverage,
    unit: '%',
    target: 80,
    trend: mitigationCoverage > 80 ? 'up' : mitigationCoverage > 60 ? 'stable' : 'down',
    category: 'risk',
    description: 'Percentage of risks with mitigation strategies',
    calculation: 'mitigated risks / total risks * 100'
  });
  
  return kpis;
}

/**
 * Calculate sustainability-related KPIs
 */
function calculateSustainabilityKPIs(initiative: Initiative, _scores: InitiativeScores): KPI[] {
  const kpis: KPI[] = [];
  
  // Long-term Viability Score
  const longTermViability = _scores.sustainability * 0.6 + _scores.feasibility * 0.4;
  kpis.push({
    id: 'long_term_viability',
    name: 'Long-term Viability Score',
    value: longTermViability,
    unit: 'score',
    target: 70,
    trend: longTermViability > 70 ? 'up' : longTermViability > 50 ? 'stable' : 'down',
    category: 'sustainability',
    description: 'Expected long-term sustainability',
    calculation: 'sustainability * 0.6 + feasibility * 0.4'
  });
  
  // Environmental Impact Index
  const environmentalSDGs = [6, 7, 11, 12, 13, 14, 15];
  const envAlignment = initiative.sdgIds.filter(id => environmentalSDGs.includes(id)).length;
  const envImpact = (envAlignment / Math.max(1, initiative.sdgIds.length)) * 100;
  kpis.push({
    id: 'environmental_impact',
    name: 'Environmental Impact Index',
    value: envImpact,
    unit: '%',
    target: 40,
    trend: 'stable',
    category: 'sustainability',
    description: 'Alignment with environmental SDGs',
    calculation: 'environmental SDGs / total SDGs * 100'
  });
  
  // Social Impact Index
  const socialSDGs = [1, 2, 3, 4, 5, 8, 10, 16];
  const socialAlignment = initiative.sdgIds.filter(id => socialSDGs.includes(id)).length;
  const socialImpact = (socialAlignment / Math.max(1, initiative.sdgIds.length)) * 100;
  kpis.push({
    id: 'social_impact',
    name: 'Social Impact Index',
    value: socialImpact,
    unit: '%',
    target: 40,
    trend: 'stable',
    category: 'sustainability',
    description: 'Alignment with social SDGs',
    calculation: 'social SDGs / total SDGs * 100'
  });
  
  return kpis;
}

/**
 * Calculate overall health score
 */
function calculateOverallHealth(kpis: KPI[], _scores: InitiativeScores): number {
  const impactKPIs = kpis.filter(k => k.category === 'impact');
  const efficiencyKPIs = kpis.filter(k => k.category === 'efficiency');
  const riskKPIs = kpis.filter(k => k.category === 'risk');
  const sustainabilityKPIs = kpis.filter(k => k.category === 'sustainability');
  
  const avgImpact = impactKPIs.length > 0 
    ? impactKPIs.reduce((sum, k) => sum + k.value, 0) / impactKPIs.length 
    : 0;
  
  const avgEfficiency = efficiencyKPIs.length > 0 
    ? efficiencyKPIs.reduce((sum, k) => sum + k.value, 0) / efficiencyKPIs.length 
    : 0;
  
  const avgRisk = riskKPIs.length > 0 
    ? riskKPIs.reduce((sum, k) => sum + k.value, 0) / riskKPIs.length 
    : 0;
  
  const avgSustainability = sustainabilityKPIs.length > 0 
    ? sustainabilityKPIs.reduce((sum, k) => sum + k.value, 0) / sustainabilityKPIs.length 
    : 0;
  
  // Risk is inverse - lower risk is better
  const adjustedRisk = 100 - avgRisk;
  
  return (avgImpact * 0.3 + avgEfficiency * 0.25 + adjustedRisk * 0.2 + avgSustainability * 0.25);
}

/**
 * Calculate overall trend
 */
function calculateTrend(kpis: KPI[]): 'improving' | 'stable' | 'declining' {
  const upTrends = kpis.filter(k => k.trend === 'up').length;
  const downTrends = kpis.filter(k => k.trend === 'down').length;
  
  if (upTrends > downTrends * 1.5) return 'improving';
  if (downTrends > upTrends * 1.5) return 'declining';
  return 'stable';
}

/**
 * Generate KPI-based recommendations
 */
function generateKPIRecommendations(kpis: KPI[], scores: InitiativeScores): string[] {
  const recommendations: string[] = [];
  
  // Use scores parameter to avoid warning
  if (scores.overall < 50) {
    recommendations.push('Overall initiative health requires attention across multiple dimensions');
  }
  
  const decliningKPIs = kpis.filter(k => k.trend === 'down');
  const belowTargetKPIs = kpis.filter(k => k.target && k.value < k.target);
  
  if (decliningKPIs.length > 0) {
    recommendations.push(`Address ${decliningKPIs.length} declining KPI(s): ${decliningKPIs.map(k => k.name).join(', ')}`);
  }
  
  if (belowTargetKPIs.length > 0) {
    recommendations.push(`Improve ${belowTargetKPIs.length} KPI(s) below target: ${belowTargetKPIs.map(k => k.name).join(', ')}`);
  }
  
  const riskKPIs = kpis.filter(k => k.category === 'risk' && k.value > 50);
  if (riskKPIs.length > 0) {
    recommendations.push('Implement risk mitigation strategies for high-risk areas');
  }
  
  return recommendations;
}
