import type { Initiative, InitiativeScores, ScoreBreakdown, ScoreFactor } from '../types/initiative';
import { getCoefficient } from './projectGenerator';

/**
 * Scoring Engine for Initiative Evaluation
 * Provides deterministic scoring algorithms for Impact, Sustainability, Feasibility, and SDG Alignment
 */

// Scoring weights for overall score
const SCORING_WEIGHTS = {
  impact: 0.35,
  sustainability: 0.25,
  feasibility: 0.25,
  sdgAlignment: 0.15
};

/**
 * Calculate Impact Score (0-100)
 * Based on: beneficiary reach, timeline efficiency, budget efficiency, risk-adjusted potential
 */
export function calculateImpactScore(initiative: Initiative): ScoreBreakdown {
  const factors: ScoreFactor[] = [];
  
  // Factor 1: Budget Efficiency (estimated budget vs expected impact)
  const budgetEfficiency = Math.min(100, (1000000 / initiative.estimatedBudget) * 50);
  factors.push({
    name: 'Budget Efficiency',
    value: budgetEfficiency,
    impact: budgetEfficiency > 50 ? 'positive' : budgetEfficiency > 30 ? 'neutral' : 'negative',
    description: `Budget efficiency based on cost per expected outcome`
  });
  
  // Factor 2: Timeline Efficiency (shorter timeline = higher efficiency)
  const timelineEfficiency = Math.min(100, (36 / initiative.timeline) * 50);
  factors.push({
    name: 'Timeline Efficiency',
    value: timelineEfficiency,
    impact: timelineEfficiency > 50 ? 'positive' : timelineEfficiency > 30 ? 'neutral' : 'negative',
    description: `Timeline efficiency based on project duration`
  });
  
  // Factor 3: Risk-Adjusted Potential (lower risk = higher score)
  const avgRiskProbability = initiative.risks.length > 0 
    ? initiative.risks.reduce((sum, r) => sum + r.probability, 0) / initiative.risks.length 
    : 0;
  const riskAdjustedScore = Math.max(0, 100 - (avgRiskProbability * 100));
  factors.push({
    name: 'Risk-Adjusted Potential',
    value: riskAdjustedScore,
    impact: riskAdjustedScore > 70 ? 'positive' : riskAdjustedScore > 40 ? 'neutral' : 'negative',
    description: `Risk-adjusted potential based on identified risks`
  });
  
  // Factor 4: SDG Synergy Strength (average synergy coefficient)
  let synergyStrength = 50; // default
  if (initiative.sdgIds.length > 1) {
    const synergies: number[] = [];
    for (let i = 0; i < initiative.sdgIds.length; i++) {
      for (let j = i + 1; j < initiative.sdgIds.length; j++) {
        synergies.push(Math.abs(getCoefficient(initiative.sdgIds[i], initiative.sdgIds[j])));
      }
    }
    synergyStrength = synergies.length > 0 
      ? (synergies.reduce((sum, s) => sum + s, 0) / synergies.length) * 100 
      : 50;
  }
  const synergyImpact: 'positive' | 'neutral' | 'negative' = synergyStrength > 50 ? 'positive' : synergyStrength > 30 ? 'neutral' : 'negative';
  factors.push({
    name: 'SDG Synergy Strength',
    value: synergyStrength,
    impact: synergyImpact,
    description: `Strength of synergies between selected SDGs`
  });
  
  // Calculate weighted score
  const weights = [0.3, 0.25, 0.25, 0.2];
  const score = factors.reduce((sum, factor, index) => 
    sum + (factor.value * weights[index]), 0);
  
  const normalizedScore = Math.min(100, Math.max(0, score));
  
  return {
    metric: 'Impact',
    score: normalizedScore,
    weight: SCORING_WEIGHTS.impact,
    contribution: normalizedScore * SCORING_WEIGHTS.impact,
    factors
  };
}

/**
 * Calculate Sustainability Score (0-100)
 * Based on: environmental impact, social equity, economic viability, long-term effects
 */
export function calculateSustainabilityScore(initiative: Initiative): ScoreBreakdown {
  const factors: ScoreFactor[] = [];
  
  // Factor 1: Environmental SDG Alignment
  const environmentalSDGs = [6, 7, 11, 12, 13, 14, 15];
  const envAlignment = initiative.sdgIds.filter(id => environmentalSDGs.includes(id)).length;
  const envScore = (envAlignment / Math.max(1, initiative.sdgIds.length)) * 100;
  factors.push({
    name: 'Environmental Alignment',
    value: envScore,
    impact: envScore > 50 ? 'positive' : envScore > 25 ? 'neutral' : 'negative',
    description: `Alignment with environmental SDGs`
  });
  
  // Factor 2: Social Equity SDG Alignment
  const socialSDGs = [1, 2, 3, 4, 5, 8, 10, 16];
  const socialAlignment = initiative.sdgIds.filter(id => socialSDGs.includes(id)).length;
  const socialScore = (socialAlignment / Math.max(1, initiative.sdgIds.length)) * 100;
  factors.push({
    name: 'Social Equity',
    value: socialScore,
    impact: socialScore > 50 ? 'positive' : socialScore > 25 ? 'neutral' : 'negative',
    description: `Alignment with social equity SDGs`
  });
  
  // Factor 3: Long-term Viability (based on timeline and infrastructure)
  const longTermViability = Math.min(100, (initiative.timeline / 36) * 50 + 50);
  factors.push({
    name: 'Long-term Viability',
    value: longTermViability,
    impact: longTermViability > 60 ? 'positive' : longTermViability > 40 ? 'neutral' : 'negative',
    description: `Long-term viability based on timeline and infrastructure`
  });
  
  // Factor 4: Infrastructure Sustainability
  const infraSustainability = initiative.infrastructureRequirements.length > 0 ? 70 : 50;
  factors.push({
    name: 'Infrastructure Sustainability',
    value: infraSustainability,
    impact: 'neutral',
    description: `Sustainability of infrastructure requirements`
  });
  
  // Calculate weighted score
  const weights = [0.3, 0.3, 0.25, 0.15];
  const score = factors.reduce((sum, factor, index) => 
    sum + (factor.value * weights[index]), 0);
  
  const normalizedScore = Math.min(100, Math.max(0, score));
  
  return {
    metric: 'Sustainability',
    score: normalizedScore,
    weight: SCORING_WEIGHTS.sustainability,
    contribution: normalizedScore * SCORING_WEIGHTS.sustainability,
    factors
  };
}

/**
 * Calculate Feasibility Score (0-100)
 * Based on: resource availability, dependency complexity, staff requirements, financial viability
 */
export function calculateFeasibilityScore(initiative: Initiative): ScoreBreakdown {
  const factors: ScoreFactor[] = [];
  
  // Factor 1: Dependency Complexity (fewer blocking dependencies = higher score)
  const blockingDeps = initiative.dependencies.filter(d => d.blocking).length;
  const dependencyScore = Math.max(0, 100 - (blockingDeps * 20));
  factors.push({
    name: 'Dependency Complexity',
    value: dependencyScore,
    impact: dependencyScore > 70 ? 'positive' : dependencyScore > 40 ? 'neutral' : 'negative',
    description: `Complexity based on blocking dependencies`
  });
  
  // Factor 2: Staff Availability (lower staff requirement = higher feasibility)
  const staffScore = Math.min(100, (20 / Math.max(1, initiative.requiredStaff)) * 50 + 50);
  factors.push({
    name: 'Staff Availability',
    value: staffScore,
    impact: staffScore > 60 ? 'positive' : staffScore > 40 ? 'neutral' : 'negative',
    description: `Feasibility based on staff requirements`
  });
  
  // Factor 3: Financial Viability (budget vs timeline ratio)
  const budgetPerMonth = initiative.estimatedBudget / initiative.timeline;
  const financialScore = Math.min(100, (100000 / budgetPerMonth) * 50 + 50);
  factors.push({
    name: 'Financial Viability',
    value: financialScore,
    impact: financialScore > 60 ? 'positive' : financialScore > 40 ? 'neutral' : 'negative',
    description: `Financial viability based on budget distribution`
  });
  
  // Factor 4: Infrastructure Readiness
  const infraReadiness = initiative.infrastructureRequirements.length > 0 ? 60 : 80;
  const infraImpact: 'positive' | 'neutral' | 'negative' = infraReadiness > 70 ? 'positive' : 'neutral';
  factors.push({
    name: 'Infrastructure Readiness',
    value: infraReadiness,
    impact: infraImpact,
    description: `Readiness based on infrastructure requirements`
  });
  
  // Calculate weighted score
  const weights = [0.3, 0.25, 0.25, 0.2];
  const score = factors.reduce((sum, factor, index) => 
    sum + (factor.value * weights[index]), 0);
  
  const normalizedScore = Math.min(100, Math.max(0, score));
  
  return {
    metric: 'Feasibility',
    score: normalizedScore,
    weight: SCORING_WEIGHTS.feasibility,
    contribution: normalizedScore * SCORING_WEIGHTS.feasibility,
    factors
  };
}

/**
 * Calculate SDG Alignment Score (0-100)
 * Based on: number of SDGs, synergy strength, alignment weights, coverage
 */
export function calculateSDGAlignmentScore(initiative: Initiative): ScoreBreakdown {
  const factors: ScoreFactor[] = [];
  
  // Factor 1: SDG Coverage (more SDGs = better coverage, but diminishing returns)
  const coverageScore = Math.min(100, (initiative.sdgIds.length / 17) * 100);
  factors.push({
    name: 'SDG Coverage',
    value: coverageScore,
    impact: coverageScore > 50 ? 'positive' : coverageScore > 25 ? 'neutral' : 'negative',
    description: `Coverage of SDG targets`
  });
  
  // Factor 2: Synergy Network Strength
  let synergyScore = 50;
  if (initiative.sdgIds.length > 1) {
    const synergies: number[] = [];
    for (let i = 0; i < initiative.sdgIds.length; i++) {
      for (let j = i + 1; j < initiative.sdgIds.length; j++) {
        const coeff = getCoefficient(initiative.sdgIds[i], initiative.sdgIds[j]);
        synergies.push(coeff);
      }
    }
    const avgSynergy = synergies.length > 0 
      ? synergies.reduce((sum, s) => sum + s, 0) / synergies.length 
      : 0;
    synergyScore = Math.min(100, (avgSynergy + 1) * 50);
  }
  factors.push({
    name: 'Synergy Network',
    value: synergyScore,
    impact: synergyScore > 60 ? 'positive' : synergyScore > 40 ? 'neutral' : 'negative',
    description: `Strength of synergy network between SDGs`
  });
  
  // Factor 3: Custom Alignment Weights
  const weightScore = initiative.sdgAlignmentWeights && Object.keys(initiative.sdgAlignmentWeights).length > 0 ? 80 : 60;
  factors.push({
    name: 'Strategic Alignment',
    value: weightScore,
    impact: 'neutral',
    description: `Strategic alignment based on custom weights`
  });
  
  // Calculate weighted score
  const weights = [0.4, 0.4, 0.2];
  const score = factors.reduce((sum, factor, index) => 
    sum + (factor.value * weights[index]), 0);
  
  const normalizedScore = Math.min(100, Math.max(0, score));
  
  return {
    metric: 'SDG Alignment',
    score: normalizedScore,
    weight: SCORING_WEIGHTS.sdgAlignment,
    contribution: normalizedScore * SCORING_WEIGHTS.sdgAlignment,
    factors
  };
}

/**
 * Generate explanation for a score
 */
function generateExplanation(breakdown: ScoreBreakdown): string {
  const positiveFactors = breakdown.factors.filter(f => f.impact === 'positive');
  const negativeFactors = breakdown.factors.filter(f => f.impact === 'negative');
  
  let explanation = `The ${breakdown.metric.toLowerCase()} score is ${breakdown.score.toFixed(1)}/100. `;
  
  if (positiveFactors.length > 0) {
    explanation += `Strengths include: ${positiveFactors.map(f => f.name).join(', ')}. `;
  }
  
  if (negativeFactors.length > 0) {
    explanation += `Areas for improvement: ${negativeFactors.map(f => f.name).join(', ')}. `;
  }
  
  if (breakdown.score >= 70) {
    explanation += `This indicates strong ${breakdown.metric.toLowerCase()}.`;
  } else if (breakdown.score >= 40) {
    explanation += `This indicates moderate ${breakdown.metric.toLowerCase()}.`;
  } else {
    explanation += `This indicates weak ${breakdown.metric.toLowerCase()} requiring attention.`;
  }
  
  return explanation;
}

/**
 * Calculate all scores for an initiative
 */
export function calculateInitiativeScores(initiative: Initiative): InitiativeScores {
  const impact = calculateImpactScore(initiative);
  const sustainability = calculateSustainabilityScore(initiative);
  const feasibility = calculateFeasibilityScore(initiative);
  const sdgAlignment = calculateSDGAlignmentScore(initiative);
  
  const overall = impact.contribution + sustainability.contribution + 
                  feasibility.contribution + sdgAlignment.contribution;
  
  return {
    impact: impact.score,
    sustainability: sustainability.score,
    feasibility: feasibility.score,
    sdgAlignment: sdgAlignment.score,
    overall: Math.min(100, Math.max(0, overall)),
    breakdowns: {
      impact,
      sustainability,
      feasibility,
      sdgAlignment
    },
    explanations: {
      impact: generateExplanation(impact),
      sustainability: generateExplanation(sustainability),
      feasibility: generateExplanation(feasibility),
      sdgAlignment: generateExplanation(sdgAlignment),
      overall: `Overall score is ${overall.toFixed(1)}/100, calculated as a weighted average of Impact (${impact.score.toFixed(1)}), Sustainability (${sustainability.score.toFixed(1)}), Feasibility (${feasibility.score.toFixed(1)}), and SDG Alignment (${sdgAlignment.score.toFixed(1)}).`
    }
  };
}
