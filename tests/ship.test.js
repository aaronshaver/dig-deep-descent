import { Ship } from '../js/ship.js';
import Position from '../js/position.js';

describe('Ship', () => {
  test('should be created with the given position', () => {
    console.log(process.version);
    const position = new Position(1, 2, 3);
    const ship = new Ship(position);
    expect(ship.getPosition()).toBe(position);
  });

  test('should have initial battery level of 1000', () => {
    const ship = new Ship(new Position(0, 0, 0));
    expect(ship.getBattery().getLevel()).toBe(1000);
  });

  test('should have initial drill power of 100', () => {
    const ship = new Ship(new Position(0, 0, 0));
    expect(ship.getDrill().getPower()).toBe(100);
  });

  test('should be able to set a new position', () => {
    const ship = new Ship(new Position(0, 0, 0));
    const newPosition = new Position(1, 1, 1);
    ship.setPosition(newPosition);
    expect(ship.getPosition()).toBe(newPosition);
  });
});