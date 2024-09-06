import { Battery } from "./battery.js";

export class Ship {
    #position;
    #battery;
    #drill;

    constructor(position) {
        this.#position = position;
        this.#battery = new Battery();
        this.#drill = new Drill();
    }

    getBattery() {
        return this.#battery;
    }

    getDrill() {
        return this.#drill;
    }

    getPosition() {
        return this.#position;
    }

    setPosition(position) {
        this.#position = position;
    }
}

class Drill {
    #power;

    constructor() {
        this.#power = 100;
    }

    getPower() {
        return this.#power;
    }
}