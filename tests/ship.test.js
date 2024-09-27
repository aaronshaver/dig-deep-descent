import { Ship } from '../js/ship.js';
import Position from '../js/position.js';

describe('Ship', () => {
  test('should be created with the given position', () => {
    const position = new Position(1, 2, 3);
    const ship = new Ship(position);
    expect(ship.getPosition()).toBe(position);
  });

  test('should have initial battery level of 1500', () => {
    const ship = new Ship(new Position(0, 0, 0));
    expect(ship.getBattery().getLevel()).toBe(1500);
  });

  test('should be able to set a new position', () => {
    const ship = new Ship(new Position(0, 0, 0));
    const newPosition = new Position(1, 1, 1);
    ship.setPosition(newPosition);
    expect(ship.getPosition()).toBe(newPosition);
  });

  test('should have initial Scanner range of 2', () => {
    const ship = new Ship(new Position(0, 0, 0));
    expect(ship.getScanner().getRange()).toBe(2);
  });
});