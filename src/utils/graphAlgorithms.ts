/**
 * Graph Algorithms for SDG Network Analysis
 * Implements centrality measures, clustering, and shortest path algorithms
 */

export interface GraphNode {
  id: number;
  label: string;
  weight?: number;
}

export interface GraphEdge {
  from: number;
  to: number;
  weight: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphStatistics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  degreeCentrality: Map<number, number>;
  betweennessCentrality: Map<number, number>;
  closenessCentrality: Map<number, number>;
  pageRank: Map<number, number>;
  clusteringCoefficients: Map<number, number>;
  averageClusteringCoefficient: number;
  communities: Map<number, number>;
  communityCount: number;
}

/**
 * Calculate Degree Centrality for each node
 * Degree centrality = number of connections / (n-1)
 */
export function calculateDegreeCentrality(graph: Graph): Map<number, number> {
  const centrality = new Map<number, number>();
  const n = graph.nodes.length;
  
  // Initialize all nodes with 0
  graph.nodes.forEach(node => centrality.set(node.id, 0));
  
  // Count connections (undirected graph)
  graph.edges.forEach(edge => {
    const fromCount = centrality.get(edge.from) || 0;
    const toCount = centrality.get(edge.to) || 0;
    centrality.set(edge.from, fromCount + 1);
    centrality.set(edge.to, toCount + 1);
  });
  
  // Normalize by (n-1)
  centrality.forEach((value, key) => {
    centrality.set(key, n > 1 ? value / (n - 1) : 0);
  });
  
  return centrality;
}

/**
 * Calculate Weighted Degree Centrality
 * Sum of edge weights for each node
 */
export function calculateWeightedDegreeCentrality(graph: Graph): Map<number, number> {
  const centrality = new Map<number, number>();
  
  // Initialize all nodes with 0
  graph.nodes.forEach(node => centrality.set(node.id, 0));
  
  // Sum edge weights
  graph.edges.forEach(edge => {
    const fromWeight = centrality.get(edge.from) || 0;
    const toWeight = centrality.get(edge.to) || 0;
    centrality.set(edge.from, fromWeight + edge.weight);
    centrality.set(edge.to, toWeight + edge.weight);
  });
  
  return centrality;
}

/**
 * Calculate Betweenness Centrality using Brandes' algorithm
 * Measures how often a node appears on shortest paths between other nodes
 */
export function calculateBetweennessCentrality(graph: Graph): Map<number, number> {
  const centrality = new Map<number, number>();
  const n = graph.nodes.length;
  
  // Initialize all nodes with 0
  graph.nodes.forEach(node => centrality.set(node.id, 0));
  
  // Build adjacency list
  const adj = new Map<number, Array<{node: number, weight: number}>>();
  graph.nodes.forEach(node => adj.set(node.id, []));
  graph.edges.forEach(edge => {
    adj.get(edge.from)?.push({ node: edge.to, weight: edge.weight });
    adj.get(edge.to)?.push({ node: edge.from, weight: edge.weight });
  });
  
  // For each node as source
  for (const source of graph.nodes) {
    const S: number[] = [];
    const P = new Map<number, number[]>();
    const sigma = new Map<number, number>();
    const d = new Map<number, number>();
    
    // Initialize
    graph.nodes.forEach(node => {
      P.set(node.id, []);
      sigma.set(node.id, 0);
      d.set(node.id, -1);
    });
    
    sigma.set(source.id, 1);
    d.set(source.id, 0);
    
    const queue: number[] = [source.id];
    
    while (queue.length > 0) {
      const v = queue.shift()!;
      S.push(v);
      
      const neighbors = adj.get(v) || [];
      for (const { node: w } of neighbors) {
        if (d.get(w)! === -1) {
          d.set(w, d.get(v)! + 1);
          queue.push(w);
        }
        
        if (d.get(w)! === d.get(v)! + 1) {
          sigma.set(w, (sigma.get(w) || 0) + (sigma.get(v) || 0));
          P.get(w)?.push(v);
        }
      }
    }
    
    const delta = new Map<number, number>();
    graph.nodes.forEach(node => delta.set(node.id, 0));
    
    while (S.length > 0) {
      const w = S.pop()!;
      const predecessors = P.get(w) || [];
      
      for (const v of predecessors) {
        const c = ((sigma.get(v) || 0) / (sigma.get(w) || 1)) * (1 + (delta.get(w) || 0));
        delta.set(v, (delta.get(v) || 0) + c);
      }
      
      if (w !== source.id) {
        centrality.set(w, (centrality.get(w) || 0) + delta.get(w)!);
      }
    }
  }
  
  // Normalize by (n-1)(n-2)/2 for undirected graphs
  const normalization = n > 2 ? ((n - 1) * (n - 2)) / 2 : 1;
  centrality.forEach((value, key) => {
    centrality.set(key, value / normalization);
  });
  
  return centrality;
}

/**
 * Calculate Closeness Centrality
 * Inverse of the average shortest path distance to all other nodes
 */
export function calculateClosenessCentrality(graph: Graph): Map<number, number> {
  const centrality = new Map<number, number>();
  
  // Build adjacency list
  const adj = new Map<number, Array<{node: number, weight: number}>>();
  graph.nodes.forEach(node => adj.set(node.id, []));
  graph.edges.forEach(edge => {
    adj.get(edge.from)?.push({ node: edge.to, weight: edge.weight });
    adj.get(edge.to)?.push({ node: edge.from, weight: edge.weight });
  });
  
  // For each node
  for (const source of graph.nodes) {
    const distances = dijkstra(graph, source.id, adj);
    let totalDistance = 0;
    let reachableNodes = 0;
    
    distances.forEach((dist, nodeId) => {
      if (nodeId !== source.id && dist < Infinity) {
        totalDistance += dist;
        reachableNodes++;
      }
    });
    
    if (reachableNodes > 0) {
      const closeness = (reachableNodes - 1) / totalDistance;
      centrality.set(source.id, closeness);
    } else {
      centrality.set(source.id, 0);
    }
  }
  
  return centrality;
}

/**
 * Calculate PageRank centrality
 * Uses iterative algorithm with damping factor
 */
export function calculatePageRank(graph: Graph, dampingFactor: number = 0.85, iterations: number = 100): Map<number, number> {
  const rank = new Map<number, number>();
  
  // Initialize all nodes with 1/n
  const initialRank = 1 / graph.nodes.length;
  graph.nodes.forEach(node => rank.set(node.id, initialRank));
  
  // Build adjacency list (outgoing edges)
  const adj = new Map<number, number[]>();
  graph.nodes.forEach(node => adj.set(node.id, []));
  graph.edges.forEach(edge => {
    adj.get(edge.from)?.push(edge.to);
  });
  
  // Calculate out-degree for each node
  const outDegree = new Map<number, number>();
  graph.nodes.forEach(node => outDegree.set(node.id, 0));
  graph.edges.forEach(edge => {
    outDegree.set(edge.from, (outDegree.get(edge.from) || 0) + 1);
  });
  
  // Iterative algorithm
  for (let i = 0; i < iterations; i++) {
    const newRank = new Map<number, number>();
    
    graph.nodes.forEach(node => {
      let sum = 0;
      
      // Sum PageRank of incoming neighbors
      graph.edges.forEach(edge => {
        if (edge.to === node.id) {
          const neighborRank = rank.get(edge.from) || initialRank;
          const neighborOutDegree = outDegree.get(edge.from) || 1;
          sum += neighborRank / neighborOutDegree;
        }
      });
      
      const pageRank = (1 - dampingFactor) / graph.nodes.length + dampingFactor * sum;
      newRank.set(node.id, pageRank);
    });
    
    // Update ranks
    newRank.forEach((value, key) => rank.set(key, value));
  }
  
  return rank;
}

/**
 * Dijkstra's algorithm for shortest path
 */
function dijkstra(graph: Graph, source: number, adj: Map<number, Array<{node: number, weight: number}>>): Map<number, number> {
  const distances = new Map<number, number>();
  const visited = new Set<number>();
  
  // Initialize distances
  graph.nodes.forEach(node => distances.set(node.id, Infinity));
  distances.set(source, 0);
  
  while (visited.size < graph.nodes.length) {
    // Find unvisited node with minimum distance
    let minDist = Infinity;
    let minNode = -1;
    
    graph.nodes.forEach(node => {
      if (!visited.has(node.id) && distances.get(node.id)! < minDist) {
        minDist = distances.get(node.id)!;
        minNode = node.id;
      }
    });
    
    if (minNode === -1 || minDist === Infinity) break;
    
    visited.add(minNode);
    
    // Update distances to neighbors
    const neighbors = adj.get(minNode) || [];
    for (const { node: neighbor, weight } of neighbors) {
      if (!visited.has(neighbor)) {
        const newDist = minDist + weight;
        if (newDist < distances.get(neighbor)!) {
          distances.set(neighbor, newDist);
        }
      }
    }
  }
  
  return distances;
}

/**
 * Find shortest path between two nodes using Dijkstra
 */
export function findShortestPath(graph: Graph, from: number, to: number): number[] {
  const adj = new Map<number, Array<{node: number, weight: number}>>();
  graph.nodes.forEach(node => adj.set(node.id, []));
  graph.edges.forEach(edge => {
    adj.get(edge.from)?.push({ node: edge.to, weight: edge.weight });
    adj.get(edge.to)?.push({ node: edge.from, weight: edge.weight });
  });
  
  const distances = new Map<number, number>();
  const previous = new Map<number, number | null>();
  const visited = new Set<number>();
  
  graph.nodes.forEach(node => {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
  });
  distances.set(from, 0);
  
  while (visited.size < graph.nodes.length) {
    let minDist = Infinity;
    let minNode = -1;
    
    graph.nodes.forEach(node => {
      if (!visited.has(node.id) && distances.get(node.id)! < minDist) {
        minDist = distances.get(node.id)!;
        minNode = node.id;
      }
    });
    
    if (minNode === -1 || minDist === Infinity) break;
    
    if (minNode === to) break;
    
    visited.add(minNode);
    
    const neighbors = adj.get(minNode) || [];
    for (const { node: neighbor, weight } of neighbors) {
      if (!visited.has(neighbor)) {
        const newDist = minDist + weight;
        if (newDist < distances.get(neighbor)!) {
          distances.set(neighbor, newDist);
          previous.set(neighbor, minNode);
        }
      }
    }
  }
  
  // Reconstruct path
const path: number[] = [];
let currentNode = to;
while (true) {
  path.unshift(currentNode);
  const prev = previous.get(currentNode);
  if (prev === undefined || prev === null) {
    break;
  }
  currentNode = prev!;
}
  
  return path[0] === from ? path : [];
}

/**
 * Community Detection using Label Propagation Algorithm
 */
export function detectCommunities(graph: Graph): Map<number, number> {
  const labels = new Map<number, number>();
  
  // Initialize each node with its own label
  graph.nodes.forEach(node => labels.set(node.id, node.id));
  
  // Build adjacency list
  const adj = new Map<number, number[]>();
  graph.nodes.forEach(node => adj.set(node.id, []));
  graph.edges.forEach(edge => {
    adj.get(edge.from)?.push(edge.to);
    adj.get(edge.to)?.push(edge.from);
  });
  
  let changed = true;
  let iterations = 0;
  const maxIterations = 100;
  
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    
    // Shuffle nodes for random order
    const shuffledNodes = [...graph.nodes].sort(() => Math.random() - 0.5);
    
    for (const node of shuffledNodes) {
      const neighbors = adj.get(node.id) || [];
      if (neighbors.length === 0) continue;
      
      // Count label frequencies among neighbors
      const labelCounts = new Map<number, number>();
      for (const neighbor of neighbors) {
        const label = labels.get(neighbor) || neighbor;
        labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
      }
      
      // Find most frequent label
      let maxCount = 0;
      let newLabel = labels.get(node.id) || node.id;
      
      labelCounts.forEach((count, label) => {
        if (count > maxCount || (count === maxCount && label < newLabel)) {
          maxCount = count;
          newLabel = label;
        }
      });
      
      if (newLabel !== labels.get(node.id)) {
        labels.set(node.id, newLabel);
        changed = true;
      }
    }
  }
  
  return labels;
}

/**
 * Calculate clustering coefficient for a node
 * Measures how connected its neighbors are to each other
 */
export function calculateClusteringCoefficient(graph: Graph): Map<number, number> {
  const coefficients = new Map<number, number>();
  
  // Build adjacency list
  const adj = new Map<number, Set<number>>();
  graph.nodes.forEach(node => adj.set(node.id, new Set()));
  graph.edges.forEach(edge => {
    adj.get(edge.from)?.add(edge.to);
    adj.get(edge.to)?.add(edge.from);
  });
  
  for (const node of graph.nodes) {
    const neighbors = adj.get(node.id) || new Set();
    const k = neighbors.size;
    
    if (k < 2) {
      coefficients.set(node.id, 0);
      continue;
    }
    
    let connectedNeighbors = 0;
    const neighborArray = Array.from(neighbors);
    
    for (let i = 0; i < neighborArray.length; i++) {
      for (let j = i + 1; j < neighborArray.length; j++) {
        const neighbor1 = neighborArray[i];
        const neighbor2 = neighborArray[j];
        
        if (adj.get(neighbor1)?.has(neighbor2)) {
          connectedNeighbors++;
        }
      }
    }
    
    const possibleConnections = (k * (k - 1)) / 2;
    const coefficient = possibleConnections > 0 ? connectedNeighbors / possibleConnections : 0;
    coefficients.set(node.id, coefficient);
  }
  
  return coefficients;
}

/**
 * Get graph statistics
 */
export function getGraphStatistics(graph: Graph) {
  const n = graph.nodes.length;
  const m = graph.edges.length;
  
  const degreeCentrality = calculateDegreeCentrality(graph);
  const betweennessCentrality = calculateBetweennessCentrality(graph);
  const closenessCentrality = calculateClosenessCentrality(graph);
  const pageRank = calculatePageRank(graph);
  const clusteringCoefficients = calculateClusteringCoefficient(graph);
  const communities = detectCommunities(graph);
  
  // Count communities
  const communityCount = new Set(communities.values()).size;
  
  // Average clustering coefficient
  let totalClustering = 0;
  clusteringCoefficients.forEach(value => totalClustering += value);
  const avgClustering = n > 0 ? totalClustering / n : 0;
  
  return {
    nodeCount: n,
    edgeCount: m,
    density: n > 1 ? (2 * m) / (n * (n - 1)) : 0,
    degreeCentrality,
    betweennessCentrality,
    closenessCentrality,
    pageRank,
    clusteringCoefficients,
    averageClusteringCoefficient: avgClustering,
    communities,
    communityCount
  };
}
