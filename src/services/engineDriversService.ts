import type { Graph } from '../utils/graphAlgorithms';
import { calculateDegreeCentrality, calculateBetweennessCentrality } from '../utils/graphAlgorithms';
import type { GeneratedProjectData } from '../types/project';

export interface Drivers {
  positive: string[];
  negative: string[];
}

/**
 * Engine Drivers Service
 * Extracts business logic for generating positive/negative drivers for each engine
 */
export class EngineDriversService {
  private project: GeneratedProjectData | null;
  private selectedSDGs: number[];
  private graphStats: any;
  private graph: Graph;

  constructor(
    project: GeneratedProjectData | null,
    selectedSDGs: number[],
    graphStats: any,
    graph: Graph
  ) {
    this.project = project;
    this.selectedSDGs = selectedSDGs;
    this.graphStats = graphStats;
    this.graph = graph;
  }

  /**
   * Calculate systemic influence for a specific SDG
   */
  private calculateSystemicInfluence(sdgId: number): number {
    const degCentrality = calculateDegreeCentrality(this.graph);
    const btwCentrality = calculateBetweennessCentrality(this.graph);
    
    const degree = degCentrality.get(sdgId) || 0;
    const betweenness = btwCentrality.get(sdgId) || 0;
    
    const positiveEdgesCount = this.graph.edges.filter(
      (e: any) => (e.from === sdgId || e.to === sdgId) && e.weight > 0
    ).length;
    const totalEdgesCount = this.graph.edges.filter(
      (e: any) => e.from === sdgId || e.to === sdgId
    ).length;
    const positiveInfluence = totalEdgesCount > 0 ? positiveEdgesCount / totalEdgesCount : 0;

    return 0.4 * degree + 0.3 * betweenness + 0.3 * positiveInfluence;
  }

  /**
   * Generate drivers for a specific engine
   */
  generateDrivers(engineId: string): Drivers {
    const positive: string[] = [];
    const negative: string[] = [];
    
    if (this.selectedSDGs.length === 0) return { positive, negative };

    const positiveEdges = this.graph.edges.filter((e: any) => e.weight > 0).length;
    const negativeEdges = this.graph.edges.filter((e: any) => e.weight < 0).length;
    const degCentrality = calculateDegreeCentrality(this.graph);
    const sbi = this.project?.synergyBalanceIndex || 0;
    
    switch (engineId) {
      case 'graph':
        this.generateGraphDrivers(positive, negative, positiveEdges, negativeEdges, degCentrality);
        break;
        
      case 'mcda':
        this.generateMCDADrivers(positive, negative, sbi);
        break;
        
      case 'impact':
        this.generateImpactDrivers(positive, negative, positiveEdges, sbi);
        break;
        
      case 'sustainability':
        this.generateSustainabilityDrivers(positive, negative, sbi);
        break;
        
      case 'feasibility':
        this.generateFeasibilityDrivers(positive, negative);
        break;
        
      case 'generator':
        this.generateGeneratorDrivers(positive, negative);
        break;
    }
    
    return { positive, negative };
  }

  private generateGraphDrivers(
    positive: string[],
    negative: string[],
    positiveEdges: number,
    negativeEdges: number,
    degCentrality: Map<number, number>
  ) {
    if (this.graphStats?.density && this.graphStats.density > 0.5) {
      positive.push(`Alta densidade de rede (${(this.graphStats.density * 100).toFixed(0)}%)`);
    }
    if (positiveEdges > this.graph.edges.length * 0.7) {
      positive.push('Fortes conexões sinérgicas entre ODS');
    }
    if (degCentrality.size > 0) {
      const avgDeg = Array.from(degCentrality.values()).reduce((a, b) => a + b, 0) / degCentrality.size;
      if (avgDeg > 0.5) {
        positive.push('Alta centralidade média dos nós');
      }
    }
    if (this.selectedSDGs.length < 4) {
      negative.push('Tamanho limitado da rede');
    }
    if (negativeEdges > 0) {
      negative.push(`${negativeEdges} trade-off${negativeEdges > 1 ? 's' : ''} detectado${negativeEdges > 1 ? 's' : ''}`);
    }
    if (this.graphStats?.averageClusteringCoefficient && this.graphStats.averageClusteringCoefficient < 0.3) {
      negative.push('Baixo coeficiente de agrupamento');
    }
  }

  private generateMCDADrivers(positive: string[], negative: string[], sbi: number) {
    if (sbi > 0.6) {
      positive.push('Alto índice de sinergia (SBI)');
    }
    if (this.selectedSDGs.length >= 4 && this.selectedSDGs.length <= 7) {
      positive.push('Amplitude ideal de metas');
    }
    if (this.project && this.project.tradeoffs.length === 0) {
      positive.push('Zero trade-offs detectados');
    }
    if (this.selectedSDGs.length < 3) {
      negative.push('Baixa amplitude de metas');
    }
    if (sbi < 0) {
      negative.push('Predominância de trade-offs');
    }
    if (this.selectedSDGs.length > 10) {
      negative.push('Alta complexidade de coordenação');
    }
  }

  private generateImpactDrivers(positive: string[], negative: string[], positiveEdges: number, sbi: number) {
    if (this.project && this.project.overallImpactScore >= 70) {
      positive.push('Alto score de impacto sistêmico');
    }
    if (positiveEdges > 0) {
      positive.push(`+${positiveEdges} conexões de influência positiva`);
    }
    if (sbi > 0.5) {
      positive.push('Forte multiplicador de sinergia');
    }
    
    // Add dominant SDG driver based on Systemic Influence Score
    const degCentrality = calculateDegreeCentrality(this.graph);
    const betweennessCentrality = calculateBetweennessCentrality(this.graph);
    
    if (degCentrality && betweennessCentrality) {
      const systemicInfluences = this.selectedSDGs.map(id => ({
        id,
        score: this.calculateSystemicInfluence(id)
      }));
      const maxInfluence = systemicInfluences.reduce((a, b) => a.score > b.score ? a : b);
      if (maxInfluence.score > 0.3) {
        positive.push(`ODS ${maxInfluence.id} domina influência sistêmica`);
      }
    }
    
    if (this.project && this.project.tradeoffs.length > 0) {
      negative.push(`${this.project.tradeoffs.length} conflito${this.project.tradeoffs.length > 1 ? 's' : ''} reduzindo impacto`);
    }
    if (this.project && this.project.overallImpactScore < 40) {
      negative.push('Baixo score de impacto sistêmico');
    }
  }

  private generateSustainabilityDrivers(positive: string[], negative: string[], sbi: number) {
    if (this.project && this.project.sustainabilityIndex >= 70) {
      positive.push('Alto índice de sustentabilidade');
    }
    if (sbi > 0.5) {
      positive.push('Rede sinérgica sustentável');
    }
    if (this.project && this.project.feasibility >= 70) {
      positive.push('Alta viabilidade de implementação');
    }
    if (sbi < 0) {
      negative.push('Trade-offs sistêmicos prejudicam sustentabilidade');
    }
    if (this.project && this.project.sustainabilityIndex < 40) {
      negative.push('Baixo índice de sustentabilidade');
    }
  }

  private generateFeasibilityDrivers(positive: string[], negative: string[]) {
    if (this.project && this.project.feasibility >= 75) {
      positive.push('Alta viabilidade de implementação');
    }
    if (this.project && this.project.feasibilityBreakdown?.resourceCapacity && this.project.feasibilityBreakdown.resourceCapacity >= 70) {
      positive.push('Capacidade de recursos adequada');
    }
    if (this.project && this.project.feasibilityBreakdown?.implementationSimplicity && this.project.feasibilityBreakdown.implementationSimplicity >= 70) {
      positive.push('Simplicidade de implementação');
    }
    if (this.project && this.project.tradeoffs.length > 2) {
      negative.push('Múltiplos trade-offs reduzem viabilidade');
    }
    if (this.project && this.project.feasibility < 40) {
      negative.push('Baixa viabilidade de implementação');
    }
  }

  private generateGeneratorDrivers(positive: string[], negative: string[]) {
    if (this.selectedSDGs.length >= 3 && this.selectedSDGs.length <= 5) {
      positive.push('Amplitude otimizada de ODS');
    }
    if (this.project && this.project.synergyBalanceIndex > 0.5) {
      positive.push('Equilíbrio positivo de sinergias');
    }
    if (this.selectedSDGs.length > 10) {
      negative.push('Alta amplitude de ODS aumenta complexidade');
    }
    if (this.project && this.project.synergyBalanceIndex < 0) {
      negative.push('Desequilíbrio de sinergias');
    }
  }
}
