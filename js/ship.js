import Position from './position.js';

export class Ship {
    #position;
    #drillPower;

    constructor(position) {
        this.#position = position;
        this.#drillPower = 100;
    }

    getPosition() {
        return this.#position;
    }

    setPosition(position) {
        this.#position = position;
    }

    getDrillPower() {
        return this.#drillPower;
    }
}