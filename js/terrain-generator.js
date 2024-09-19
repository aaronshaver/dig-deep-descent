import { Rock, Mineral, CompositeObject } from './solid-objects.js';
import Position from './position.js';

class ZLevelDistribution {
    #distributions;

    constructor() {
        this.#distributions = {
            0: {LooseRock: 0.95, RedMineral: 0.05},
            10: {LooseRock: 0.475, NormalRock: 0.475, RedMineral: 0.025, WhiteMineral: 0.025},
            20: {NormalRock: 0.95, WhiteMineral: 0.05},
            30: {NormalRock: 0.45, DenseRock: 0.45, WhiteMineral: 0.025, OrangeMineral: 0.025},
            40: {DenseRock: 0.95, OrangeMineral: 0.05},
            50: {DenseRock: 0.45, VeryDenseRock: 0.45, OrangeMineral: 0.025, PurpleMineral: 0.025},
            60: {VeryDenseRock: 0.95, PurpleMineral: 0.05},
            70: {VeryDenseRock: 0.45, ExtremelyDenseRock: 0.45, PurpleMineral: 0.025, YellowMineral: 0.025},
            80: {ExtremelyDenseRock: 0.95, YellowMineral: 0.05},
            90: {ExtremelyDenseRock: 0.95, YellowMineral: 0.025, BlueMineral: 0.025},
            100: {ExtremelyDenseRock: 0.95, BlueMineral: 0.05},
            110: {ExtremelyDenseRock: 0.95, BlueMineral: 0.025, GreenMineral: 0.025},
            120: {ExtremelyDenseRock: 0.95, GreenMineral: 0.05},
            9999: {ExtremelyDenseRock: 0.95, GreenMineral: 0.05},
        };
    }

    getObjectProbabilities(zLevel) {
        zLevel = Math.abs(zLevel);
        const levels = Object.keys(this.#distributions).map(Number).sort((a, b) => a - b);
        const lowerLevel = levels.filter(level => level <= zLevel).pop();
        const upperLevel = levels.filter(level => level > zLevel).shift();

        const factor = (zLevel - lowerLevel) / (upperLevel - lowerLevel);
        const lowerDist = this.#distributions[lowerLevel];
        const upperDist = this.#distributions[upperLevel];

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

class TerrainGenerator {
    perlin;
    #zLevelDistribution;

    constructor(perlin, zLevelDistribution) {
        if (!perlin) throw new Error("No perlin passed in to TerrainGenerator constructor");
        if (!zLevelDistribution) throw new Error("No zLevelDistribution passed in to TerrainGenerator constructor");
        this.perlin = perlin;
        this.#zLevelDistribution = zLevelDistribution;
    }

    generate(z, grid) {
        const compositeObjects = [];
        compositeObjects.push(...this.generateTerrainAtScale(z, grid, 0.1));
        compositeObjects.push(...this.generateTerrainAtScale(z, grid, 0.3));
        compositeObjects.push(...this.generateTerrainAtScale(z, grid, 0.5));
        compositeObjects.push(...this.generateTerrainAtScale(z, grid, 0.7));
        compositeObjects.push(...this.generateTerrainAtScale(z, grid, 0.9));
        grid.setTerrainAsGeneratedForLevel(z);

        return compositeObjects;
    }

    generateTerrainAtScale(z, grid, scale) {
        const gridSize = grid.getGridSize();
        const compositeObjects = [];
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const noiseValue = this.perlin.getNoise(x * scale, y * scale, z * scale);
                if (noiseValue > 0.2) {
                    const position = new Position(x, y, z);
                    if (!grid.getObject(position)) {
                        const objectType = this.#zLevelDistribution.selectObjectType(z);
                        const compositeObject = this.createCompositeObject(objectType, position, z);
                        grid.setObject(position, compositeObject);
                        compositeObjects.push(compositeObject);
                    }
                }
            }
        }
        return compositeObjects;
    }

    createCompositeObject(objectType, position, zLevel) {
        let rock, mineral;

        if (objectType.includes('Rock')) {
            rock = this.createRock(objectType, position);
        } else if (objectType.includes('Mineral')) {
            const dominantRockType = this.#zLevelDistribution.getDominantRockType(zLevel);
            rock = this.createRock(dominantRockType, position);
            mineral = this.createMineral(objectType, position);
        } else {
            throw new Error(`Unknown object type: ${objectType}`);
        }

        return new CompositeObject(rock, mineral);
    }

    createRock(rockType, position) {
        switch (rockType) {
            case 'LooseRock':
                return new Rock("Loose Rock", position, 400, 0.38);
            case 'NormalRock':
                return new Rock("Normal Rock", position, 800, 0.41);
            case 'DenseRock':
                return new Rock("Dense Rock", position, 1600, 0.44);
            case 'VeryDenseRock':
                return new Rock("Very Dense Rock", position, 3200, 0.47);
            case 'ExtremelyDenseRock':
                return new Rock("Extremely Dense Rock", position, 6400, 0.50);
            default:
                throw new Error(`Unknown rock type: ${rockType}`);
        }
    }

    createMineral(mineralType, position) {
        switch (mineralType) {
            case 'RedMineral':
                return new Mineral("Red Mineral", position, 0.15, 100);
            case 'WhiteMineral':
                return new Mineral("White Mineral", position, 0.20, 200);
            case 'OrangeMineral':
                return new Mineral("Orange Mineral", position, 0.25, 400);
            case 'PurpleMineral':
                return new Mineral("Purple Mineral", position, 0.30, 800);
            case 'YellowMineral':
                return new Mineral("Yellow Mineral", position, 0.35, 1600);
            case 'BlueMineral':
                return new Mineral("Blue Mineral", position, 0.40, 3200);
            case 'GreenMineral':
                return new Mineral("Green Mineral", position, 0.45, 6400);
            default:
                throw new Error(`Unknown mineral type: ${mineralType}`);
        }
    }
}

export { ZLevelDistribution, TerrainGenerator };