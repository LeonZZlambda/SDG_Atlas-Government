/**
 * Benchmarking System
 * Provides benchmark categorization for scores and metrics
 */

import { BENCHMARK_CATEGORIES } from '../constants/engineThresholds';

export interface BenchmarkCategory {
  label: string;
  color: string;
  icon: string;
}

export interface BenchmarkResult {
  category: BenchmarkCategory;
  threshold: number;
  percentile: number;
}

/**
 * Get impact category based on score
 * @param score - The impact score (0-100)
 * @returns Benchmark category with label, color, and icon
 */
export function getImpactCategory(score: number): BenchmarkCategory {
  for (const category of BENCHMARK_CATEGORIES.IMPACT) {
    if (score >= category.threshold) {
      return {
        label: category.label,
        color: category.color,
        icon: category.icon
      };
    }
  }
  return BENCHMARK_CATEGORIES.IMPACT[BENCHMARK_CATEGORIES.IMPACT.length - 1];
}

/**
 * Get sustainability category based on score
 * @param score - The sustainability score (0-100)
 * @returns Benchmark category with label, color, and icon
 */
export function getSustainabilityCategory(score: number): BenchmarkCategory {
  for (const category of BENCHMARK_CATEGORIES.SUSTAINABILITY) {
    if (score >= category.threshold) {
      return {
        label: category.label,
        color: category.color,
        icon: category.icon
      };
    }
  }
  return BENCHMARK_CATEGORIES.SUSTAINABILITY[BENCHMARK_CATEGORIES.SUSTAINABILITY.length - 1];
}

/**
 * Get detailed benchmark result with percentile
 * @param score - The score to benchmark
 * @param type - The type of benchmark ('impact' or 'sustainability')
 * @returns Detailed benchmark result
 */
export function getBenchmarkResult(
  score: number,
  type: 'impact' | 'sustainability'
): BenchmarkResult {
  const categories = type === 'impact' ? BENCHMARK_CATEGORIES.IMPACT : BENCHMARK_CATEGORIES.SUSTAINABILITY;

  let category = categories[categories.length - 1];
  let threshold = 0;

  for (let i = 0; i < categories.length; i++) {
    if (score >= categories[i].threshold) {
      category = categories[i];
      threshold = categories[i].threshold;
      break;
    }
  }

  const percentile = score / 100;

  return {
    category,
    threshold,
    percentile
  };
}

/**
 * Check if a score meets a specific threshold
 * @param score - The score to check
 * @param threshold - The threshold value
 * @returns True if score meets or exceeds threshold
 */
export function meetsThreshold(score: number, threshold: number): boolean {
  return score >= threshold;
}

/**
 * Get the distance from the next threshold
 * @param score - The current score
 * @param type - The type of benchmark ('impact' or 'sustainability')
 * @returns Distance to next threshold (0 if at highest level)
 */
export function getDistanceToNextThreshold(
  score: number,
  type: 'impact' | 'sustainability'
): number {
  const categories = type === 'impact' ? BENCHMARK_CATEGORIES.IMPACT : BENCHMARK_CATEGORIES.SUSTAINABILITY;

  for (let i = 0; i < categories.length - 1; i++) {
    if (score >= categories[i].threshold && score < categories[i + 1].threshold) {
      return categories[i + 1].threshold - score;
    }
  }

  return 0; // Already at highest level
}
