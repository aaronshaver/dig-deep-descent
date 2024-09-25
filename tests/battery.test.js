import { Battery, BatteryEvents } from '../js/ship-systems/battery.js';

describe('Battery', () => {
    test('battery drains as expected when reduceBattery is called with lateral move', () => {
        const battery = new Battery();
        expect(battery.getLevel()).toBe(1000);
        battery.reduceBattery(BatteryEvents.LATERAL_MOVE);
        expect(battery.getLevel()).toBe(995);
    });

    test('battery drains as expected when reduceBattery is called with z move', () => {
        const battery = new Battery();
        expect(battery.getLevel()).toBe(1000);
        battery.reduceBattery(BatteryEvents.Z_MOVE, 3);
        expect(battery.getLevel()).toBe(920);
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

    test('getScaledZMove produces expected number when called with a z-level', () => {
        const battery = new Battery();
        const zLevel = 10;
        expect(battery.getScaledZMove(zLevel)).toBe(150);
    });

    test('throws error when event is Z_MOVE but no z-level passed in', () => {
        const battery = new Battery();
        expect(() => {
            battery.reduceBattery(BatteryEvents.Z_MOVE);
        }).toThrow('No z-level passed in to reduceBattery');
    });

    test('battery drains correctly when reduceBattery is called with zLevel 0', () => {
        const battery = new Battery();
        expect(battery.getLevel()).toBe(1000);
        battery.reduceBattery(BatteryEvents.Z_MOVE, 0);
        expect(battery.getLevel()).toBe(950);
    });
});