import { getCoefficient } from './projectGenerator';
import i18n from '../i18n';

/**
 * SDG Analytical Metadata Generator
 * Generates analytical metadata for SDG cards including complexity, systemic impact, dependencies, and synergies
 */

export interface SDGAnalyticalMetadata {
  complexity: 'low' | 'medium' | 'high';
  systemicImpact: 'low' | 'medium' | 'high';
  institutionalDependency: 'low' | 'medium' | 'high';
  strongSynergies: number[];
}

/**
 * Generate analytical metadata for an SDG
 */
export function generateSDGMetadata(sdgId: number): SDGAnalyticalMetadata {
  const complexity = calculateComplexity(sdgId);
  const systemicImpact = calculateSystemicImpact(sdgId);
  const institutionalDependency = calculateInstitutionalDependency(sdgId);
  const strongSynergies = calculateStrongSynergies(sdgId);
  
  return {
    complexity,
    systemicImpact,
    institutionalDependency,
    strongSynergies
  };
}

/**
 * Calculate complexity based on SDG characteristics
 */
function calculateComplexity(sdgId: number): 'low' | 'medium' | 'high' {
  // SDGs with high implementation complexity
  const highComplexity = [7, 9, 11, 13, 14, 15]; // Energy, Industry, Cities, Climate, Life Below Water, Life on Land
  // SDGs with medium complexity
  const mediumComplexity = [2, 3, 4, 6, 8, 10, 12]; // Hunger, Health, Education, Water, Work, Inequality, Consumption
  // SDGs with lower complexity
  // const lowComplexity = [1, 5, 16, 17]; // Poverty, Gender, Peace, Partnerships
  
  if (highComplexity.includes(sdgId)) return 'high';
  if (mediumComplexity.includes(sdgId)) return 'medium';
  return 'low';
}

/**
 * Calculate systemic impact based on SDG influence
 */
function calculateSystemicImpact(sdgId: number): 'low' | 'medium' | 'high' {
  // SDGs with high systemic impact (cross-cutting goals)
  const highImpact = [1, 5, 8, 13, 17]; // Poverty, Gender, Work, Climate, Partnerships
  // SDGs with medium systemic impact
  const mediumImpact = [2, 3, 4, 6, 7, 9, 10, 11, 12]; // Hunger, Health, Education, Water, Energy, Industry, Inequality, Cities, Consumption
  // SDGs with lower systemic impact
  // const lowImpact = [14, 15, 16]; // Life Below Water, Life on Land, Peace
  
  if (highImpact.includes(sdgId)) return 'high';
  if (mediumImpact.includes(sdgId)) return 'medium';
  return 'low';
}

/**
 * Calculate institutional dependency based on governance requirements
 */
function calculateInstitutionalDependency(sdgId: number): 'low' | 'medium' | 'high' {
  // SDGs requiring high institutional coordination
  const highDependency = [11, 13, 14, 15, 16, 17]; // Cities, Climate, Water, Land, Peace, Partnerships
  // SDGs with medium institutional requirements
  const mediumDependency = [2, 3, 4, 6, 7, 8, 9, 10, 12]; // Hunger, Health, Education, Water, Energy, Work, Industry, Inequality, Consumption
  // SDGs with lower institutional requirements
  // const lowDependency = [1, 5]; // Poverty, Gender
  
  if (highDependency.includes(sdgId)) return 'high';
  if (mediumDependency.includes(sdgId)) return 'medium';
  return 'low';
}

/**
 * Calculate strong synergies with other SDGs
 */
function calculateStrongSynergies(sdgId: number): number[] {
  const synergies: number[] = [];
  
  // Check all other SDGs for strong synergies (coefficient > 0.5)
  for (let otherId = 1; otherId <= 17; otherId++) {
    if (otherId === sdgId) continue;
    
    const coefficient = getCoefficient(sdgId, otherId);
    if (coefficient > 0.5) {
      synergies.push(otherId);
    }
  }
  
  return synergies;
}

/**
 * Generate live systemic insights for selected SDGs
 */
export function generateSystemicInsights(selectedSDGs: number[]): SystemicInsight[] {
  const insights: SystemicInsight[] = [];
  
  if (selectedSDGs.length === 0) return insights;
  
  // Analyze synergies
  const synergyAnalysis = analyzeSynergies(selectedSDGs);
  if (synergyAnalysis) insights.push(synergyAnalysis);
  
  // Analyze dependencies
  const dependencyAnalysis = analyzeDependencies(selectedSDGs);
  if (dependencyAnalysis) insights.push(dependencyAnalysis);
  
  // Analyze thematic diversity
  const diversityAnalysis = analyzeThematicDiversity(selectedSDGs);
  if (diversityAnalysis) insights.push(diversityAnalysis);
  
  // Analyze complexity
  const complexityAnalysis = analyzeComplexity(selectedSDGs);
  if (complexityAnalysis) insights.push(complexityAnalysis);
  
  return insights;
}

export interface SystemicInsight {
  type: 'synergy' | 'dependency' | 'diversity' | 'complexity';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  affectedSDGs: number[];
}

/**
 * Analyze synergies between selected SDGs
 */
function analyzeSynergies(selectedSDGs: number[]): SystemicInsight | null {
  let strongSynergyCount = 0;
  let conflictCount = 0;
  
  for (let i = 0; i < selectedSDGs.length; i++) {
    for (let j = i + 1; j < selectedSDGs.length; j++) {
      const coeff = getCoefficient(selectedSDGs[i], selectedSDGs[j]);
      if (coeff > 0.5) strongSynergyCount++;
      if (coeff < 0) conflictCount++;
    }
  }
  
  if (strongSynergyCount > 0) {
    return {
      type: 'synergy',
      severity: strongSynergyCount > 3 ? 'high' : 'medium',
      title: i18n.t('sdg_strong_synergies'),
      description: `${strongSynergyCount} ${i18n.t('sdg_strong_synergies_desc')}`,
      affectedSDGs: selectedSDGs
    };
  }
  
  if (conflictCount > 0) {
    return {
      type: 'synergy',
      severity: 'high',
      title: i18n.t('sdg_conflicts_detected'),
      description: `${conflictCount} ${i18n.t('sdg_conflicts_detected_desc')}`,
      affectedSDGs: selectedSDGs
    };
  }
  
  return null;
}

/**
 * Analyze institutional dependencies
 */
function analyzeDependencies(selectedSDGs: number[]): SystemicInsight | null {
  const highDependencySDGs = selectedSDGs.filter(id => calculateInstitutionalDependency(id) === 'high');
  
  if (highDependencySDGs.length >= 2) {
    return {
      type: 'dependency',
      severity: 'high',
      title: i18n.t('sdg_high_dependency'),
      description: `${highDependencySDGs.length} ${i18n.t('sdg_high_dependency_desc')}`,
      affectedSDGs: highDependencySDGs
    };
  }
  
  if (highDependencySDGs.length === 1) {
    return {
      type: 'dependency',
      severity: 'medium',
      title: i18n.t('sdg_moderate_dependency'),
      description: i18n.t('sdg_moderate_dependency_desc'),
      affectedSDGs: highDependencySDGs
    };
  }
  
  return null;
}

/**
 * Analyze thematic diversity
 */
function analyzeThematicDiversity(selectedSDGs: number[]): SystemicInsight | null {
  const categories = new Set<string>();
  
  selectedSDGs.forEach(sdgId => {
    if ([1, 2, 3, 4, 5, 8, 10, 16].includes(sdgId)) categories.add('social');
    if ([6, 7, 11, 12, 13, 14, 15].includes(sdgId)) categories.add('environmental');
    if ([8, 9, 11].includes(sdgId)) categories.add('economic');
    if ([16, 17].includes(sdgId)) categories.add('governance');
  });
  
  if (categories.size >= 3) {
    const categoriesTranslated = Array.from(categories).map(cat => i18n.t(`sdg_category_${cat}`)).join(', ');
    return {
      type: 'diversity',
      severity: 'medium',
      title: i18n.t('sdg_high_diversity'),
      description: `${categories.size} ${i18n.t('sdg_high_diversity_desc')} (${categoriesTranslated})`,
      affectedSDGs: selectedSDGs
    };
  }
  
  if (categories.size === 1) {
    const categoryName = Array.from(categories)[0];
    const categoryTranslated = i18n.t(`sdg_category_${categoryName}`);
    return {
      type: 'diversity',
      severity: 'low',
      title: i18n.t('sdg_focused_theme'),
      description: `${i18n.t('sdg_focused_theme_prefix')} ${categoryTranslated}${i18n.t('sdg_focused_theme_suffix')}`,
      affectedSDGs: selectedSDGs
    };
  }
  
  return null;
}

/**
 * Analyze overall complexity
 */
function analyzeComplexity(selectedSDGs: number[]): SystemicInsight | null {
  const highComplexitySDGs = selectedSDGs.filter(id => calculateComplexity(id) === 'high');
  const complexityRatio = highComplexitySDGs.length / selectedSDGs.length;
  
  if (complexityRatio > 0.5) {
    return {
      type: 'complexity',
      severity: 'high',
      title: i18n.t('sdg_high_complexity'),
      description: `${highComplexitySDGs.length} de ${selectedSDGs.length} ${i18n.t('sdg_high_complexity_desc')}`,
      affectedSDGs: highComplexitySDGs
    };
  }
  
  if (complexityRatio > 0.3) {
    return {
      type: 'complexity',
      severity: 'medium',
      title: i18n.t('sdg_moderate_complexity'),
      description: `${highComplexitySDGs.length} ${i18n.t('sdg_moderate_complexity_desc')}`,
      affectedSDGs: highComplexitySDGs
    };
  }
  
  return null;
}
