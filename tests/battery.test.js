import { Battery, BatteryEvents } from '../js/ship-systems/battery.js';

describe('Battery', () => {
    test('battery drains when event reduceBattery is called with an event', () => {
        const battery = new Battery();
        expect(battery.getLevel()).toBe(1000);
        battery.reduceBattery(BatteryEvents.LATERAL_MOVE);
        expect(battery.getLevel()).toBe(995);
    });

    test('battery never drains below 0, because negative values do not make sense', () => {
        const battery = new Battery();
        expect(battery.getLevel()).toBe(1000);
        for (let i=0; i<1000; i++) {
            battery.reduceBattery(BatteryEvents.LATERAL_MOVE);
        }
        expect(battery.getLevel()).toBe(0);
    });

    test('battery throws error when non-existent event is attempted', () => {
        const battery = new Battery();
        expect(battery.getLevel()).toBe(1000);
        expect(() => {
            battery.reduceBattery(BatteryEvents.DOES_NOT_EXIST);
        }).toThrow('Unknown battery event');
        expect(battery.getLevel()).toBe(1000);
    });

    test('battery reduction takes z-level into account when moving z-levels', () => {
        const battery = new Battery();
        const zLevel = 10;
        expect(battery.getScaledZMove(zLevel)).toBe(150);
    });
});