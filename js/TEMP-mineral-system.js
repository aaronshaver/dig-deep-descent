class SolidObject {
    #position;
    #hitPoints;
    #radius;

    constructor(position, hitPoints, radius) {
        this.#position = position;
        this.#hitPoints = hitPoints;
        this.#radius = radius;
    }

    getPosition() {
        return this.#position;
    }

    setHitPoints(value) {
        this.#hitPoints = value;
    }

    getHitPoints() {
        return this.#hitPoints;
    }

    getRadius() {
        return this.#radius;
    }
}

class Rock extends SolidObject {
    #randomFlatSide;

    constructor(position, hitPoints, radius) {
        super(position, hitPoints, radius);
        this.#randomFlatSide = Math.floor(Math.random() * 6);
    }

    getFlatSide() {
        return this.#randomFlatSide;
    }
}

class Mineral extends SolidObject {
    #sellValue;

    constructor(position, hitPoints, radius, sellValue) {
        super(position, hitPoints, radius);
        this.#sellValue = sellValue;
    }

    getSellValue() {
        return this.#sellValue;
    }
}

class CompositeObject {
    #rock;
    #mineral;
    #isScanned;

    constructor(rock, mineral = null) {
        this.#rock = rock;
        this.#mineral = mineral;
        this.#isScanned = true;  // Set to true for now
    }

    getRock() {
        return this.#rock;
    }

    getMineral() {
        return this.#mineral;
    }

    isScanned() {
        return this.#isScanned;
    }
}

class ZLevelDistribution {
    #distributions;

    constructor() {
        this.#distributions = {
            0: {LightRock: 0.95, RedMineral: 0.05},
            10: {LightRock: 0.90, MediumRock: 0.05, RedMineral: 0.05},
            20: {LightRock: 0.80, MediumRock: 0.15, RedMineral: 0.03, GreenMineral: 0.02},
            // ... more levels ...
        };
    }

    getObjectProbabilities(zLevel) {
        // Get all defined z-levels and sort them
        const levels = Object.keys(this.#distributions).map(Number).sort((a, b) => a - b);

        // Find the nearest defined levels below and above the current zLevel
        const lowerLevel = levels.filter(level => level <= zLevel).pop();
        const upperLevel = levels.filter(level => level > zLevel).shift();

        // If zLevel matches a defined level, return that level's distribution
        if (lowerLevel === upperLevel) {
            return this.#distributions[lowerLevel];
        }

        // Calculate how far between lowerLevel and upperLevel our zLevel is
        // This will be used to interpolate probabilities
        const factor = (zLevel - lowerLevel) / (upperLevel - lowerLevel);

        const lowerDist = this.#distributions[lowerLevel];
        const upperDist = this.#distributions[upperLevel];

        // Interpolate probabilities for each object type
        // If an object doesn't exist in one level, treat its probability as 0
        return Object.keys({...lowerDist, ...upperDist}).reduce((acc, key) => {
            acc[key] = (lowerDist[key] || 0) + factor * ((upperDist[key] || 0) - (lowerDist[key] || 0));
            return acc;
        }, {});
    }

    selectObjectType(zLevel) {
        const probabilities = this.getObjectProbabilities(zLevel);
        const rand = Math.random();
        let cumulative = 0;

        // Iterate through object types, adding up probabilities
        // When the cumulative probability exceeds our random number, select that object type
        for (const [objType, prob] of Object.entries(probabilities)) {
            cumulative += prob;
            if (rand < cumulative) {
                return objType;
            }
        }

        // Fallback to last type (this should rarely happen due to floating point precision)
        return Object.keys(probabilities).pop();
    }
}

class TerrainGenerator {
    #perlin;
    #zLevelDistribution;

    constructor(perlin, zLevelDistribution) {
        this.#perlin = perlin;
        this.#zLevelDistribution = zLevelDistribution;
    }

    generate(z, grid) {
        const solidObjects = [];
        solidObjects.push(...this.generateTerrainAtScale(z, grid, 0.1));
        solidObjects.push(...this.generateTerrainAtScale(z, grid, 0.3));
        solidObjects.push(...this.generateTerrainAtScale(z, grid, 0.5));
        solidObjects.push(...this.generateTerrainAtScale(z, grid, 0.7));
        solidObjects.push(...this.generateTerrainAtScale(z, grid, 0.9));
        grid.setTerrainAsGeneratedForLevel(z);
        return solidObjects;
    }

    generateTerrainAtScale(z, grid, scale) {
        const gridSize = grid.getGridSize();
        const solidObjects = [];
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const noiseValue = this.#perlin.getNoise(x * scale, y * scale, z * scale);
                if (noiseValue > 0.2) {
                    const position = new Position(x, y, z);
                    if (!grid.getObject(position)) {
                        const objectType = this.#zLevelDistribution.selectObjectType(z);
                        const solidObject = this.createSolidObject(objectType, position);
                        grid.setObject(position, solidObject);
                        solidObjects.push(solidObject);
                    }
                }
            }
        }
        return solidObjects;
    }

    createSolidObject(objectType, position) {
        switch (objectType) {
            case 'LightRock':
                return new Rock(position, 800, 0.41);
            case 'MediumRock':
                return new Rock(position, 1600, 0.43);
            case 'RedMineral':
                return new Mineral(position, 400, 0.3, 100);
            case 'GreenMineral':
                return new Mineral(position, 600, 0.35, 200);
            // Add more cases as needed
            default:
                throw new Error(`Unknown object type: ${objectType}`);
        }
    }
}