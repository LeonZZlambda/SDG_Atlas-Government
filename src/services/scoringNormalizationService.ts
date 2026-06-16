/**
 * Scoring Normalization Service
 * Provides utility functions for normalizing and categorizing scores
 */

export interface NormalizedValue {
  raw: number;
  normalized: number;
  method: string;
}

export interface ScoreCategory {
  label: string;
  color: string;
  icon: string;
}

export class ScoringNormalizationService {
  /**
   * Normalize a value using logarithmic or percentile method
   */
  static normalizeValue(
    value: number,
    method: 'log' | 'percentile' = 'log',
    maxValue?: number
  ): NormalizedValue {
    if (value <= 0) {
      return { raw: value, normalized: 0, method: 'log' };
    }
    
    if (method === 'log') {
      const normalized = Math.log10(value + 1) / (maxValue ? Math.log10(maxValue + 1) : 6);
      return { raw: value, normalized: Math.min(100, normalized * 100), method: 'logarithmic' };
    }
    
    const normalized = Math.min(100, (value / (maxValue || 100000)) * 100);
    return { raw: value, normalized, method: 'percentile' };
  }

  /**
   * Categorize a score into resilience levels
   */
  static categorizeResilience(score: number): ScoreCategory {
    if (score >= 91) return { label: 'Highly Resilient', color: '#10b981', icon: 'shield' };
    if (score >= 71) return { label: 'Resilient', color: '#3b82f6', icon: 'leaf' };
    if (score >= 41) return { label: 'Stable', color: '#f59e0b', icon: 'scale' };
    return { label: 'Fragile', color: '#ef4444', icon: 'alert' };
  }

  /**
   * Categorize a score into impact levels
   */
  static categorizeImpact(score: number): ScoreCategory {
    if (score >= 80) return { label: 'Exceptional', color: '#10b981', icon: 'star' };
    if (score >= 60) return { label: 'Good', color: '#3b82f6', icon: 'trending-up' };
    if (score >= 40) return { label: 'Moderate', color: '#f59e0b', icon: 'minus' };
    return { label: 'Limited', color: '#ef4444', icon: 'alert-circle' };
  }

  /**
   * Categorize a score into feasibility levels
   */
  static categorizeFeasibility(score: number): ScoreCategory {
    if (score >= 75) return { label: 'Highly Feasible', color: '#10b981', icon: 'check-circle' };
    if (score >= 50) return { label: 'Feasible', color: '#3b82f6', icon: 'check' };
    if (score >= 25) return { label: 'Challenging', color: '#f59e0b', icon: 'alert-triangle' };
    return { label: 'Low Feasibility', color: '#ef4444', icon: 'x-circle' };
  }
}
