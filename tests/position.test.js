import Position from '../js/position.js';

describe('Position', () => {
  test('constructor sets x, y, and z correctly', () => {
    const position = new Position(1, 2, 3);
    expect(position.x).toBe(1);
    expect(position.y).toBe(2);
    expect(position.z).toBe(3);
  });

  test('properties are immutable', () => {
    const position = new Position(4, 5, 6);
    expect(() => {
      position.x = 7;
    }).toThrow(TypeError);
    expect(() => {
      position.y = 8;
    }).toThrow(TypeError);
    expect(() => {
      position.z = 9;
    }).toThrow(TypeError);
    expect(position.x).toBe(4);
    expect(position.y).toBe(5);
    expect(position.z).toBe(6);
  });
});