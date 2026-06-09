import { getCoefficient } from './projectGenerator';

/**
 * SDG Analytical Metadata Generator
 * Generates analytical metadata for SDG cards including complexity, systemic impact, dependencies, and synergies
 */

export interface SDGAnalyticalMetadata {
  complexity: 'Baixa' | 'Média' | 'Alta';
  systemicImpact: 'Baixo' | 'Médio' | 'Elevado';
  institutionalDependency: 'Baixa' | 'Média' | 'Alta';
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
function calculateComplexity(sdgId: number): 'Baixa' | 'Média' | 'Alta' {
  // SDGs with high implementation complexity
  const highComplexity = [7, 9, 11, 13, 14, 15]; // Energy, Industry, Cities, Climate, Life Below Water, Life on Land
  // SDGs with medium complexity
  const mediumComplexity = [2, 3, 4, 6, 8, 10, 12]; // Hunger, Health, Education, Water, Work, Inequality, Consumption
  // SDGs with lower complexity
  // const lowComplexity = [1, 5, 16, 17]; // Poverty, Gender, Peace, Partnerships
  
  if (highComplexity.includes(sdgId)) return 'Alta';
  if (mediumComplexity.includes(sdgId)) return 'Média';
  return 'Baixa';
}

/**
 * Calculate systemic impact based on SDG influence
 */
function calculateSystemicImpact(sdgId: number): 'Baixo' | 'Médio' | 'Elevado' {
  // SDGs with high systemic impact (cross-cutting goals)
  const highImpact = [1, 5, 8, 13, 17]; // Poverty, Gender, Work, Climate, Partnerships
  // SDGs with medium systemic impact
  const mediumImpact = [2, 3, 4, 6, 7, 9, 10, 11, 12]; // Hunger, Health, Education, Water, Energy, Industry, Inequality, Cities, Consumption
  // SDGs with lower systemic impact
  // const lowImpact = [14, 15, 16]; // Life Below Water, Life on Land, Peace
  
  if (highImpact.includes(sdgId)) return 'Elevado';
  if (mediumImpact.includes(sdgId)) return 'Médio';
  return 'Baixo';
}

/**
 * Calculate institutional dependency based on governance requirements
 */
function calculateInstitutionalDependency(sdgId: number): 'Baixa' | 'Média' | 'Alta' {
  // SDGs requiring high institutional coordination
  const highDependency = [11, 13, 14, 15, 16, 17]; // Cities, Climate, Water, Land, Peace, Partnerships
  // SDGs with medium institutional requirements
  const mediumDependency = [2, 3, 4, 6, 7, 8, 9, 10, 12]; // Hunger, Health, Education, Water, Energy, Work, Industry, Inequality, Consumption
  // SDGs with lower institutional requirements
  // const lowDependency = [1, 5]; // Poverty, Gender
  
  if (highDependency.includes(sdgId)) return 'Alta';
  if (mediumDependency.includes(sdgId)) return 'Média';
  return 'Baixa';
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
      title: 'Sinergias Fortes Detectadas',
      description: `${strongSynergyCount} par(es) de ODS com forte sinergia identificado(s). Isso indica potencial para impacto multiplicador.`,
      affectedSDGs: selectedSDGs
    };
  }
  
  if (conflictCount > 0) {
    return {
      type: 'synergy',
      severity: 'high',
      title: 'Conflitos Potenciais Identificados',
      description: `${conflictCount} conflito(s) potencial(ais) entre ODS selecionados. Requer análise de tradeoffs.`,
      affectedSDGs: selectedSDGs
    };
  }
  
  return null;
}

/**
 * Analyze institutional dependencies
 */
function analyzeDependencies(selectedSDGs: number[]): SystemicInsight | null {
  const highDependencySDGs = selectedSDGs.filter(id => calculateInstitutionalDependency(id) === 'Alta');
  
  if (highDependencySDGs.length >= 2) {
    return {
      type: 'dependency',
      severity: 'high',
      title: 'Alta Dependência Institucional',
      description: `${highDependencySDGs.length} ODS com alta dependência institucional. Coordenação interinstitucional crítica para sucesso.`,
      affectedSDGs: highDependencySDGs
    };
  }
  
  if (highDependencySDGs.length === 1) {
    return {
      type: 'dependency',
      severity: 'medium',
      title: 'Dependência Institucional Moderada',
      description: '1 ODS com alta dependência institucional. Requer coordenação específica.',
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
    return {
      type: 'diversity',
      severity: 'medium',
      title: 'Diversidade Temática Elevada',
      description: `Abordagem ${categories.size} categorias temáticas. Aumenta complexidade operacional mas potencializa impacto holístico.`,
      affectedSDGs: selectedSDGs
    };
  }
  
  if (categories.size === 1) {
    return {
      type: 'diversity',
      severity: 'low',
      title: 'Foco Temático Concentrado',
      description: `Abordagem focada em ${Array.from(categories)[0]}. Permite especialização mas pode limitar impacto sistêmico.`,
      affectedSDGs: selectedSDGs
    };
  }
  
  return null;
}

/**
 * Analyze overall complexity
 */
function analyzeComplexity(selectedSDGs: number[]): SystemicInsight | null {
  const highComplexitySDGs = selectedSDGs.filter(id => calculateComplexity(id) === 'Alta');
  const complexityRatio = highComplexitySDGs.length / selectedSDGs.length;
  
  if (complexityRatio > 0.5) {
    return {
      type: 'complexity',
      severity: 'high',
      title: 'Complexidade Operacional Elevada',
      description: `${highComplexitySDGs.length} de ${selectedSDGs.length} ODS com alta complexidade. Requer capacidade técnica robusta.`,
      affectedSDGs: highComplexitySDGs
    };
  }
  
  if (complexityRatio > 0.3) {
    return {
      type: 'complexity',
      severity: 'medium',
      title: 'Complexidade Operacional Moderada',
      description: `${highComplexitySDGs.length} ODS com alta complexidade. Planejamento detalhado recomendado.`,
      affectedSDGs: highComplexitySDGs
    };
  }
  
  return null;
}
