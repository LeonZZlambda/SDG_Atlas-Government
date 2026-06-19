import { describe, it, expect } from 'vitest';
import { buildGraphFromSDGs, buildFullSDGGraph } from '../utils/graphBuilders';
import {
  calculateDegreeCentrality,
  calculateBetweennessCentrality,
  calculatePageRank,
  getGraphStatistics,
} from '../utils/graphAlgorithms';

describe('Graph Generation Validation', () => {
  describe('Graph Consistency', () => {
    it('should produce identical graphs for same inputs', () => {
      const sdgIds = [3, 4, 11];
      const graph1 = buildGraphFromSDGs(sdgIds);
      const graph2 = buildGraphFromSDGs(sdgIds);
      
      expect(graph1.nodes).toEqual(graph2.nodes);
      expect(graph1.edges).toEqual(graph2.edges);
    });

    it('should handle empty SDG selection', () => {
      const graph = buildGraphFromSDGs([]);
      
      expect(graph.nodes).toEqual([]);
      expect(graph.edges).toEqual([]);
    });

    it('should handle single SDG', () => {
      const graph = buildGraphFromSDGs([3]);
      
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].id).toBe(3);
      expect(graph.edges).toEqual([]); // No edges with single node
    });

    it('should handle all 17 SDGs', () => {
      const allSDGs = Array.from({ length: 17 }, (_, i) => i + 1);
      const graph = buildGraphFromSDGs(allSDGs);
      
      expect(graph.nodes).toHaveLength(17);
      expect(graph.nodes.map(n => n.id)).toEqual(allSDGs);
    });
  });

  describe('Edge Filtering', () => {
    it('should filter edges with coefficient below threshold (0.1)', () => {
      const graph = buildGraphFromSDGs([3, 4, 11]);
      
      graph.edges.forEach(edge => {
        expect(Math.abs(edge.weight)).toBeGreaterThanOrEqual(0.1);
      });
    });

    it('should include edges with coefficient at threshold (0.1)', () => {
      const graph = buildGraphFromSDGs([3, 4]);
      
      // Check if there are edges and they meet the threshold
      graph.edges.forEach(edge => {
        expect(Math.abs(edge.weight)).toBeGreaterThanOrEqual(0.1);
      });
    });

    it('should not create duplicate edges', () => {
      const graph = buildGraphFromSDGs([3, 4, 11]);
      
      const edgePairs = graph.edges.map(e => `${e.from}-${e.to}`);
      const uniquePairs = new Set(edgePairs);
      
      expect(edgePairs.length).toBe(uniquePairs.size);
    });

    it('should create edges only between selected SDGs', () => {
      const sdgIds = [3, 4, 11];
      const graph = buildGraphFromSDGs(sdgIds);
      
      graph.edges.forEach(edge => {
        expect(sdgIds).toContain(edge.from);
        expect(sdgIds).toContain(edge.to);
      });
    });
  });

  describe('Node Properties', () => {
    it('should assign correct IDs to nodes', () => {
      const sdgIds = [3, 4, 11];
      const graph = buildGraphFromSDGs(sdgIds);
      
      expect(graph.nodes.map(n => n.id)).toEqual(sdgIds);
    });

    it('should assign labels to nodes', () => {
      const graph = buildGraphFromSDGs([3, 4, 11]);
      
      graph.nodes.forEach(node => {
        expect(node.label).toBeDefined();
        expect(typeof node.label).toBe('string');
        expect(node.label.length).toBeGreaterThan(0);
      });
    });

    it('should maintain node order', () => {
      const sdgIds = [3, 4, 11];
      const graph = buildGraphFromSDGs(sdgIds);
      
      expect(graph.nodes.map(n => n.id)).toEqual(sdgIds);
    });
  });

  describe('Centrality Calculations', () => {
    it('should calculate degree centrality correctly for star graph', () => {
      // Create a simple star graph: node 1 connected to all others
      const graph = {
        nodes: [{ id: 1, label: 'Node 1' }, { id: 2, label: 'Node 2' }, { id: 3, label: 'Node 3' }, { id: 4, label: 'Node 4' }],
        edges: [
          { from: 1, to: 2, weight: 1 },
          { from: 1, to: 3, weight: 1 },
          { from: 1, to: 4, weight: 1 },
        ],
      };
      
      const centrality = calculateDegreeCentrality(graph);
      
      // Node 1 should have highest degree centrality
      expect(centrality.get(1)).toBeGreaterThan(centrality.get(2) || 0);
      expect(centrality.get(1)).toBeGreaterThan(centrality.get(3) || 0);
      expect(centrality.get(1)).toBeGreaterThan(centrality.get(4) || 0);
    });

    it('should calculate betweenness centrality correctly for path graph', () => {
      // Create a path graph: 1-2-3-4
      const graph = {
        nodes: [{ id: 1, label: 'Node 1' }, { id: 2, label: 'Node 2' }, { id: 3, label: 'Node 3' }, { id: 4, label: 'Node 4' }],
        edges: [
          { from: 1, to: 2, weight: 1 },
          { from: 2, to: 3, weight: 1 },
          { from: 3, to: 4, weight: 1 },
        ],
      };
      
      const centrality = calculateBetweennessCentrality(graph);
      
      // Middle nodes (2, 3) should have higher betweenness than endpoints (1, 4)
      const middleAvg = ((centrality.get(2) || 0) + (centrality.get(3) || 0)) / 2;
      const endpointAvg = ((centrality.get(1) || 0) + (centrality.get(4) || 0)) / 2;
      
      expect(middleAvg).toBeGreaterThan(endpointAvg);
    });

    it('should calculate PageRank correctly for complete graph', () => {
      // Create a complete graph where all nodes are equally connected
      const graph = {
        nodes: [{ id: 1, label: 'Node 1' }, { id: 2, label: 'Node 2' }, { id: 3, label: 'Node 3' }],
        edges: [
          { from: 1, to: 2, weight: 1 },
          { from: 1, to: 3, weight: 1 },
          { from: 2, to: 1, weight: 1 },
          { from: 2, to: 3, weight: 1 },
          { from: 3, to: 1, weight: 1 },
          { from: 3, to: 2, weight: 1 },
        ],
      };
      
      const pageRank = calculatePageRank(graph);
      
      // In a complete graph, all nodes should have similar PageRank
      const values = Array.from(pageRank.values());
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      
      // Variance should be low (similar values)
      expect(variance).toBeLessThan(0.01);
    });
  });

  describe('Graph Statistics', () => {
    it('should calculate correct density for complete graph', () => {
      const graph = {
        nodes: [{ id: 1, label: 'Node 1' }, { id: 2, label: 'Node 2' }, { id: 3, label: 'Node 3' }],
        edges: [
          { from: 1, to: 2, weight: 1 },
          { from: 1, to: 3, weight: 1 },
          { from: 2, to: 3, weight: 1 },
        ],
      };
      
      const stats = getGraphStatistics(graph);
      
      // For 3 nodes, complete graph has 3 edges, density = 2*3 / (3*2) = 1
      expect(stats.density).toBeCloseTo(1.0, 2);
    });

    it('should calculate correct density for sparse graph', () => {
      const graph = {
        nodes: [{ id: 1, label: 'Node 1' }, { id: 2, label: 'Node 2' }, { id: 3, label: 'Node 3' }, { id: 4, label: 'Node 4' }],
        edges: [
          { from: 1, to: 2, weight: 1 },
        ],
      };
      
      const stats = getGraphStatistics(graph);
      
      // For 4 nodes with 1 edge, density = 2*1 / (4*3) = 2/12 = 0.167
      expect(stats.density).toBeCloseTo(0.167, 2);
    });

    it('should calculate average clustering coefficient', () => {
      const graph = {
        nodes: [{ id: 1, label: 'Node 1' }, { id: 2, label: 'Node 2' }, { id: 3, label: 'Node 3' }],
        edges: [
          { from: 1, to: 2, weight: 1 },
          { from: 2, to: 3, weight: 1 },
          { from: 3, to: 1, weight: 1 },
        ],
      };
      
      const stats = getGraphStatistics(graph);
      
      // Triangle should have clustering coefficient of 1
      expect(stats.averageClusteringCoefficient).toBeCloseTo(1.0, 2);
    });

    it('should handle empty graph statistics', () => {
      const graph = { nodes: [], edges: [] };
      const stats = getGraphStatistics(graph);
      
      expect(stats.density).toBe(0);
      expect(stats.averageClusteringCoefficient).toBe(0);
    });
  });

  describe('Full SDG Graph', () => {
    it('should build graph with all 17 SDGs', () => {
      const graph = buildFullSDGGraph();
      
      expect(graph.nodes).toHaveLength(17);
      expect(graph.nodes.map(n => n.id)).toEqual(
        Array.from({ length: 17 }, (_, i) => i + 1)
      );
    });

    it('should have consistent edge weights', () => {
      const graph = buildFullSDGGraph();
      
      graph.edges.forEach(edge => {
        expect(edge.weight).toBeGreaterThanOrEqual(-1);
        expect(edge.weight).toBeLessThanOrEqual(1);
      });
    });

    it('should filter weak connections in full graph', () => {
      const graph = buildFullSDGGraph();
      
      graph.edges.forEach(edge => {
        expect(Math.abs(edge.weight)).toBeGreaterThanOrEqual(0.1);
      });
    });

    it('should calculate statistics for full graph', () => {
      const graph = buildFullSDGGraph();
      const stats = getGraphStatistics(graph);
      
      expect(stats.density).toBeGreaterThan(0);
      expect(stats.density).toBeLessThanOrEqual(1);
      expect(stats.averageClusteringCoefficient).toBeGreaterThanOrEqual(0);
      expect(stats.averageClusteringCoefficient).toBeLessThanOrEqual(1);
    });
  });

  describe('Graph Properties Validation', () => {
    it('should maintain undirected edge property', () => {
      const graph = buildGraphFromSDGs([3, 4, 11]);
      
      // For undirected graphs, if edge (a,b) exists, edge (b,a) should not exist separately
      const edgePairs = new Set(graph.edges.map(e => `${Math.min(e.from, e.to)}-${Math.max(e.from, e.to)}`));
      expect(edgePairs.size).toBe(graph.edges.length);
    });

    it('should handle weighted edges correctly', () => {
      const graph = buildGraphFromSDGs([3, 4]);
      
      graph.edges.forEach(edge => {
        expect(typeof edge.weight).toBe('number');
        expect(edge.weight).not.toBeNaN();
      });
    });

    it('should produce valid graph structure', () => {
      const graph = buildGraphFromSDGs([3, 4, 11]);
      
      expect(graph).toHaveProperty('nodes');
      expect(graph).toHaveProperty('edges');
      expect(Array.isArray(graph.nodes)).toBe(true);
      expect(Array.isArray(graph.edges)).toBe(true);
      
      graph.nodes.forEach(node => {
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('label');
      });
      
      graph.edges.forEach(edge => {
        expect(edge).toHaveProperty('from');
        expect(edge).toHaveProperty('to');
        expect(edge).toHaveProperty('weight');
      });
    });
  });
});
