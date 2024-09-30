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

    test('getObjectProbabilities handles missing types in upper distribution', () => {
      const probabilities = zLevelDistribution.getObjectProbabilities(27);

      expect(probabilities).toHaveProperty('RedMineral');
      expect(zLevelDistribution.distributions[30]).not.toHaveProperty('RedMineral');
    });

    test('getDominantRockType returns the correct dominant rock type for interpolated z-levels', () => {
      const testCases = [
        { zLevel: 15, expectedType: 'LooseRock' },
        { zLevel: 27, expectedType: 'NormalRock' },
        { zLevel: 50, expectedType: 'DenseRock' },
        { zLevel: 70, expectedType: 'VeryDenseRock' },
        { zLevel: 110, expectedType: 'ExtremelyDenseRock' },
      ];

      testCases.forEach(({ zLevel, expectedType }) => {
        expect(zLevelDistribution.getDominantRockType(zLevel)).toBe(expectedType);
      });
    });

    test('getDominantRockType returns the correct dominant rock type for named z-levels', () => {
      const edgeCases = [
        { zLevel: 0, expectedType: 'LooseRock' },
        { zLevel: 20, expectedType: 'LooseRock' },
        { zLevel: 30, expectedType: 'NormalRock' },
        { zLevel: 55, expectedType: 'DenseRock' },
        { zLevel: 75, expectedType: 'VeryDenseRock' },
        { zLevel: 95, expectedType: 'ExtremelyDenseRock' },
      ];

      edgeCases.forEach(({ zLevel, expectedType }) => {
        expect(zLevelDistribution.getDominantRockType(zLevel)).toBe(expectedType);
      });
    });
});