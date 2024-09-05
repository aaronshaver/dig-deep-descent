import { BasicRock, Terrain } from '../js/terrain.js';
import { PerlinNoise } from '../js/perlin-noise.js';
import { Grid } from '../js/grid.js';
import Position from '../js/position.js';

jest.mock('../js/perlin-noise.js');
jest.mock('../js/grid.js');

describe('BasicRock', () => {
  test('constructor initializes properties correctly', () => {
    const rock = new BasicRock(new Position(1, 2, 3));
    expect(rock.getPosition().x).toBe(1);
    expect(rock.getPosition().y).toBe(2);
    expect(rock.getPosition().z).toBe(3);
    expect(rock.hitPoints).toBe(800);
  });

  test('applyDamage reduces hitPoints', () => {
    const rock = new BasicRock(0, 0, 0);
    rock.applyDamage(100);
    expect(rock.getHitPoints()).toBe(700);
  });

  test('getHitPoints returns correct value for BasicRock', () => {
    const rock = new BasicRock(0, 0, 0);
    expect(rock.getHitPoints()).toBe(800);
  });
});

describe('Terrain', () => {
  let terrain;
  let mockGrid;

  beforeEach(() => {
    PerlinNoise.mockClear();
    Grid.mockClear();
    terrain = new Terrain();
    mockGrid = new Grid();
    mockGrid.getGridSize.mockReturnValue(5);
  });

  test('generate returns an array of BasicRock objects', () => {
    const mockPerlin = {
      getNoise: jest.fn().mockReturnValue(0.3)
    };
    terrain.perlin = mockPerlin;

    const rocks = terrain.generate(0, mockGrid);
    expect(rocks.every(rock => rock instanceof BasicRock)).toBe(true);
  });

  test('increasing scale parameters result in fewer rocks', () => {
    const mockPerlin = {
      getNoise: jest.fn().mockReturnValue(0.8)
    };
    terrain.perlin = mockPerlin;
    const rocksLowScale = terrain.generate(0, mockGrid);

    mockPerlin.getNoise.mockReturnValue(0.1);
    const rocksHighScale = terrain.generate(0, mockGrid);

    expect(rocksHighScale.length).toBeLessThan(rocksLowScale.length);
  });

  test('rocks are created when noise value is above the threshold', () => {
    const mockPerlin = {
      getNoise: jest.fn().mockReturnValue(0.8)
    };
    terrain.perlin = mockPerlin;
    mockGrid.getGridSize.mockReturnValue(2);

    const rocks = terrain.generate(0, mockGrid);

    expect(rocks.length).toBeGreaterThan(0);
    expect(mockGrid.setObject).toHaveBeenCalled();
  });

  test('rocks are not created when noise value is below the threshold', () => {
    mockGrid.getGridSize.mockReturnValue(5);

    const mockPerlin = {
      getNoise: jest.fn().mockReturnValue(0.1)
    };
    terrain.perlin = mockPerlin;
    const rocks = terrain.generate(0, mockGrid);

    expect(rocks.length).toBe(0);
    expect(mockGrid.setObject).not.toHaveBeenCalled();
  });
});