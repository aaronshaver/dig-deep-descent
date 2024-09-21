export const BatteryEvents = {
    LATERAL_MOVE: 'LATERAL_MOVE',
    Z_MOVE: 'Z_MOVE',
    DIG_ROCK: 'DIG_ROCK',
    SCAN_MINERALS: 'SCAN_MINERALS',
};

const BATTERY_DRAIN = {
    [BatteryEvents.LATERAL_MOVE]: 5,
    [BatteryEvents.Z_MOVE]: 100,
    [BatteryEvents.DIG_ROCK]: 10,
    [BatteryEvents.SCAN_MINERALS]: 5,
};

export class Battery {
    #level;

    constructor() {
        this.#level = 1000;
    }

    getLevel() {
        return this.#level;
    }

    reduceBattery(event) {
        if (!(event in BATTERY_DRAIN)) {
            throw new Error(`Unknown battery event`);
        }
        this.#level -= BATTERY_DRAIN[event];
        if (this.#level < 0) this.#level = 0; // don't show nonsensical negative battery numbers
    }
}