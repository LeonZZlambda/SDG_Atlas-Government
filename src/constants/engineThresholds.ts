/**
 * Engine Thresholds Configuration
 * Defines threshold values for engine status categorization
 */

export const ENGINE_THRESHOLDS = {
  IMPACT: {
    EXCEPTIONAL: 91,
    HIGH: 71,
    MODERATE: 41,
    LOW: 0
  },
  SUSTAINABILITY: {
    HIGHLY_RESILIENT: 91,
    RESILIENT: 71,
    STABLE: 41,
    FRAGILE: 0
  },
  DENSITY: {
    HIGH: 0.5,
    MODERATE: 0.3,
    LOW: 0
  },
  CLUSTERING: {
    HIGH: 0.5,
    MODERATE: 0.3,
    LOW: 0
  },
  CENTRALITY: {
    HIGH: 0.5,
    MODERATE: 0.3,
    LOW: 0
  }
} as const;

export const BENCHMARK_CATEGORIES = {
  IMPACT: [
    { threshold: 91, label: 'Exceptional', color: '#10b981', icon: 'trophy' },
    { threshold: 71, label: 'High', color: '#3b82f6', icon: 'star' },
    { threshold: 41, label: 'Moderate', color: '#f59e0b', icon: 'chart' },
    { threshold: 0, label: 'Low', color: '#ef4444', icon: 'trending-down' }
  ],
  SUSTAINABILITY: [
    { threshold: 91, label: 'Highly Resilient', color: '#10b981', icon: 'shield' },
    { threshold: 71, label: 'Resilient', color: '#3b82f6', icon: 'leaf' },
    { threshold: 41, label: 'Stable', color: '#f59e0b', icon: 'scale' },
    { threshold: 0, label: 'Fragile', color: '#ef4444', icon: 'alert' }
  ]
} as const;
