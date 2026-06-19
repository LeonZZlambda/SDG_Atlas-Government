/**
 * Graph Building Utilities
 * Builds graphs for dashboard visualizations
 */

import { getCoefficient, SDG_METADATA } from './projectGenerator';
import { calculateDegreeCentrality, calculateBetweennessCentrality, type Graph } from './graphAlgorithms';
import { SYSTEMIC_INFLUENCE_WEIGHTS } from '../constants/engineWeights';

export interface SystemicInfluenceResult {
  rawInfluence: Record<number, number>;
  normalizedInfluence: Record<number, number>;
  maxInfluence: number;
}

/**
 * Build a full graph of all SDGs (1-17)
 * @returns Graph with all SDGs and their relationships
 */
export function buildFullSDGGraph(): Graph {
  const allSDGIds = Array.from({ length: 17 }, (_, i) => i + 1);
  const fullGraph: Graph = {
    nodes: allSDGIds.map(id => ({ id, label: `ODS ${id}` })),
    edges: [],
  };
  
  for (let i = 0; i < allSDGIds.length; i++) {
    for (let j = i + 1; j < allSDGIds.length; j++) {
      const coeff = getCoefficient(allSDGIds[i], allSDGIds[j]);
      if (Math.abs(coeff) > 0.1) {
        fullGraph.edges.push({ from: allSDGIds[i], to: allSDGIds[j], weight: coeff });
      }
    }
  }
  
  return fullGraph;
}

/**
 * Build a graph from selected SDGs
 * @param selectedSDGs - Array of selected SDG IDs
 * @returns Graph with selected SDGs and their relationships
 */
export function buildGraphFromSDGs(selectedSDGs: number[]): Graph {
  const graph: Graph = {
    nodes: selectedSDGs.map(id => ({
      id,
      label: SDG_METADATA.find(s => s.id === id)?.name.pt || `ODS ${id}`,
    })),
    edges: [],
  };
  
  for (let i = 0; i < selectedSDGs.length; i++) {
    for (let j = i + 1; j < selectedSDGs.length; j++) {
      const coeff = getCoefficient(selectedSDGs[i], selectedSDGs[j]);
      if (Math.abs(coeff) > 0.1) {
        graph.edges.push({ from: selectedSDGs[i], to: selectedSDGs[j], weight: coeff });
      }
    }
  }
  
  return graph;
}

/**
 * Calculate systemic influence scores for all SDGs
 * Formula: 0.4*deg + 0.3*btw + 0.3*positiveInfluence, normalized 0..1
 * @param graph - The graph to analyze
 * @returns Systemic influence scores
 */
export function calculateSystemicInfluence(graph: Graph): SystemicInfluenceResult {
  const fullDeg = calculateDegreeCentrality(graph);
  const fullBtw = calculateBetweennessCentrality(graph);
  const allSDGIds = graph.nodes.map(n => n.id);

  const rawInfluence: Record<number, number> = {};
  allSDGIds.forEach(id => {
    const degree = fullDeg.get(id) ?? 0;
    const betweenness = fullBtw.get(id) ?? 0;
    const maxBetweenness = Math.max(...Array.from(fullBtw.values()), 0.001);
    const normalizedBetweenness = betweenness / maxBetweenness;
    
    // Calculate positive influence for this SDG
    const positiveEdges = graph.edges.filter(e => 
      (e.from === id || e.to === id) && e.weight > 0
    ).length;
    const totalEdges = graph.edges.filter(e => e.from === id || e.to === id).length;
    const positiveInfluence = totalEdges > 0 ? positiveEdges / totalEdges : 0;
    
    rawInfluence[id] = SYSTEMIC_INFLUENCE_WEIGHTS.DEGREE * degree + 
                      SYSTEMIC_INFLUENCE_WEIGHTS.BETWEENNESS * normalizedBetweenness + 
                      SYSTEMIC_INFLUENCE_WEIGHTS.POSITIVE_INFLUENCE * positiveInfluence;
  });
  
  const maxInf = Math.max(...Object.values(rawInfluence), 0.001);
  const normalizedInfluence: Record<number, number> = {};
  allSDGIds.forEach(id => { normalizedInfluence[id] = rawInfluence[id] / maxInf; });

  return {
    rawInfluence,
    normalizedInfluence,
    maxInfluence: maxInf
  };
}

/**
 * Calculate systemic influence score for a single SDG
 * Formula: 0.4*deg + 0.3*btw + 0.3*positiveInfluence
 * @param sdgId - The SDG ID to calculate influence for
 * @param degCentrality - Degree centrality map
 * @param betweennessCentrality - Betweenness centrality map
 * @param graph - The graph to analyze
 * @returns Systemic influence score
 */
export function calculateSingleSystemicInfluence(
  sdgId: number,
  degCentrality: Map<number, number> | null,
  betweennessCentrality: Map<number, number> | null,
  graph: Graph
): number {
  if (!degCentrality || !betweennessCentrality || !graph) return 0;
  
  const degree = degCentrality.get(sdgId) || 0;
  const betweenness = betweennessCentrality.get(sdgId) || 0;
  
  // Calculate positive influence for this SDG
  const positiveEdges = graph.edges.filter(e => 
    (e.from === sdgId || e.to === sdgId) && e.weight > 0
  ).length;
  const totalEdges = graph.edges.filter(e => e.from === sdgId || e.to === sdgId).length;
  const positiveInfluence = totalEdges > 0 ? positiveEdges / totalEdges : 0;
  
  // Normalize betweenness (typically 0-1 range)
  const maxBetweenness = Math.max(...Array.from(betweennessCentrality.values()), 0.001);
  const normalizedBetweenness = betweenness / maxBetweenness;
  
  // Combined score
  const systemicInfluence = SYSTEMIC_INFLUENCE_WEIGHTS.DEGREE * degree + 
                        SYSTEMIC_INFLUENCE_WEIGHTS.BETWEENNESS * normalizedBetweenness + 
                        SYSTEMIC_INFLUENCE_WEIGHTS.POSITIVE_INFLUENCE * positiveInfluence;
  
  return systemicInfluence;
}

/**
 * Get active SDGs sorted by systemic influence
 * @param odsCounts - Record of ODS occurrence counts
 * @param influence - Normalized influence scores
 * @returns Sorted array of active SDGs with their influence
 */
export function getActiveSDGsSortedByInfluence(
  odsCounts: Record<number, number>,
  influence: Record<number, number>
): Array<{ id: number; count: number; influence: number }> {
  const allSDGIds = Array.from({ length: 17 }, (_, i) => i + 1);
  
  return allSDGIds
    .filter(id => odsCounts[id] > 0)
    .map(id => ({
      id,
      count: odsCounts[id],
      influence: influence[id] || 0
    }))
    .sort((a, b) => b.influence - a.influence);
}
