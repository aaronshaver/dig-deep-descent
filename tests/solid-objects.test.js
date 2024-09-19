import { Rock, Mineral, CompositeObject, SolidObject } from '../js/solid-objects.js';
import Position from '../js/position.js';

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
    const rock = new Rock("test rock name", new Position(1, 2, 3), 333, 0.33);
    expect(rock.getFlatSide()).toBeDefined;
    expect(rock.getFlatSide()).toBeGreaterThanOrEqual(0);
    expect(rock.getFlatSide()).toBeLessThanOrEqual(5);
  });

  test('applyDamage reduces hitPoints', () => {
    const rock = new Rock("test rock name", new Position(1, 2, 3), 600, 0.33);
    rock.setHitPoints(rock.getHitPoints() - 100);
    expect(rock.getHitPoints()).toBe(500);
  });

  test('constructor throws error if no name passed in', () => {
    expect(() => {
      new Rock(null, new Position(1, 2, 3), 100, 0.44);
    }).toThrow('No name passed in to Rock constructor');
  });

  test('constructor throws error if no position passed in', () => {
    expect(() => {
      new Rock("test rock name", null, 100, 0.44);
    }).toThrow('No position passed in to Rock constructor');
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

describe('Mineral', () => {
  test('constructor initializes properties correctly', () => {
    const mineral = new Mineral("test mineral name", new Position(1, 2, 3), 0.44, 100);
    expect(mineral.getName()).toBe("test mineral name");
    expect(mineral.getPosition().x).toBe(1);
    expect(mineral.getPosition().y).toBe(2);
    expect(mineral.getPosition().z).toBe(3);
    expect(mineral.getRadius()).toBe(0.44);
    expect(mineral.getSellValue()).toBe(100);
  });

  test('constructor throws error if no name passed in', () => {
    expect(() => {
      new Mineral(null, new Position(1, 2, 3), 0.44, 2000);
    }).toThrow('No name passed in to Mineral constructor');
  });

  test('constructor throws error if no position passed in', () => {
    expect(() => {
      new Mineral("test mineral name", null, 0.44, 2000);
    }).toThrow('No position passed in to Mineral constructor');
  });

  test('constructor throws error if no radius passed in', () => {
    expect(() => {
      new Mineral("test mineral name", new Position(1, 2, 3), null, 2000);
    }).toThrow('No radius passed in to Mineral constructor');
  });

  test('constructor throws error if no sellValue passed in', () => {
    expect(() => {
      new Mineral("test mineral name", new Position(1, 2, 3), 0.44, null);
    }).toThrow('No sellValue passed in to Mineral constructor');
  });

});

describe('CompositeObject', () => {
  test('getMineral returns a mineral', () => {
    const rock = new Rock("test rock name", new Position(1, 2, 3), 333, 0.33);
    const mineral = new Mineral("test mineral name", new Position(1, 2, 3), 0.44, 100);
    const compositeObject = new CompositeObject(rock, mineral);
    expect(compositeObject.getMineral().getName()).toBe("test mineral name");
    expect(compositeObject.isScanned()).toBe(true); // will change to false once Scanner is implemented
  });

  test('getMineral returns a mineral', () => {
    const mineral = new Mineral("test mineral name", new Position(1, 2, 3), 0.44, 100);
    expect(() => {
      new CompositeObject(null, mineral);
    }).toThrow('No rock passed in to CompositeObject constructor');
  });
});

describe('SolidObject', () => {
  test('constructor throws error if no position passed in', () => {
    expect(() => {
      new SolidObject(null, 0.55);
    }).toThrow('No position passed in to SolidObject constructor');
  });

  test('constructor throws error if no radius passed in', () => {
    expect(() => {
      new SolidObject(new Position(1, 2, 3), null);
    }).toThrow('No radius passed in to SolidObject constructor');
  });
});
