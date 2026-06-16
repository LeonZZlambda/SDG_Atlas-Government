import { describe, it, expect } from 'vitest';
import {
  calculateDegreeCentrality,
  calculateBetweennessCentrality,
  calculateClosenessCentrality,
  calculatePageRank,
  getGraphStatistics
} from '../utils/graphAlgorithms';
import type { Graph } from '../utils/graphAlgorithms';

function createTestGraph(): Graph {
  return {
    nodes: [
      { id: 1, label: 'Node 1' },
      { id: 2, label: 'Node 2' },
      { id: 3, label: 'Node 3' },
    ],
    edges: [
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 1, to: 3, weight: 1 },
    ],
  };
}

describe('Graph Algorithms', () => {
  describe('calculateDegreeCentrality', () => {
    it('should calculate degree centrality for all nodes', () => {
      const graph = createTestGraph();
      const result = calculateDegreeCentrality(graph);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);
      expect(result.get(1)).toBeGreaterThan(0);
      expect(result.get(2)).toBeGreaterThan(0);
      expect(result.get(3)).toBeGreaterThan(0);
    });

    it('should handle empty graph', () => {
      const graph: Graph = { nodes: [], edges: [] };
      const result = calculateDegreeCentrality(graph);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should handle graph with no edges', () => {
      const graph: Graph = {
        nodes: [
          { id: 1, label: 'Node 1' },
          { id: 2, label: 'Node 2' },
        ],
        edges: [],
      };
      const result = calculateDegreeCentrality(graph);
      
      expect(result.get(1)).toBe(0);
      expect(result.get(2)).toBe(0);
    });
  });

  describe('calculateBetweennessCentrality', () => {
    it('should calculate betweenness centrality for all nodes', () => {
      const graph = createTestGraph();
      const result = calculateBetweennessCentrality(graph);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);
    });

    it('should handle empty graph', () => {
      const graph: Graph = { nodes: [], edges: [] };
      const result = calculateBetweennessCentrality(graph);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });

  describe('calculateClosenessCentrality', () => {
    it('should calculate closeness centrality for all nodes', () => {
      const graph = createTestGraph();
      const result = calculateClosenessCentrality(graph);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);
    });

    it('should handle empty graph', () => {
      const graph: Graph = { nodes: [], edges: [] };
      const result = calculateClosenessCentrality(graph);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });

  describe('calculatePageRank', () => {
    it('should calculate PageRank for all nodes', () => {
      const graph = createTestGraph();
      const result = calculatePageRank(graph);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);
      
      // PageRank values should be positive
      Array.from(result.values()).forEach(value => {
        expect(value).toBeGreaterThan(0);
      });
    });

    it('should handle empty graph', () => {
      const graph: Graph = { nodes: [], edges: [] };
      const result = calculatePageRank(graph);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });


  describe('getGraphStatistics', () => {
    it('should return comprehensive graph statistics', () => {
      const graph = createTestGraph();
      const result = getGraphStatistics(graph);
      
      expect(result).toBeDefined();
      expect(result.nodeCount).toBe(3);
      expect(result.edgeCount).toBe(3);
      expect(result.density).toBeGreaterThan(0);
    });

    it('should handle empty graph', () => {
      const graph: Graph = { nodes: [], edges: [] };
      const result = getGraphStatistics(graph);
      
      expect(result.nodeCount).toBe(0);
      expect(result.edgeCount).toBe(0);
      expect(result.density).toBe(0);
    });
  });
});
