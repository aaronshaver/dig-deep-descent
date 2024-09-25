export const BatteryEvents = {
    LATERAL_MOVE: 'LATERAL_MOVE',
    Z_MOVE: 'Z_MOVE',
    DIG_ROCK: 'DIG_ROCK',
    SCAN_MINERALS: 'SCAN_MINERALS',
};

const BATTERY_DRAIN = {
    [BatteryEvents.LATERAL_MOVE]: 5,
    [BatteryEvents.DIG_ROCK]: 10,
    [BatteryEvents.SCAN_MINERALS]: 5,
    [BatteryEvents.Z_MOVE]: null,
};

export class Battery {
    #level;

    constructor() {
        this.#level = 1000;
    }

    getLevel() {
        return this.#level;
    }

    // scales the digging difficulty by taking z-level into account so that deeper digging is more expensive
    getScaledZMove(zLevel) {
        return 50 + (Math.abs(zLevel) * 10);
    }

    /**
     * Reduces the battery level based on the event.
     * @param {string} event - The battery event type
     * @param {number} [zLevel=null] - The z-level for Z_MOVE events
     * @throws Will throw an error if an unknown event is provided
     * @throws Will throw an error if Z_MOVE is called without a valid z-level
     */
    reduceBattery(event, zLevel = null) {
        if (!(event in BATTERY_DRAIN)) {
            throw new Error(`Unknown battery event`);
        }
        if (event === BatteryEvents.Z_MOVE) {
            if (zLevel === undefined || zLevel === null) throw new Error("No z-level passed in to reduceBattery");
            this.#level -= this.getScaledZMove(zLevel);
        }
        else {
            this.#level -= BATTERY_DRAIN[event];
        }
        if (this.#level < 0) this.#level = 0; // don't show nonsensical negative battery numbers
    }
}