import { ZLevelDistribution } from '../js/z-level-distribution.js';

describe('ZLevelDistribution', () => {
    let zLevelDistribution;

    beforeEach(() => {
      zLevelDistribution = new ZLevelDistribution();
    });

    test('all distribution probabilities sum to 1', () => {
      const distributions = zLevelDistribution.getDistributions();

      Object.entries(distributions).forEach(([zLevel, distribution]) => {
        const sum = Object.values(distribution).reduce((acc, prob) => acc + prob, 0);
        expect(sum).toBeCloseTo(1, 5); // Using toBeCloseTo to account for potential floating-point imprecision
      });
    });
});