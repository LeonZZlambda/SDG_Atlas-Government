import { describe, it, expect } from 'vitest';
import { calculateInitiativeScores } from '../utils/scoringEngine';
import type { Initiative } from '../types/initiative';

describe('Scoring Formula Validation', () => {
  describe('Impact Score Formula', () => {
    it('should always return score between 0 and 100', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      expect(result.impact).toBeGreaterThanOrEqual(0);
      expect(result.impact).toBeLessThanOrEqual(100);
    });

    it('should handle zero budget gracefully', () => {
      const initiative = createTestInitiative({ estimatedBudget: 0 });
      const result = calculateInitiativeScores(initiative);
      
      expect(result.impact).toBeGreaterThanOrEqual(0);
      expect(result.impact).toBeLessThanOrEqual(100);
    });

    it('should handle extremely high budget gracefully', () => {
      const initiative = createTestInitiative({ estimatedBudget: 10000000 });
      const result = calculateInitiativeScores(initiative);
      
      expect(result.impact).toBeGreaterThanOrEqual(0);
      expect(result.impact).toBeLessThanOrEqual(100);
    });

    it('should have factors with valid values', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      // Check that the breakdown has factors
      const breakdown = result.breakdowns.impact;
      expect(breakdown.factors).toBeDefined();
      expect(Array.isArray(breakdown.factors)).toBe(true);
      
      // Check that all factor values are within valid ranges
      breakdown.factors.forEach(factor => {
        expect(factor.value).toBeGreaterThanOrEqual(0);
        expect(factor.value).toBeLessThanOrEqual(100);
      });
    });

    it('should respond proportionally to input changes', () => {
      const baseInitiative = createTestInitiative({ estimatedBudget: 100000 });
      const highBudgetInitiative = createTestInitiative({ estimatedBudget: 200000 });
      
      const baseResult = calculateInitiativeScores(baseInitiative);
      const highResult = calculateInitiativeScores(highBudgetInitiative);
      
      // Higher budget should not decrease impact score
      expect(highResult.impact).toBeGreaterThanOrEqual(baseResult.impact);
    });
  });

  describe('Sustainability Score Formula', () => {
    it('should always return score between 0 and 100', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      expect(result.sustainability).toBeGreaterThanOrEqual(0);
      expect(result.sustainability).toBeLessThanOrEqual(100);
    });

    it('should handle short timeline gracefully', () => {
      const initiative = createTestInitiative({ timeline: 1 });
      const result = calculateInitiativeScores(initiative);
      
      expect(result.sustainability).toBeGreaterThanOrEqual(0);
      expect(result.sustainability).toBeLessThanOrEqual(100);
    });

    it('should handle long timeline gracefully', () => {
      const initiative = createTestInitiative({ timeline: 60 });
      const result = calculateInitiativeScores(initiative);
      
      expect(result.sustainability).toBeGreaterThanOrEqual(0);
      expect(result.sustainability).toBeLessThanOrEqual(100);
    });

    it('should have factors with valid values for sustainability', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      const breakdown = result.breakdowns.sustainability;
      expect(breakdown.factors).toBeDefined();
      expect(Array.isArray(breakdown.factors)).toBe(true);
      
      breakdown.factors.forEach(factor => {
        expect(factor.value).toBeGreaterThanOrEqual(0);
        expect(factor.value).toBeLessThanOrEqual(100);
      });
    });

    it('should increase with longer timeline (within bounds)', () => {
      const shortInitiative = createTestInitiative({ timeline: 6 });
      const longInitiative = createTestInitiative({ timeline: 24 });
      
      const shortResult = calculateInitiativeScores(shortInitiative);
      const longResult = calculateInitiativeScores(longInitiative);
      
      // Longer timeline should generally increase sustainability
      expect(longResult.sustainability).toBeGreaterThanOrEqual(shortResult.sustainability);
    });
  });

  describe('Feasibility Score Formula', () => {
    it('should always return score between 0 and 100', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      expect(result.feasibility).toBeGreaterThanOrEqual(0);
      expect(result.feasibility).toBeLessThanOrEqual(100);
    });

    it('should decrease with blocking dependencies', () => {
      const noDepsInitiative = createTestInitiative({ dependencies: [] });
      const blockingDepsInitiative = createTestInitiative({
        dependencies: [
          { id: 'dep-1', category: 'infrastructure', description: 'Test', blocking: true, severity: 'high' }
        ]
      });
      
      const noDepsResult = calculateInitiativeScores(noDepsInitiative);
      const blockingDepsResult = calculateInitiativeScores(blockingDepsInitiative);
      
      // Blocking dependencies should reduce feasibility
      expect(blockingDepsResult.feasibility).toBeLessThanOrEqual(noDepsResult.feasibility);
    });

    it('should have factors with valid values for feasibility', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      const breakdown = result.breakdowns.feasibility;
      expect(breakdown.factors).toBeDefined();
      expect(Array.isArray(breakdown.factors)).toBe(true);
      
      breakdown.factors.forEach(factor => {
        expect(factor.value).toBeGreaterThanOrEqual(0);
        expect(factor.value).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('SDG Alignment Score Formula', () => {
    it('should always return score between 0 and 100', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      expect(result.sdgAlignment).toBeGreaterThanOrEqual(0);
      expect(result.sdgAlignment).toBeLessThanOrEqual(100);
    });

    it('should handle single SDG', () => {
      const initiative = createTestInitiative({ sdgIds: [3] });
      const result = calculateInitiativeScores(initiative);
      
      expect(result.sdgAlignment).toBeGreaterThanOrEqual(0);
      expect(result.sdgAlignment).toBeLessThanOrEqual(100);
    });

    it('should handle many SDGs', () => {
      const initiative = createTestInitiative({ sdgIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
      const result = calculateInitiativeScores(initiative);
      
      expect(result.sdgAlignment).toBeGreaterThanOrEqual(0);
      expect(result.sdgAlignment).toBeLessThanOrEqual(100);
    });

    it('should have factors with valid values for SDG alignment', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      const breakdown = result.breakdowns.sdgAlignment;
      expect(breakdown.factors).toBeDefined();
      expect(Array.isArray(breakdown.factors)).toBe(true);
      
      breakdown.factors.forEach(factor => {
        expect(factor.value).toBeGreaterThanOrEqual(0);
        expect(factor.value).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Overall Score Formula', () => {
    it('should always return score between 0 and 100', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    it('should be weighted average of component scores', () => {
      const initiative = createTestInitiative();
      const result = calculateInitiativeScores(initiative);
      
      // Overall should be between min and max of component scores
      const minComponent = Math.min(result.impact, result.sustainability, result.feasibility, result.sdgAlignment);
      const maxComponent = Math.max(result.impact, result.sustainability, result.feasibility, result.sdgAlignment);
      
      expect(result.overall).toBeGreaterThanOrEqual(minComponent);
      expect(result.overall).toBeLessThanOrEqual(maxComponent);
    });

    it('should include all component breakdowns', () => {
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

  describe('Formula Sensitivity Analysis', () => {
    it('should respond predictably to ±10% weight changes', () => {
      const initiative = createTestInitiative({ estimatedBudget: 100000 });
      const baseResult = calculateInitiativeScores(initiative);
      
      // Test with 10% higher budget
      const highBudgetInitiative = createTestInitiative({ estimatedBudget: 110000 });
      const highBudgetResult = calculateInitiativeScores(highBudgetInitiative);
      
      // The change should be proportional and within reasonable bounds
      const change = Math.abs(highBudgetResult.impact - baseResult.impact);
      expect(change).toBeLessThan(20); // Should not change by more than 20 points
    });

    it('should maintain score bounds under extreme inputs', () => {
      const extremeInitiative = createTestInitiative({
        estimatedBudget: 100000000,
        requiredStaff: 1000,
        timeline: 120,
        sdgIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
      });
      
      const result = calculateInitiativeScores(extremeInitiative);
      
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
  });
});

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
