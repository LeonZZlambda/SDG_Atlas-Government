/**
 * Engine Analysis Utilities
 * Business logic for generating explanations, recommendations, and insights
 */

import { calculateSingleSystemicInfluence } from './graphBuilders';
import { getCoefficient } from './projectGenerator';
import type { Recommendation, ExecutiveInsight } from '../components/EngineStatusPanel/types';
import type { ExplanationPanelData } from '../components/EngineStatusPanel/ExplanationPanel';

export interface AnalysisContext {
  hasSdgs: boolean;
  selectedSDGs: number[];
  project: any;
  inputs: any;
  degCentrality: Map<number, number> | null;
  betweennessCentrality: Map<number, number> | null;
  graph: any;
  t: (key: string, params?: any) => string;
}

/**
 * Generate Explanation Panels for metrics
 */
export function generateExplanationPanels(context: AnalysisContext): ExplanationPanelData[] {
  const { hasSdgs, project, inputs } = context;
  const panels: ExplanationPanelData[] = [];
  
  if (hasSdgs && project) {
    // Use project.generatedData for Single Source of Truth
    const impactMargin = project.monteCarloStats?.stdDevImpact || 5;
    const sustainMargin = project.monteCarloStats?.stdDevSustain || 10;
    const feasibilityMargin = project.monteCarloStats?.stdDevFeasibility || 10;

    const impactUncertainty = {
      min: Math.max(0, project.overallImpactScore - impactMargin),
      max: Math.min(100, project.overallImpactScore + impactMargin),
      margin: impactMargin
    };
    panels.push({
      metricName: 'Emergent Impact Score',
      score: project.overallImpactScore,
      maxScore: 100,
      uncertainty: impactUncertainty,
      confidence: 'high',
      interpretation: project.overallImpactScore >= 70 ? 'Alto impacto sistêmico emergente' : project.overallImpactScore >= 50 ? 'Impacto moderado' : 'Impacto limitado',
      trend: 'increasing',
      factors: project.scoreBreakdown.map((item: any) => ({
        name: item.name,
        impact: item.value,
        reason: item.isPositive ? 'Positive contributor' : 'Negative factor',
      })) || [],
    });
    
    const sustainUncertainty = {
      min: Math.max(0, project.sustainabilityIndex - sustainMargin),
      max: Math.min(100, project.sustainabilityIndex + sustainMargin),
      margin: sustainMargin
    };
    panels.push({
      metricName: 'Sustainability Score',
      score: project.sustainabilityIndex,
      maxScore: 100,
      uncertainty: sustainUncertainty,
      confidence: 'medium',
      interpretation: project.sustainabilityIndex >= 70 ? 'Alta resiliência sistêmica' : project.sustainabilityIndex >= 50 ? 'Resiliência moderada' : 'Baixa resiliência',
      trend: 'stable',
      factors: [
        { name: 'Duração do Projeto', impact: Math.round((inputs.duration / 24) * 35), reason: 'Projetos de maior duração têm maior sustentabilidade' },
        { name: 'Equilíbrio de Sinergia', impact: Math.round(project.synergyBalanceIndex * 45), reason: 'Sinergias entre ODS aumentam resiliência' },
        { name: 'Tamanho da Equipe', impact: inputs.teamSize > 5 ? 20 : 10, reason: 'Equipes maiores suportam implementação de longo prazo' },
      ],
    });
    
    const feasibilityUncertainty = {
      min: Math.max(0, (project.feasibility ?? 70) - feasibilityMargin),
      max: Math.min(100, (project.feasibility ?? 70) + feasibilityMargin),
      margin: feasibilityMargin
    };
    panels.push({
      metricName: 'Implementation Feasibility',
      score: project.feasibility ?? 70,
      maxScore: 100,
      uncertainty: feasibilityUncertainty,
      confidence: 'medium',
      interpretation: (project.feasibility ?? 70) >= 70 ? 'Alta viabilidade de implementação' : (project.feasibility ?? 70) >= 50 ? 'Viabilidade moderada' : 'Baixa viabilidade',
      trend: 'stable',
      factors: [
        { name: 'Capacidade de Recursos', impact: project.feasibilityBreakdown?.resourceCapacity ?? 70, reason: 'Orçamento e equipe vs necessidades' },
        { name: 'Simplicidade de Execução', impact: project.feasibilityBreakdown?.implementationSimplicity ?? 70, reason: 'Duração e contagem de ODS' },
        { name: 'Complexidade de Coordenação', impact: project.feasibilityBreakdown?.coordinationComplexity ?? 70, reason: 'Contagem de ODS (burden)' },
        { name: 'Conflitos Sistêmicos', impact: project.feasibilityBreakdown?.conflictPenalty ?? 100, reason: 'Dedução baseada em trade-offs negativos' }
      ],
    });
  }
  
  return panels;
}

/**
 * Generate Sensitivity Analysis
 */
export function generateSensitivityAnalysis(context: AnalysisContext): { sdgId: number; influence: number; reason: string }[] {
  const { project } = context;
  if (!project || !project.sensitivity) return [];
  return project.sensitivity.map((s: any) => ({
    sdgId: s.sdgId,
    influence: s.contribution,
    reason: s.reason
  }));
}

/**
 * Generate Strategic Recommendations
 */
export function generateStrategicRecommendations(context: AnalysisContext): { recommendations: Recommendation[]; gaps: string[] } {
  const { hasSdgs, selectedSDGs, project, t } = context;
  const recommendations: Recommendation[] = [];
  const gaps: string[] = [];
  
  if (!hasSdgs) return { recommendations, gaps };
  
  // Check for missing strategic areas
  const hasGovernance = selectedSDGs.some(id => id === 16 || id === 17);
  const hasEconomic = selectedSDGs.some(id => id === 8 || id === 9 || id === 10);
  const hasEnvironmental = selectedSDGs.some(id => id >= 6 && id <= 15);
  const hasSocial = selectedSDGs.some(id => id >= 1 && id <= 5);
  
  if (!hasGovernance) gaps.push('Governança institucional');
  if (!hasEconomic) gaps.push('Sustentabilidade econômica');
  if (!hasEnvironmental) gaps.push('Resiliência ambiental');
  if (!hasSocial) gaps.push('Inclusão social');
  
  // Generate recommendations to add SDGs
  const allSDGs = Array.from({ length: 17 }, (_, i) => i + 1);
  const availableSDGs = allSDGs.filter(id => !selectedSDGs.includes(id));
  
  availableSDGs.forEach(sdgId => {
    let potentialImpact = 0;
    let reason = '';
    
    // Calculate potential synergy with current selection
    let totalSynergy = 0;
    selectedSDGs.forEach(currentId => {
      const coeff = getCoefficient(sdgId, currentId);
      totalSynergy += coeff;
    });
    const avgSynergy = totalSynergy / selectedSDGs.length;
    
    // Governance SDGs (16, 17)
    if ((sdgId === 16 || sdgId === 17) && !hasGovernance) {
      potentialImpact = Math.round(avgSynergy * 18);
      reason = sdgId === 16 
        ? 'Fortalece capacidade de implementação e colaboração intersetorial'
        : 'Aumenta alinhamento institucional e parcerias estratégicas';
      recommendations.push({ sdgId, type: 'add', expectedImpact: potentialImpact, reason, priority: 'high' });
    }
    
    // Economic SDGs (8, 9, 10)
    if ((sdgId === 8 || sdgId === 9 || sdgId === 10) && !hasEconomic) {
      potentialImpact = Math.round(avgSynergy * 12);
      reason = sdgId === 8
        ? 'Melhora sustentabilidade econômica e criação de empregos'
        : sdgId === 9
        ? 'Aumenta capacidade de inovação e infraestrutura'
        : 'Reduz desigualdades e fortalece coesão social';
      recommendations.push({ sdgId, type: 'add', expectedImpact: potentialImpact, reason, priority: 'medium' });
    }
    
    // Environmental SDGs (6-15)
    if (sdgId >= 6 && sdgId <= 15 && !hasEnvironmental) {
      potentialImpact = Math.round(avgSynergy * 15);
      reason = 'Aumenta resiliência ambiental e sustentabilidade de longo prazo';
      if (avgSynergy > 0.5) {
        recommendations.push({ sdgId, type: 'add', expectedImpact: potentialImpact, reason, priority: 'medium' });
      }
    }
    
    // Social SDGs (1-5)
    if (sdgId >= 1 && sdgId <= 5 && !hasSocial) {
      potentialImpact = Math.round(avgSynergy * 14);
      reason = 'Fortalece base social e inclusão comunitária';
      if (avgSynergy > 0.4) {
        recommendations.push({ sdgId, type: 'add', expectedImpact: potentialImpact, reason, priority: 'medium' });
      }
    }
  });
  
  // Sort recommendations by expected impact
  recommendations.sort((a, b) => b.expectedImpact - a.expectedImpact);
  
  // Generate recommendations to remove (only if there are tradeoffs)
  if (project && project.tradeoffs.length > 0) {
    project.tradeoffs.forEach((tradeoff: string) => {
      // Extract SDG IDs from tradeoff message
      const match = tradeoff.match(/ODS (\d+)/g);
      if (match && match.length === 2) {
        const sdgA = parseInt(match[0].replace('ODS ', ''));
        const sdgB = parseInt(match[1].replace('ODS ', ''));
        
        // Recommend removing the SDG with more conflicts
        const conflictsA = selectedSDGs.filter(id => id !== sdgA && getCoefficient(sdgA, id) < 0).length;
        const conflictsB = selectedSDGs.filter(id => id !== sdgB && getCoefficient(sdgB, id) < 0).length;
        
        if (conflictsA > conflictsB && conflictsA > 1) {
          recommendations.push({
            sdgId: sdgA,
            type: 'remove',
            expectedImpact: -Math.round(conflictsA * 5),
            reason: t('engine_reduces_systemic_conflicts', { count: conflictsA }),
            priority: 'low',
          });
        } else if (conflictsB > conflictsA && conflictsB > 1) {
          recommendations.push({
            sdgId: sdgB,
            type: 'remove',
            expectedImpact: -Math.round(conflictsB * 5),
            reason: t('engine_reduces_systemic_conflicts', { count: conflictsB }),
            priority: 'low',
          });
        }
      }
    });
  }
  
  return { recommendations: recommendations.slice(0, 5), gaps };
}

/**
 * Generate Executive Insights
 */
export function generateExecutiveInsights(context: AnalysisContext): ExecutiveInsight[] {
  const { hasSdgs, selectedSDGs, project, inputs, degCentrality, betweennessCentrality, graph, t } = context;
  const insights: ExecutiveInsight[] = [];
  
  if (!hasSdgs || !project) return insights;
  
  const emergentImpact = project.overallImpactScore;
  const feasibility = Math.min(100, Math.max(0, 50 - (selectedSDGs.length * 5) + Math.max(0, 30 - (project.tradeoffs?.length || 0) * 5) + Math.round(Math.min(20, (inputs.duration / 24) * 20) + Math.min(20, (inputs.teamSize / 10) * 20))));
  
  // Key Findings - Dominant SDG Analysis using Systemic Influence Score
  if (degCentrality && betweennessCentrality) {
    const systemicInfluences = selectedSDGs.map(id => ({
      id,
      score: calculateSingleSystemicInfluence(id, degCentrality, betweennessCentrality, graph)
    }));
    const maxInfluence = systemicInfluences.reduce((a, b) => a.score > b.score ? a : b);
    if (maxInfluence.score > 0.3) {
      insights.push({
        type: 'opportunity',
        title: t('engine_dominant_driver', { id: maxInfluence.id }),
        description: t('engine_dominant_driver_desc', { score: (maxInfluence.score * 100).toFixed(1) }),
        priority: 'high',
      });
    }
  }
  
  // Network Configuration Analysis
  const positiveEdges = graph.edges.filter((e: any) => e.weight > 0).length;
  const negativeEdges = graph.edges.filter((e: any) => e.weight < 0).length;
  
  if (negativeEdges === 0 && positiveEdges > 0) {
    insights.push({
      type: 'opportunity',
      title: t('engine_optimized_config'),
      description: t('engine_optimized_config_desc'),
      priority: 'high',
    });
  }
  
  // Opportunities
  if (emergentImpact >= 70) {
    insights.push({
      type: 'opportunity',
      title: t('engine_high_impact_multiplier'),
      description: t('engine_high_impact_multiplier_desc'),
      priority: 'high',
    });
  }
  
  if (positiveEdges > selectedSDGs.length) {
    insights.push({
      type: 'opportunity',
      title: t('engine_strong_multiplier_effects'),
      description: t('engine_strong_multiplier_effects_desc'),
      priority: 'medium',
    });
  }
  
  const sbi = project.synergyBalanceIndex;
  if (sbi && sbi > 0.6) {
    insights.push({
      type: 'opportunity',
      title: t('engine_strong_synergy_coherence'),
      description: t('engine_strong_synergy_coherence_desc'),
      priority: 'high',
    });
  }
  
  // Risks
  if (project.tradeoffs.length > 2) {
    insights.push({
      type: 'risk',
      title: t('engine_high_institutional_dependency'),
      description: t('engine_high_institutional_dependency_desc'),
      priority: 'high',
    });
  }
  
  if (feasibility < 50) {
    insights.push({
      type: 'risk',
      title: t('engine_excessive_implementation_complexity'),
      description: t('engine_excessive_implementation_complexity_desc'),
      priority: 'high',
    });
  }
  
  if (selectedSDGs.length > 7) {
    insights.push({
      type: 'risk',
      title: t('engine_coordination_overload'),
      description: t('engine_coordination_overload_desc'),
      priority: 'medium',
    });
  }
  
  // Sustainability Analysis
  if (project.sustainabilityIndex < 50) {
    insights.push({
      type: 'risk',
      title: t('engine_limited_sustainability_diversity'),
      description: t('engine_limited_sustainability_diversity_desc'),
      priority: 'high',
    });
  }
  
  // Strategic Considerations
  if (selectedSDGs.length <= 3) {
    insights.push({
      type: 'consideration',
      title: t('engine_phased_implementation'),
      description: t('engine_phased_implementation_desc'),
      priority: 'medium',
    });
  }
  
  if (!selectedSDGs.some(id => id === 16 || id === 17)) {
    insights.push({
      type: 'consideration',
      title: t('engine_requires_municipal_partnerships'),
      description: t('engine_requires_municipal_partnerships_desc'),
      priority: 'high',
    });
  }
  
  if (inputs.duration < 12) {
    insights.push({
      type: 'consideration',
      title: t('engine_consider_deadline_extension'),
      description: t('engine_consider_deadline_extension_desc'),
      priority: 'low',
    });
  }
  
  return insights.slice(0, 5);
}
