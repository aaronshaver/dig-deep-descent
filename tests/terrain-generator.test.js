import { CompositeObject } from '../js/solid-objects.js';
import { PerlinNoise } from '../js/perlin-noise.js';
import { Grid } from '../js/grid.js';
import { TerrainGenerator } from '../js/terrain-generator.js';
import { ZLevelDistribution } from '../js/z-level-distribution.js';

jest.mock('../js/perlin-noise.js');
jest.mock('../js/grid.js');

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
});