import { Battery } from "./ship-systems/battery.js";
import { Drill } from "./ship-systems/drill.js";
import { Scanner } from "./ship-systems/scanner.js";

export class Ship {
    #position;
    #battery;
    #drill;
    #scanner;

    constructor(position) {
        this.#position = position;
        this.#battery = new Battery();
        this.#drill = new Drill();
        this.#scanner = new Scanner();
    }

    getBattery() {
        return this.#battery;
    }

    getDrill() {
        return this.#drill;
    }

    getScanner() {
        return this.#scanner;
    }

    getPosition() {
        return this.#position;
    }

    setPosition(position) {
        this.#position = position;
    }
}