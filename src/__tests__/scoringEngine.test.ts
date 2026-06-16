import { describe, it, expect } from 'vitest';
import { calculateImpactScore, calculateSustainabilityScore, calculateFeasibilityScore, calculateSDGAlignmentScore, calculateInitiativeScores } from '../utils/scoringEngine';
import type { Initiative } from '../types/initiative';

function createTestInitiative(overrides: Partial<Initiative> = {}): Initiative {
  return {
    id: 'test-initiative',
    name: 'Test Initiative',
    description: 'Test description',
    category: 'social',
    sdgIds: [3, 4, 11],
    estimatedBudget: 100000,
    requiredStaff: 10,
    timeline: 12,
    dependencies: [],
    risks: [],
    infrastructureRequirements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active',
    ...overrides,
  };
}

describe('Scoring Engine', () => {
  describe('calculateImpactScore', () => {
    it('should return a score between 0 and 100', () => {
      const initiative = createTestInitiative();
      const result = calculateImpactScore(initiative);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle zero budget', () => {
      const initiative = createTestInitiative({ estimatedBudget: 0 });
      const result = calculateImpactScore(initiative);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle high budget efficiently', () => {
      const initiative = createTestInitiative({ estimatedBudget: 1000000 });
      const result = calculateImpactScore(initiative);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should return score breakdown with factors', () => {
      const initiative = createTestInitiative();
      const result = calculateImpactScore(initiative);
      
      expect(result.factors).toBeDefined();
      expect(Array.isArray(result.factors)).toBe(true);
      expect(result.factors.length).toBeGreaterThan(0);
    });

    it('should return factors with descriptions', () => {
      const initiative = createTestInitiative();
      const result = calculateImpactScore(initiative);
      
      expect(result.factors).toBeDefined();
      expect(result.factors.length).toBeGreaterThan(0);
      result.factors.forEach(factor => {
        expect(factor.description).toBeDefined();
        expect(typeof factor.description).toBe('string');
      });
    });
  });

  describe('calculateSustainabilityScore', () => {
    it('should return a score between 0 and 100', () => {
      const initiative = createTestInitiative();
      const result = calculateSustainabilityScore(initiative);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle short timeline', () => {
      const initiative = createTestInitiative({ timeline: 3 });
      const result = calculateSustainabilityScore(initiative);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle long timeline', () => {
      const initiative = createTestInitiative({ timeline: 48 });
      const result = calculateSustainabilityScore(initiative);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateFeasibilityScore', () => {
    it('should return a score between 0 and 100', () => {
      const initiative = createTestInitiative();
      const result = calculateFeasibilityScore(initiative);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle blocking dependencies', () => {
      const initiative = createTestInitiative({
        dependencies: [
          { id: 'dep-1', category: 'infrastructure', description: 'Test dependency', blocking: true, severity: 'high' }
        ]
      });
      const result = calculateFeasibilityScore(initiative);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateSDGAlignmentScore', () => {
    it('should return a score between 0 and 100', () => {
      const initiative = createTestInitiative();
      const result = calculateSDGAlignmentScore(initiative);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle single SDG', () => {
      const initiative = createTestInitiative({ sdgIds: [3] });
      const result = calculateSDGAlignmentScore(initiative);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle many SDGs', () => {
      const initiative = createTestInitiative({ sdgIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
      const result = calculateSDGAlignmentScore(initiative);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateInitiativeScores', () => {
    it('should return complete score breakdown', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      expect(result.impact).toBeGreaterThanOrEqual(0);
      expect(result.impact).toBeLessThanOrEqual(100);
      expect(result.sustainability).toBeGreaterThanOrEqual(0);
      expect(result.sustainability).toBeLessThanOrEqual(100);
      expect(result.feasibility).toBeGreaterThanOrEqual(0);
      expect(result.feasibility).toBeLessThanOrEqual(100);
      expect(result.sdgAlignment).toBeGreaterThanOrEqual(0);
      expect(result.sdgAlignment).toBeLessThanOrEqual(100);
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    it('should include breakdowns for all scores', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      expect(result.breakdowns).toBeDefined();
      expect(result.breakdowns.impact).toBeDefined();
      expect(result.breakdowns.sustainability).toBeDefined();
      expect(result.breakdowns.feasibility).toBeDefined();
      expect(result.breakdowns.sdgAlignment).toBeDefined();
    });

    it('should include explanations for all scores', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      expect(result.explanations).toBeDefined();
      expect(result.explanations.impact).toBeDefined();
      expect(result.explanations.sustainability).toBeDefined();
      expect(result.explanations.feasibility).toBeDefined();
      expect(result.explanations.sdgAlignment).toBeDefined();
      expect(result.explanations.overall).toBeDefined();
    });
  });
});
