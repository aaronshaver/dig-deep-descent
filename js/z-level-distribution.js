class ZLevelDistribution {
    distributions;

    constructor() {
        this.distributions = {
            0: { LooseRock: 0.93, RedMineral: 0.07 },
            20: { LooseRock: 0.83, NormalRock: 0.10, RedMineral: 0.06, WhiteMineral: 0.01 },
            40: { LooseRock: 0.73, NormalRock: 0.20, RedMineral: 0.05, WhiteMineral: 0.02 },
            60: { LooseRock: 0.63, NormalRock: 0.30, RedMineral: 0.04, WhiteMineral: 0.02, OrangeMineral: 0.01 },
            80: { LooseRock: 0.53, NormalRock: 0.40, RedMineral: 0.03, WhiteMineral: 0.02, OrangeMineral: 0.02 },
            100: { LooseRock: 0.43, NormalRock: 0.50, RedMineral: 0.02, WhiteMineral: 0.02, OrangeMineral: 0.02, PurpleMineral: 0.01 },
            120: { NormalRock: 0.83, DenseRock: 0.10, WhiteMineral: 0.02, OrangeMineral: 0.02, PurpleMineral: 0.02, YellowMineral: 0.01 },
            140: { NormalRock: 0.73, DenseRock: 0.20, OrangeMineral: 0.02, PurpleMineral: 0.02, YellowMineral: 0.02, BlueMineral: 0.01 },
            160: { NormalRock: 0.63, DenseRock: 0.30, PurpleMineral: 0.03, YellowMineral: 0.02, BlueMineral: 0.01, GreenMineral: 0.01 },
            180: { NormalRock: 0.53, DenseRock: 0.40, PurpleMineral: 0.03, YellowMineral: 0.02, BlueMineral: 0.01, GreenMineral: 0.01 },
            200: { NormalRock: 0.43, DenseRock: 0.50, PurpleMineral: 0.02, YellowMineral: 0.02, BlueMineral: 0.02, GreenMineral: 0.01 },
            220: { DenseRock: 0.73, VeryDenseRock: 0.20, PurpleMineral: 0.02, YellowMineral: 0.02, BlueMineral: 0.02, GreenMineral: 0.01 },
            240: { DenseRock: 0.63, VeryDenseRock: 0.30, PurpleMineral: 0.01, YellowMineral: 0.02, BlueMineral: 0.02, GreenMineral: 0.02 },
            260: { DenseRock: 0.53, VeryDenseRock: 0.40, YellowMineral: 0.02, BlueMineral: 0.02, GreenMineral: 0.03 },
            280: { DenseRock: 0.43, VeryDenseRock: 0.50, YellowMineral: 0.01, BlueMineral: 0.03, GreenMineral: 0.03 },
            300: { VeryDenseRock: 0.73, ExtremelyDenseRock: 0.20, YellowMineral: 0.01, BlueMineral: 0.03, GreenMineral: 0.03 },
            320: { VeryDenseRock: 0.63, ExtremelyDenseRock: 0.30, YellowMineral: 0.01, BlueMineral: 0.02, GreenMineral: 0.04 },
            340: { VeryDenseRock: 0.53, ExtremelyDenseRock: 0.40, PurpleMineral: 0.01, YellowMineral: 0.01, BlueMineral: 0.02, GreenMineral: 0.03 },
            360: { VeryDenseRock: 0.43, ExtremelyDenseRock: 0.50, PurpleMineral: 0.01, YellowMineral: 0.01, BlueMineral: 0.02, GreenMineral: 0.03 },
            380: { ExtremelyDenseRock: 0.93, PurpleMineral: 0.01, YellowMineral: 0.01, BlueMineral: 0.02, GreenMineral: 0.03 },
            999: { ExtremelyDenseRock: 0.93, BlueMineral: 0.01, YellowMineral: 0.01, PurpleMineral: 0.01, GreenMineral: 0.04 }
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