/**
 * Normalization Functions
 * Provides value normalization for outlier prevention and score scaling
 */

export type NormalizationMethod = 'log' | 'percentile';

export interface NormalizedValue {
  raw: number;
  normalized: number;
  method: string;
}

/**
 * Normalize a value using logarithmic or percentile method
 * @param value - The raw value to normalize
 * @param method - The normalization method to use
 * @param maxValue - Optional maximum value for normalization
 * @returns Normalized value with metadata
 */
export function normalizeValue(
  value: number,
  method: NormalizationMethod = 'log',
  maxValue?: number
): NormalizedValue {
  if (value <= 0) {
    return { raw: value, normalized: 0, method: 'log' };
  }

  if (method === 'log') {
    const normalized = Math.log10(value + 1) / (maxValue ? Math.log10(maxValue + 1) : 6);
    return {
      raw: value,
      normalized: Math.min(100, normalized * 100),
      method: 'logarithmic'
    };
  }

  const normalized = Math.min(100, (value / (maxValue || 100000)) * 100);
  return { raw: value, normalized, method: 'percentile' };
}

/**
 * Normalize a value to a 0-1 range
 * @param value - The value to normalize
 * @param min - Minimum value in the range
 * @param max - Maximum value in the range
 * @returns Normalized value between 0 and 1
 */
export function normalizeToRange(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Apply min-max scaling to a value
 * @param value - The value to scale
 * @param min - Minimum value for scaling
 * @param max - Maximum value for scaling
 * @param targetMin - Target minimum (default: 0)
 * @param targetMax - Target maximum (default: 1)
 * @returns Scaled value
 */
export function minMaxScale(
  value: number,
  min: number,
  max: number,
  targetMin: number = 0,
  targetMax: number = 1
): number {
  if (max === min) return targetMin;
  const normalized = (value - min) / (max - min);
  return targetMin + normalized * (targetMax - targetMin);
}
