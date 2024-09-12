import { Rock, LightRock, MediumRock, Terrain } from '../js/terrain.js';
import { PerlinNoise } from '../js/perlin-noise.js';
import { Grid } from '../js/grid.js';
import Position from '../js/position.js';

jest.mock('../js/perlin-noise.js');
jest.mock('../js/grid.js');

describe('Rock', () => {
  test('constructor initializes properties correctly', () => {
    const rock = new Rock(new Position(1, 2, 3), 999, 0.44, 0.50);
    expect(rock.getPosition().x).toBe(1);
    expect(rock.getPosition().y).toBe(2);
    expect(rock.getPosition().z).toBe(3);
    expect(rock.getHitPoints()).toBe(999);
    expect(rock.getRadius()).toBe(0.44);
    expect(rock.getCurrentRarity()).toBe(0.50);
  });

  test('has a random flat side property within a range', () => {
    const rock = new Rock(new Position(1, 2, 3), 333, 0.33, 0.50);
    expect(rock.getFlatSide()).toBeDefined;
    expect(rock.getFlatSide()).toBeGreaterThanOrEqual(0);
    expect(rock.getFlatSide()).toBeLessThanOrEqual(5);
  });

  test('applyDamage reduces hitPoints', () => {
    const rock = new Rock(new Position(1, 2, 3), 600, 0.33, 0.50);
    rock.setHitPoints(rock.getHitPoints() - 100);
    expect(rock.getHitPoints()).toBe(500);
  });

  test('constructor throws error if no hitPoints passed in', () => {
    expect(() => {
      new Rock(new Position(1, 2, 3), null, 0.44, 0.99);
    }).toThrow('No hitPoints param passed in to Rock constructor');
  });

  test('constructor throws error if no radius passed in', () => {
    expect(() => {
      new Rock(new Position(1, 2, 3), 100, null, 0.99);
    }).toThrow('No radius param passed in to Rock constructor');
  });

  test('constructor throws error if no currentRarity passed in', () => {
    expect(() => {
      new Rock(new Position(1, 2, 3), 100, 0.44, null);
    }).toThrow('No currentRarity param passed in to Rock constructor');
  });
});

describe('LightRock', () => {
  test('constructor initializes properties correctly', () => {
    const lightRock = new LightRock(new Position(1, 2, 3));
    expect(lightRock.getHitPoints()).toBe(800);
    expect(lightRock.getRadius()).toBe(0.41);
  });
});

describe('MediumRock', () => {
  test('constructor initializes properties correctly', () => {
    const lightRock = new MediumRock(new Position(1, 2, 3));
    expect(lightRock.getHitPoints()).toBe(1600);
    expect(lightRock.getRadius()).toBe(0.43);
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

  test('generate returns an array of Rock objects', () => {
    const mockPerlin = {
      getNoise: jest.fn().mockReturnValue(0.3)
    };
    terrain.perlin = mockPerlin;

    const rocks = terrain.generate(0, mockGrid);
    expect(rocks.every(rock => rock instanceof Rock)).toBe(true);
  });

  test('generate contains at least some MediumRock objects at z-level 0', () => {
    const mockPerlin = {
      getNoise: jest.fn().mockReturnValue(0.3)
    };
    terrain.perlin = mockPerlin;

    mockGrid.getGridSize.mockReturnValue(25);
    const rocks = terrain.generate(0, mockGrid);
    console.log(rocks.size)
    expect(rocks.some(rock => rock instanceof MediumRock)).toBe(true);
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