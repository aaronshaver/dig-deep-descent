import { CompositeObject, Rock } from '../js/solid-objects.js';
import { PerlinNoise } from '../js/perlin-noise.js';
import { Grid } from '../js/grid.js';
import { TerrainGenerator } from '../js/terrain-generator.js';
import { ZLevelDistribution } from '../js/z-level-distribution.js';
import Position from '../js/position.js';

jest.mock('../js/perlin-noise.js');
jest.mock('../js/grid.js');

describe('TerrainGenerator', () => {
    let terrainGenerator;
    let mockGrid;

    beforeEach(() => {
        PerlinNoise.mockClear();
        Grid.mockClear();
        terrainGenerator = new TerrainGenerator(new PerlinNoise(), new ZLevelDistribution());
        mockGrid = new Grid();
        mockGrid.getGridSize.mockReturnValue(5);
    });

    test('generate returns an array of Rock objects', () => {
        const mockPerlin = {
            getNoise: jest.fn().mockReturnValue(0.3)
        };
        terrainGenerator.perlin = mockPerlin;

        const objects = terrainGenerator.generate(0, mockGrid);
        expect(objects.every(object => object instanceof CompositeObject)).toBe(true);
    });

    test('increasing scale parameters result in fewer rocks', () => {
        const mockPerlin = {
            getNoise: jest.fn().mockReturnValue(0.8)
        };
        terrainGenerator.perlin = mockPerlin;
        const rocksLowScale = terrainGenerator.generate(0, mockGrid);

        mockPerlin.getNoise.mockReturnValue(0.1);
        const rocksHighScale = terrainGenerator.generate(0, mockGrid);

        expect(rocksHighScale.length).toBeLessThan(rocksLowScale.length);
    });

    test('objects are created when noise value is above the threshold', () => {
        const mockPerlin = {
            getNoise: jest.fn().mockReturnValue(0.8)
        };
        terrainGenerator.perlin = mockPerlin;
        mockGrid.getGridSize.mockReturnValue(2);

        const objects = terrainGenerator.generate(0, mockGrid);

        expect(objects.length).toBeGreaterThan(0);
        expect(mockGrid.setObject).toHaveBeenCalled();
    });

    test('rocks are not created when noise value is below the threshold', () => {
        mockGrid.getGridSize.mockReturnValue(5);

        const mockPerlin = {
            getNoise: jest.fn().mockReturnValue(0.1)
        };
        terrainGenerator.perlin = mockPerlin;
        const rocks = terrainGenerator.generate(0, mockGrid);

        expect(rocks.length).toBe(0);
        expect(mockGrid.setObject).not.toHaveBeenCalled();
    });

    test('objects on z-level 0 are only those in 0 z-level distribution row (no interpolation with later rows)', () => {
        const mockPerlin = {
            getNoise: jest.fn().mockReturnValue(0.8)
        };
        terrainGenerator.perlin = mockPerlin;
        mockGrid.getGridSize.mockReturnValue(25);

        const objects = terrainGenerator.generate(0, mockGrid);

        expect(objects.length).toBeGreaterThan(0);
        for (let object of objects) {
            let name;
            if (object.getRock()) {
                name = object.getRock().getName();
            }
            else {
                name = object.getMineral().getName();
            }
            expect(["Loose Rock", "Red Mineral"].includes(name)).toBe(true);
        }
    });

    // Rock creation tests

    test('createCompositeObject throws error for unknown type', () => {
        expect(() => {
            terrainGenerator.createCompositeObject('DoesNotExist', new Position(1, 2, 3), 0);
        }).toThrow('Unknown object type: DoesNotExist');
    });

    test('createRock creates NormalRock with correct properties', () => {
        const position = new Position(1, 2, 3);
        const rock = terrainGenerator.createRock('NormalRock', position);
        expect(rock.getName()).toBe("Normal Rock");
        expect(rock.getHitPoints()).toBe(800);
        expect(rock.getFlatSide()).toBeGreaterThanOrEqual(0);
        expect(rock.getFlatSide()).toBeLessThanOrEqual(5);
    });

    test('createRock creates DenseRock with correct properties', () => {
        const position = new Position(4, 5, 6);
        const rock = terrainGenerator.createRock('DenseRock', position);
        expect(rock.getName()).toBe("Dense Rock");
        expect(rock.getHitPoints()).toBe(1600);
        expect(rock.getFlatSide()).toBeGreaterThanOrEqual(0);
        expect(rock.getFlatSide()).toBeLessThanOrEqual(5);
    });

    test('createRock creates VeryDenseRock with correct properties', () => {
        const position = new Position(7, 8, 9);
        const rock = terrainGenerator.createRock('VeryDenseRock', position);
        expect(rock.getName()).toBe("Very Dense Rock");
        expect(rock.getHitPoints()).toBe(3200);
        expect(rock.getFlatSide()).toBeGreaterThanOrEqual(0);
        expect(rock.getFlatSide()).toBeLessThanOrEqual(5);
    });

    test('createRock creates ExtremelyDenseRock with correct properties', () => {
        const position = new Position(10, 11, 12);
        const rock = terrainGenerator.createRock('ExtremelyDenseRock', position);
        expect(rock.getName()).toBe("Extremely Dense Rock");
        expect(rock.getHitPoints()).toBe(6400);
        expect(rock.getFlatSide()).toBeGreaterThanOrEqual(0);
        expect(rock.getFlatSide()).toBeLessThanOrEqual(5);
    });

    test('createRock throws error for unknown rock type', () => {
        const position = new Position(13, 14, 15);
        expect(() => {
            terrainGenerator.createRock('UnknownRockType', position);
        }).toThrow('Unknown rock type: UnknownRockType');
    });

    // Mineral creation tests

    test('createMineral creates RedMineral with correct properties', () => {
        const position = new Position(1, 2, 3);
        const mineral = terrainGenerator.createMineral('RedMineral', position);
        expect(mineral.getName()).toBe("Red Mineral");
        expect(mineral.getSellValue()).toBe(100);
    });

    test('createMineral creates WhiteMineral with correct properties', () => {
        const position = new Position(4, 5, 6);
        const mineral = terrainGenerator.createMineral('WhiteMineral', position);
        expect(mineral.getName()).toBe("White Mineral");
        expect(mineral.getSellValue()).toBe(200);
    });

    test('createMineral creates OrangeMineral with correct properties', () => {
        const position = new Position(7, 8, 9);
        const mineral = terrainGenerator.createMineral('OrangeMineral', position);
        expect(mineral.getName()).toBe("Orange Mineral");
        expect(mineral.getSellValue()).toBe(400);
    });

    test('createMineral creates PurpleMineral with correct properties', () => {
        const position = new Position(10, 11, 12);
        const mineral = terrainGenerator.createMineral('PurpleMineral', position);
        expect(mineral.getName()).toBe("Purple Mineral");
        expect(mineral.getSellValue()).toBe(800);
    });

    test('createMineral creates YellowMineral with correct properties', () => {
        const position = new Position(13, 14, 15);
        const mineral = terrainGenerator.createMineral('YellowMineral', position);
        expect(mineral.getName()).toBe("Yellow Mineral");
        expect(mineral.getSellValue()).toBe(1600);
    });

    test('createMineral creates BlueMineral with correct properties', () => {
        const position = new Position(16, 17, 18);
        const mineral = terrainGenerator.createMineral('BlueMineral', position);
        expect(mineral.getName()).toBe("Blue Mineral");
        expect(mineral.getSellValue()).toBe(3200);
    });

    test('createMineral creates GreenMineral with correct properties', () => {
        const position = new Position(19, 20, 21);
        const mineral = terrainGenerator.createMineral('GreenMineral', position);
        expect(mineral.getName()).toBe("Green Mineral");
        expect(mineral.getSellValue()).toBe(6400);
    });

    test('createMineral throws error for unknown mineral type', () => {
        const position = new Position(22, 23, 24);
        expect(() => {
            terrainGenerator.createMineral('UnknownMineral', position);
        }).toThrow('Unknown mineral type: UnknownMineral');
    });

    // Constructor error cases

    test('constructor throws error when perlin is not provided', () => {
        expect(() => {
            new TerrainGenerator(null, new ZLevelDistribution());
        }).toThrow("No perlin passed in to TerrainGenerator constructor");
    });

    test('constructor throws error when zLevelDistribution is not provided', () => {
        expect(() => {
            new TerrainGenerator(new PerlinNoise(), null);
        }).toThrow("No zLevelDistribution passed in to TerrainGenerator constructor");
    });

    test('generateTerrainAtScale skips creating CompositeObject if one already exists in grid', () => {
        const z = 1;
        const scale = 0.3;
        mockGrid.getGridSize.mockReturnValue(1);

        const existingPosition = new Position(0, 0, z);
        const existingCompositeObject = new CompositeObject(
            new Rock("Normal Rock", existingPosition, 800, 0.41),
            null
        );

        // Mock getObject to return the existingCompositeObject when the position matches
        mockGrid.getObject.mockImplementation((position) => {
            if (
                position.x === existingPosition.x &&
                position.y === existingPosition.y &&
                position.z === existingPosition.z
            ) {
                return existingCompositeObject;
            }
            return null;
        });

        // Mock perlin.getNoise to return a value greater than 0.2 to enter the if block
        terrainGenerator.perlin.getNoise = jest.fn().mockReturnValue(0.3);

        const compositeObjects = terrainGenerator.generateTerrainAtScale(z, mockGrid, scale);

        expect(mockGrid.setObject).not.toHaveBeenCalled();
        expect(compositeObjects).toHaveLength(0);
    });


});