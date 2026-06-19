import { describe, it, expect } from 'vitest';
import { createSeededRandom } from '../utils/seededRandom';

describe('Monte Carlo Simulation Validation', () => {
  describe('Seeded Random Generator', () => {
    it('should produce consistent results with same seed', () => {
      const rng1 = createSeededRandom(42);
      const rng2 = createSeededRandom(42);
      
      const values1 = Array.from({ length: 10 }, () => rng1.next());
      const values2 = Array.from({ length: 10 }, () => rng2.next());
      
      expect(values1).toEqual(values2);
    });

    it('should produce different results with different seeds', () => {
      const rng1 = createSeededRandom(42);
      const rng2 = createSeededRandom(43);
      
      const values1 = Array.from({ length: 10 }, () => rng1.next());
      const values2 = Array.from({ length: 10 }, () => rng2.next());
      
      expect(values1).not.toEqual(values2);
    });

    it('should generate numbers in range [0, 1)', () => {
      const rng = createSeededRandom(42);
      const values = Array.from({ length: 1000 }, () => rng.next());
      
      values.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      });
    });

    it('should generate numbers in custom range', () => {
      const rng = createSeededRandom(42);
      const min = 10;
      const max = 20;
      const values = Array.from({ length: 1000 }, () => rng.range(min, max));
      
      values.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThan(max);
      });
    });

    it('should generate integers in custom range', () => {
      const rng = createSeededRandom(42);
      const min = 0;
      const max = 10;
      const values = Array.from({ length: 100 }, () => rng.rangeInt(min, max));
      
      values.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThan(max);
        expect(Number.isInteger(value)).toBe(true);
      });
    });

    it('should generate normally distributed numbers', () => {
      const rng = createSeededRandom(42);
      const mean = 0;
      const stdDev = 1;
      const values = Array.from({ length: 10000 }, () => rng.normal(mean, stdDev));
      
      // Calculate sample mean and standard deviation
      const sampleMean = values.reduce((a, b) => a + b, 0) / values.length;
      const sampleVariance = values.reduce((sum, val) => sum + Math.pow(val - sampleMean, 2), 0) / values.length;
      const sampleStdDev = Math.sqrt(sampleVariance);
      
      // Allow some tolerance for statistical variation
      expect(Math.abs(sampleMean - mean)).toBeLessThan(0.1);
      expect(Math.abs(sampleStdDev - stdDev)).toBeLessThan(0.1);
    });
  });

  describe('Monte Carlo Convergence', () => {
    it('should converge to stable mean with sufficient iterations', () => {
      const rng = createSeededRandom(42);
      const iterations = 1000;
      const values = Array.from({ length: iterations }, () => rng.range(0, 100));
      
      // Calculate mean in chunks to check convergence
      const chunkSize = 100;
      const means: number[] = [];
      
      for (let i = 0; i < iterations; i += chunkSize) {
        const chunk = values.slice(i, i + chunkSize);
        const mean = chunk.reduce((a, b) => a + b, 0) / chunk.length;
        means.push(mean);
      }
      
      // Standard deviation of means should be small (converged)
      const overallMean = means.reduce((a, b) => a + b, 0) / means.length;
      const meanStdDev = Math.sqrt(
        means.reduce((sum, val) => sum + Math.pow(val - overallMean, 2), 0) / means.length
      );
      
      // Mean should be around 50 (midpoint of 0-100 range)
      expect(Math.abs(overallMean - 50)).toBeLessThan(10);
      // Standard deviation of chunk means should be less than 5% of range
      expect(meanStdDev).toBeLessThan(5);
    });

    it('should produce stable results across multiple runs with same seed', () => {
      const seed = 42;
      const iterations = 100;
      
      const run1 = Array.from({ length: iterations }, () => {
        const rng = createSeededRandom(seed);
        return Array.from({ length: 10 }, () => rng.next());
      });
      
      const run2 = Array.from({ length: iterations }, () => {
        const rng = createSeededRandom(seed);
        return Array.from({ length: 10 }, () => rng.next());
      });
      
      // All runs should produce identical results
      run1.forEach((values1, i) => {
        expect(values1).toEqual(run2[i]);
      });
    });
  });

  describe('Confidence Interval Accuracy', () => {
    it('should have 95% of values within confidence interval', () => {
      const rng = createSeededRandom(42);
      const iterations = 10000;
      const values = Array.from({ length: iterations }, () => rng.normal(50, 10));
      
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      );
      
      // 95% confidence interval (approximately ±2 standard deviations)
      const lowerBound = mean - 2 * stdDev;
      const upperBound = mean + 2 * stdDev;
      
      const withinCI = values.filter(v => v >= lowerBound && v <= upperBound).length;
      const percentage = (withinCI / iterations) * 100;
      
      // Should be approximately 95% (allow ±2% tolerance)
      expect(percentage).toBeGreaterThan(93);
      expect(percentage).toBeLessThan(97);
    });
  });

  describe('Normality Test', () => {
    it('should produce approximately normal distribution', () => {
      const rng = createSeededRandom(42);
      const iterations = 10000;
      const values = Array.from({ length: iterations }, () => rng.normal(0, 1));
      
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      );
      
      // Check skewness (should be close to 0 for normal distribution)
      const skewness = values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / iterations;
      expect(Math.abs(skewness)).toBeLessThan(0.2);
      
      // Check kurtosis (should be close to 0 for normal distribution)
      const kurtosis = values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / iterations - 3;
      expect(Math.abs(kurtosis)).toBeLessThan(0.5);
    });
  });
});
