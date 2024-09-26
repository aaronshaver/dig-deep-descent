import { Battery } from "./ship-systems/battery.js";
import { Drill } from "./ship-systems/drill.js";
import { Scanner } from "./ship-systems/scanner.js";
import { Storage } from "./ship-systems/storage.js";

export class Ship {
    #position;
    #battery;
    #drill;
    #scanner;
    #storage;

    constructor(position) {
        this.#position = position;
        this.#battery = new Battery();
        this.#drill = new Drill();
        this.#scanner = new Scanner();
        this.#storage = new Storage();
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

    getStorage() {
        return this.#storage;
    }

    getPosition() {
        return this.#position;
    }

    setPosition(position) {
        this.#position = position;
    }
}