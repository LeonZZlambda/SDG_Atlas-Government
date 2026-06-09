import type { Initiative, InitiativeScores, Tradeoff, TradeoffAnalysis } from '../types/initiative';
import { getCoefficient } from './projectGenerator';

/**
 * Tradeoff Analysis Engine
 * Analyzes conflicts and synergies between initiatives and SDGs
 */

/**
 * Analyze tradeoffs between SDGs within an initiative
 */
export function analyzeSDGTradeoffs(initiative: Initiative): Tradeoff[] {
  const tradeoffs: Tradeoff[] = [];
  const sdgIds = initiative.sdgIds;
  
  for (let i = 0; i < sdgIds.length; i++) {
    for (let j = i + 1; j < sdgIds.length; j++) {
      const coeff = getCoefficient(sdgIds[i], sdgIds[j]);
      
      let type: 'conflict' | 'synergy' | 'neutral';
      let severity: 'low' | 'medium' | 'high';
      
      if (coeff < 0) {
        type = 'conflict';
        severity = coeff < -0.3 ? 'high' : coeff < -0.15 ? 'medium' : 'low';
      } else if (coeff > 0.5) {
        type = 'synergy';
        severity = coeff > 0.7 ? 'high' : coeff > 0.6 ? 'medium' : 'low';
      } else {
        type = 'neutral';
        severity = 'low';
      }
      
      tradeoffs.push({
        type,
        severity,
        description: `${type === 'conflict' ? 'Conflict' : type === 'synergy' ? 'Synergy' : 'Neutral relationship'} between SDG ${sdgIds[i]} and SDG ${sdgIds[j]}`,
        affectedSDGs: [sdgIds[i], sdgIds[j]],
        affectedInitiatives: [initiative.id],
        recommendation: generateTradeoffRecommendation(type, severity, sdgIds[i], sdgIds[j]),
        coefficient: coeff
      });
    }
  }
  
  return tradeoffs;
}

/**
 * Analyze tradeoffs between multiple initiatives
 */
export function analyzeInitiativeTradeoffs(initiatives: Initiative[]): TradeoffAnalysis {
  const allTradeoffs: Tradeoff[] = [];
  let netSynergy = 0;
  
  // Analyze SDG tradeoffs within each initiative
  initiatives.forEach(initiative => {
    const initiativeTradeoffs = analyzeSDGTradeoffs(initiative);
    allTradeoffs.push(...initiativeTradeoffs);
    
    // Calculate net synergy
    initiativeTradeoffs.forEach(tradeoff => {
      netSynergy += tradeoff.coefficient;
    });
  });
  
  // Analyze cross-initiative SDG overlaps
  for (let i = 0; i < initiatives.length; i++) {
    for (let j = i + 1; j < initiatives.length; j++) {
      const overlap = initiatives[i].sdgIds.filter(id => 
        initiatives[j].sdgIds.includes(id)
      );
      
      if (overlap.length > 0) {
        // Check for resource competition
        const budgetRatio = initiatives[i].estimatedBudget / initiatives[j].estimatedBudget;
        const staffRatio = initiatives[i].requiredStaff / initiatives[j].requiredStaff;
        
        if (budgetRatio > 2 || staffRatio > 2) {
          allTradeoffs.push({
            type: 'conflict',
            severity: 'medium',
            description: `Resource competition between initiatives sharing SDGs ${overlap.join(', ')}`,
            affectedSDGs: overlap,
            affectedInitiatives: [initiatives[i].id, initiatives[j].id],
            recommendation: 'Consider phasing initiatives or allocating dedicated resources',
            coefficient: -0.2
          });
          netSynergy -= 0.2;
        }
      }
    }
  }
  
  const criticalConflicts = allTradeoffs.filter(t => t.type === 'conflict' && t.severity === 'high');
  const strongSynergies = allTradeoffs.filter(t => t.type === 'synergy' && t.severity === 'high');
  
  const overallTradeoffScore = Math.min(100, Math.max(-100, netSynergy * 50));
  
  const recommendations = generateTradeoffRecommendations(allTradeoffs, criticalConflicts, strongSynergies);
  
  return {
    overallTradeoffScore,
    tradeoffs: allTradeoffs,
    criticalConflicts,
    strongSynergies,
    netSynergy,
    recommendations
  };
}

/**
 * Generate recommendation for a specific tradeoff
 */
function generateTradeoffRecommendation(
  type: 'conflict' | 'synergy' | 'neutral',
  severity: 'low' | 'medium' | 'high',
  sdg1: number,
  sdg2: number
): string {
  if (type === 'conflict') {
    if (severity === 'high') {
      return `Critical conflict between SDG ${sdg1} and SDG ${sdg2}. Consider prioritizing one or finding mitigation strategies.`;
    } else if (severity === 'medium') {
      return `Moderate conflict between SDG ${sdg1} and SDG ${sdg2}. Monitor progress and adjust as needed.`;
    } else {
      return `Minor conflict between SDG ${sdg1} and SDG ${sdg2}. May require attention during implementation.`;
    }
  } else if (type === 'synergy') {
    if (severity === 'high') {
      return `Strong synergy between SDG ${sdg1} and SDG ${sdg2}. Leverage this relationship for maximum impact.`;
    } else if (severity === 'medium') {
      return `Good synergy between SDG ${sdg1} and SDG ${sdg2}. Can be exploited for mutual benefit.`;
    } else {
      return `Mild synergy between SDG ${sdg1} and SDG ${sdg2}. Consider in planning.`;
    }
  } else {
    return `Neutral relationship between SDG ${sdg1} and SDG ${sdg2}. No significant impact expected.`;
  }
}

/**
 * Generate overall tradeoff recommendations
 */
function generateTradeoffRecommendations(
  tradeoffs: Tradeoff[],
  criticalConflicts: Tradeoff[],
  strongSynergies: Tradeoff[]
): string[] {
  const recommendations: string[] = [];
  
  if (criticalConflicts.length > 0) {
    recommendations.push(`Address ${criticalConflicts.length} critical conflict(s) before proceeding to avoid project failure.`);
  }
  
  if (strongSynergies.length > 0) {
    recommendations.push(`Leverage ${strongSynergies.length} strong synergy(ies) to maximize overall impact.`);
  }
  
  const conflictCount = tradeoffs.filter(t => t.type === 'conflict').length;
  const synergyCount = tradeoffs.filter(t => t.type === 'synergy').length;
  
  if (conflictCount > synergyCount) {
    recommendations.push('Overall strategy has more conflicts than synergies. Consider revising SDG selection.');
  } else if (synergyCount > conflictCount * 2) {
    recommendations.push('Excellent synergy profile. Proceed with confidence.');
  }
  
  return recommendations;
}

/**
 * Calculate tradeoff-adjusted score
 */
export function calculateTradeoffAdjustedScore(
  originalScore: InitiativeScores,
  tradeoffAnalysis: TradeoffAnalysis
): InitiativeScores {
  const adjustmentFactor = 1 + (tradeoffAnalysis.netSynergy * 0.1);
  
  return {
    ...originalScore,
    impact: Math.min(100, originalScore.impact * adjustmentFactor),
    overall: Math.min(100, originalScore.overall * adjustmentFactor),
    explanations: {
      ...originalScore.explanations,
      overall: `${originalScore.explanations.overall} Tradeoff analysis adjustment: ${(adjustmentFactor * 100).toFixed(0)}%.`
    }
  };
}
