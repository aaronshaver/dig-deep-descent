import { Rock, Mineral, CompositeObject } from './solid-objects.js';
import Position from './position.js';

class ZLevelDistribution {
    #distributions;

    constructor() {
        this.#distributions = {
            0: {LightRock: 0.95, RedMineral: 0.05},
            10: {LightRock: 0.90, MediumRock: 0.05, RedMineral: 0.05},
            20: {LightRock: 0.80, MediumRock: 0.15, RedMineral: 0.03, BlueMineral: 0.02},
        };
    }

    getObjectProbabilities(zLevel) {
        zLevel = Math.abs(zLevel); // keeps us from having to constantly deal with negative numbers throughout
        const levels = Object.keys(this.#distributions).map(Number).sort((a, b) => b - a);
        const lowerLevel = levels.filter(level => level <= zLevel).pop();
        const upperLevel = levels.filter(level => level > zLevel).shift();

        if (lowerLevel === upperLevel) {
            return this.#distributions[lowerLevel];
        }

        const factor = (zLevel - lowerLevel) / (upperLevel - lowerLevel);
        const lowerDist = this.#distributions[lowerLevel];
        const upperDist = this.#distributions[upperLevel];

        return Object.keys({...lowerDist, ...upperDist}).reduce((acc, key) => {
            acc[key] = (lowerDist[key] || 0) + factor * ((upperDist[key] || 0) - (lowerDist[key] || 0));
            return acc;
        }, {});
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
    #perlin;
    #zLevelDistribution;

    constructor(perlin, zLevelDistribution) {
        if (!perlin) throw new Error("No perlin passed in to TerrainGenerator constructor");
        if (!zLevelDistribution) throw new Error("No zLevelDistribution passed in to TerrainGenerator constructor");
        this.#perlin = perlin;
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
                const noiseValue = this.#perlin.getNoise(x * scale, y * scale, z * scale);
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
            case 'LightRock':
                return new Rock("LightRock", position, 800, 0.41);
            case 'MediumRock':
                return new Rock("MediumRock", position, 1600, 0.43);
            default:
                throw new Error(`Unknown rock type: ${rockType}`);
        }
    }

    createMineral(mineralType, position) {
        switch (mineralType) {
            case 'RedMineral':
                return new Mineral("RedMineral", position, 400, 0.100, 100);
            case 'BlueMineral':
                return new Mineral("BlueMineral", position, 600, 0.144, 200);
            default:
                throw new Error(`Unknown mineral type: ${mineralType}`);
        }
    }
    // future mineral radiuses
    // 0.189
    // 0.233
    // 0.278
    // 0.322
    // 0.367
    // 0.411
    // 0.456
    // 0.500
}

export { ZLevelDistribution, TerrainGenerator };