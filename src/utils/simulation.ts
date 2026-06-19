/**
 * Simulation Utilities
 * Handles building graphs and calculating metrics for what-if simulations
 */

import { SDG_METADATA, getCoefficient } from './projectGenerator';
import { type Graph } from './graphAlgorithms';

/**
 * Build a graph from SDG IDs
 * @param sdgs - Array of SDG IDs
 * @param langKey - Language key for labels ('pt' | 'en' | 'es')
 * @returns Graph with nodes and edges
 */
export function buildGraphFromSDGs(sdgs: number[], langKey: 'pt' | 'en' | 'es'): Graph {
  const graph: Graph = {
    nodes: sdgs.map(id => ({
      id,
      label: SDG_METADATA.find(s => s.id === id)?.name[langKey] || `ODS ${id}`,
    })),
    edges: [],
  };
  for (let i = 0; i < sdgs.length; i++) {
    for (let j = i + 1; j < sdgs.length; j++) {
      const coeff = getCoefficient(sdgs[i], sdgs[j]);
      if (Math.abs(coeff) > 0.1) {
        graph.edges.push({ from: sdgs[i], to: sdgs[j], weight: coeff });
      }
    }
  }
  return graph;
}

/**
 * Calculate SBI (Synergy Balance Index)
 * @param graph - Graph to analyze
 * @returns SBI value
 */
export function calculateSBI(graph: Graph): number {
  if (graph.edges.length === 0) return 0;
  const sum = graph.edges.reduce((acc, edge) => acc + edge.weight, 0);
  return sum / graph.edges.length;
}

/**
 * Calculate simulated metrics based on inputs
 * @param simulatedSDGs - Simulated SDG IDs
 * @param simulatedBudget - Simulated budget
 * @param simulatedBeneficiaries - Simulated beneficiaries
 * @param simulatedDuration - Simulated duration
 * @param simulatedTeamSize - Simulated team size
 * @param riskLevel - Risk level
 * @param langKey - Language key
 * @returns Simulated metrics
 */
export function calculateSimulatedMetrics(
  simulatedSDGs: number[],
  simulatedBudget: number,
  simulatedBeneficiaries: number,
  simulatedDuration: number,
  simulatedTeamSize: number,
  riskLevel: number,
  langKey: 'pt' | 'en' | 'es'
) {
  const graph = buildGraphFromSDGs(simulatedSDGs, langKey);
  const sbi = calculateSBI(graph);
  
  // Simulated Impact Score
  const baseImpact = 40 + sbi * 35 + simulatedSDGs.length * 2.5;
  const efficiencyBonus = Math.min(20, (simulatedBudget / simulatedBeneficiaries) * 0.01 * 20);
  const riskPenalty = riskLevel * 10 + graph.edges.filter(e => e.weight < 0).length * 6;
  const simulatedImpact = Math.max(10, Math.min(100, baseImpact + efficiencyBonus - riskPenalty));
  
  // Simulated Sustainability Score
  const sustainabilityScore = (simulatedDuration / 24) * 35 + sbi * 45 + Math.min(20, simulatedTeamSize / 10 * 20);
  
  // Simulated Reach
  const reachMultiplier = 1 + sbi * 0.5;
  const simulatedReach = simulatedBeneficiaries * reachMultiplier;
  
  // Trade-offs count
  const tradeoffsCount = graph.edges.filter(e => e.weight < 0).length;

  return {
    impact: simulatedImpact,
    sustainability: sustainabilityScore,
    sbi,
    reach: simulatedReach,
    tradeoffs: tradeoffsCount,
    positiveEdges: graph.edges.filter(e => e.weight > 0).length,
    negativeEdges: graph.edges.filter(e => e.weight < 0).length,
  };
}

/**
 * Calculate original metrics for comparison
 * @param selectedOds - Selected ODS IDs
 * @param inputs - Input values
 * @param langKey - Language key
 * @returns Original metrics
 */
export function calculateOriginalMetrics(
  selectedOds: number[],
  inputs: any,
  langKey: 'pt' | 'en' | 'es'
) {
  const originalGraph = buildGraphFromSDGs(selectedOds, langKey);
  const originalSBI = calculateSBI(originalGraph);
  const originalBaseImpact = 40 + originalSBI * 35 + selectedOds.length * 2.5;
  const originalEfficiencyBonus = Math.min(20, (inputs.budget / inputs.beneficiaries) * 0.01 * 20);
  const originalRiskPenalty = (inputs.riskLevel || 0.5) * 10 + originalGraph.edges.filter(e => e.weight < 0).length * 6;
  const originalImpact = Math.max(10, Math.min(100, originalBaseImpact + originalEfficiencyBonus - originalRiskPenalty));
  const originalSustainability = (inputs.duration / 24) * 35 + originalSBI * 45 + Math.min(20, inputs.teamSize / 10 * 20);
  const originalReach = inputs.beneficiaries * (1 + originalSBI * 0.5);
  const originalTradeoffs = originalGraph.edges.filter(e => e.weight < 0).length;

  return {
    impact: originalImpact,
    sustainability: originalSustainability,
    sbi: originalSBI,
    reach: originalReach,
    tradeoffs: originalTradeoffs,
    positiveEdges: originalGraph.edges.filter(e => e.weight > 0).length,
    negativeEdges: originalGraph.edges.filter(e => e.weight < 0).length,
  };
}
