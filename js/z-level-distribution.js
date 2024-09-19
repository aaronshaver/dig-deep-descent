class ZLevelDistribution {
    distributions;

    constructor() {
        this.distributions = {
            0: { LooseRock: 0.95, RedMineral: 0.05 },
            10: { LooseRock: 0.475, NormalRock: 0.475, RedMineral: 0.025, WhiteMineral: 0.025 },
            20: { NormalRock: 0.95, WhiteMineral: 0.05 },
            30: { NormalRock: 0.475, DenseRock: 0.475, WhiteMineral: 0.025, OrangeMineral: 0.025 },
            40: { DenseRock: 0.95, OrangeMineral: 0.05 },
            50: { DenseRock: 0.475, VeryDenseRock: 0.475, OrangeMineral: 0.025, PurpleMineral: 0.025 },
            60: { VeryDenseRock: 0.95, PurpleMineral: 0.05 },
            70: { VeryDenseRock: 0.475, ExtremelyDenseRock: 0.475, PurpleMineral: 0.025, YellowMineral: 0.025 },
            80: { ExtremelyDenseRock: 0.95, YellowMineral: 0.05 },
            90: { ExtremelyDenseRock: 0.95, YellowMineral: 0.025, BlueMineral: 0.025 },
            100: { ExtremelyDenseRock: 0.95, BlueMineral: 0.05 },
            110: { ExtremelyDenseRock: 0.95, BlueMineral: 0.025, GreenMineral: 0.025 },
            120: { ExtremelyDenseRock: 0.95, GreenMineral: 0.05 },
            9999: { ExtremelyDenseRock: 0.95, GreenMineral: 0.05 },
        };
    }

    getDistributions() {
        return this.distributions;
    }

    getObjectProbabilities(zLevel) {
        zLevel = Math.abs(zLevel);
        const levels = Object.keys(this.distributions).map(Number).sort((a, b) => a - b);
        const lowerLevel = levels.filter(level => level <= zLevel).pop();
        const upperLevel = levels.filter(level => level > zLevel).shift();

        const factor = (zLevel - lowerLevel) / (upperLevel - lowerLevel);
        const lowerDist = this.distributions[lowerLevel];
        const upperDist = this.distributions[upperLevel];

        // Combine all object types from both levels
        const allTypes = new Set([...Object.keys(lowerDist), ...Object.keys(upperDist)]);

        const interpolatedDist = {};
        for (const type of allTypes) {
            const lowerProb = lowerDist[type] || 0;
            const upperProb = upperDist[type] || 0;
            interpolatedDist[type] = lowerProb + factor * (upperProb - lowerProb);
        }

        // Normalize probabilities
        const total = Object.values(interpolatedDist).reduce((sum, prob) => sum + prob, 0);
        Object.keys(interpolatedDist).forEach(key => {
            interpolatedDist[key] /= total;
        });

        return interpolatedDist;
    }

    selectObjectType(zLevel) {
        const probabilities = this.getObjectProbabilities(zLevel);
        const rand = Math.random();
        let cumulative = 0;

        for (const [objType, prob] of Object.entries(probabilities)) {
            cumulative += prob;
            if (rand < cumulative) {
                return objType;
            }
        }
        return Object.keys(probabilities).pop();
    }

    getDominantRockType(zLevel) {
        const probabilities = this.getObjectProbabilities(zLevel);
        const rockTypes = Object.keys(probabilities).filter(type => type.includes('Rock'));
        const rockProbabilities = rockTypes.reduce((acc, type) => {
            acc[type] = probabilities[type];
            return acc;
        }, {});

        const totalRockProbability = Object.values(rockProbabilities).reduce((sum, prob) => sum + prob, 0);
        const normalizedRockProbabilities = Object.entries(rockProbabilities).reduce((acc, [type, prob]) => {
            acc[type] = prob / totalRockProbability;
            return acc;
        }, {});

        return Object.entries(normalizedRockProbabilities).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }
}

export { ZLevelDistribution }