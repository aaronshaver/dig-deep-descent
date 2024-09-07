import { Drill, DrillDirections } from '../js/drill.js';

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
});