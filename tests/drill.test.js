import { Drill, DrillDirections } from '../js/drill.js';
import { Ship } from '../js/ship.js';
import Position from '../js/position.js';

describe('Drill', () => {
    test('starts with center direction', () => {
        const drill = new Drill();
        expect(drill.getDirection()).toBe(DrillDirections.CENTER);
    });

    test('allows setting of direction', () => {
        const drill = new Drill();
        expect(drill.getDirection()).toBeDefined();
        expect(drill.getDirection()).toBe(DrillDirections.CENTER);
        drill.setDirection(DrillDirections.LEFT);
        expect(drill.getDirection()).toBeDefined();
        expect(drill.getDirection()).toBe(DrillDirections.LEFT);
        drill.setDirection(DrillDirections.RIGHT);
        expect(drill.getDirection()).toBeDefined();
        expect(drill.getDirection()).toBe(DrillDirections.RIGHT);
        drill.setDirection(DrillDirections.UP);
        expect(drill.getDirection()).toBeDefined();
        expect(drill.getDirection()).toBe(DrillDirections.UP);
        drill.setDirection(DrillDirections.DOWN);
        expect(drill.getDirection()).toBeDefined();
        expect(drill.getDirection()).toBe(DrillDirections.DOWN);
    });

    test('should have initial drill power/strength of 100', () => {
        const ship = new Ship(new Position(0, 0, 0));
        expect(ship.getDrill().getStrength()).toBe(100);
    });

});