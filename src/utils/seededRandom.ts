/**
 * Seeded Random Number Generator
 * Provides deterministic random number generation for reproducible simulations
 * Uses a simple Linear Congruential Generator (LCG) algorithm
 */

export class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /**
   * Generate a random number between 0 and 1
   * @returns Random number in range [0, 1)
   */
  next(): number {
    // LCG parameters from Numerical Recipes
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }

  /**
   * Generate a random number in a given range
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random number in range [min, max)
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generate a random integer in a given range
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random integer in range [min, max)
   */
  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }

  /**
   * Generate a random number from a normal distribution (Box-Muller transform)
   * @param mean - Mean of the distribution
   * @param stdDev - Standard deviation of the distribution
   * @returns Random number from normal distribution
   */
  normal(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /**
   * Reset the seed to a specific value
   * @param seed - New seed value
   */
  reset(seed: number): void {
    this.seed = seed;
  }

  /**
   * Get the current seed value
   * @returns Current seed
   */
  getSeed(): number {
    return this.seed;
  }
}

/**
 * Create a seeded random generator with a specific seed
 * @param seed - Seed value (defaults to current timestamp)
 * @returns SeededRandom instance
 */
export function createSeededRandom(seed?: number): SeededRandom {
  return new SeededRandom(seed);
}
