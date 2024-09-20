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
        const probabilities = zLevelDistribution.getObjectProbabilities(110);

        expect(probabilities).toHaveProperty('RedMineral');
        expect(zLevelDistribution.distributions[120]).not.toHaveProperty('RedMineral');
    });

    test('getDominantRockType returns the correct dominant rock type for interpolated z-levels', () => {
      const testCases = [
        { zLevel: 50, expectedType: 'LooseRock' },
        { zLevel: 110, expectedType: 'NormalRock' },
        { zLevel: 210, expectedType: 'DenseRock' },
        { zLevel: 310, expectedType: 'VeryDenseRock' },
        { zLevel: 390, expectedType: 'ExtremelyDenseRock' },
      ];

      testCases.forEach(({ zLevel, expectedType }) => {
        expect(zLevelDistribution.getDominantRockType(zLevel)).toBe(expectedType);
      });
    });

    test('getDominantRockType returns the correct dominant rock type for named z-levels', () => {
      const edgeCases = [
        { zLevel: 0, expectedType: 'LooseRock' },
        { zLevel: 20, expectedType: 'LooseRock' },
        { zLevel: 120, expectedType: 'NormalRock' },
        { zLevel: 220, expectedType: 'DenseRock' },
        { zLevel: 300, expectedType: 'VeryDenseRock' },
        { zLevel: 380, expectedType: 'ExtremelyDenseRock' },
      ];

      edgeCases.forEach(({ zLevel, expectedType }) => {
        expect(zLevelDistribution.getDominantRockType(zLevel)).toBe(expectedType);
      });
    });

});