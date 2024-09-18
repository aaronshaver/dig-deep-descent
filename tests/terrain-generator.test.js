import { Rock, CompositeObject } from '../js/solid-objects.js';
import { PerlinNoise } from '../js/perlin-noise.js';
import { Grid } from '../js/grid.js';
import Position from '../js/position.js';
import { TerrainGenerator, ZLevelDistribution } from '../js/terrain-generator.js';

jest.mock('../js/perlin-noise.js');
jest.mock('../js/grid.js');

describe('Rock', () => {
  test('constructor initializes properties correctly', () => {
    const rock = new Rock("test rock name", new Position(1, 2, 3), 999, 0.44);
    expect(rock.getPosition().x).toBe(1);
    expect(rock.getPosition().y).toBe(2);
    expect(rock.getPosition().z).toBe(3);
    expect(rock.getHitPoints()).toBe(999);
    expect(rock.getRadius()).toBe(0.44);
  });

  test('has a random flat side property within a range', () => {
    const rock = new Rock(new Position(1, 2, 3), 333, 0.33, 0.50);
    expect(rock.getFlatSide()).toBeDefined;
    expect(rock.getFlatSide()).toBeGreaterThanOrEqual(0);
    expect(rock.getFlatSide()).toBeLessThanOrEqual(5);
  });

  test('applyDamage reduces hitPoints', () => {
    const rock = new Rock("test rock name", new Position(1, 2, 3), 600, 0.33);
    rock.setHitPoints(rock.getHitPoints() - 100);
    expect(rock.getHitPoints()).toBe(500);
  });

  test('constructor throws error if no hitPoints passed in', () => {
    expect(() => {
      new Rock("test rock name", new Position(1, 2, 3), null, 0.44);
    }).toThrow('No hitPoints passed in to Rock constructor');
  });

  test('constructor throws error if no radius passed in', () => {
    expect(() => {
      new Rock("test rock name", new Position(1, 2, 3), 100, null);
    }).toThrow('No radius passed in to Rock constructor');
  });
});

describe('Terrain', () => {
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
});