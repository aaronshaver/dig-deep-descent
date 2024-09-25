export class Storage {
    #freeSpace;
    #minerals;

    constructor() {
        this.#freeSpace = 100;
        this.#minerals = [];
    }

    getFreeSpace() {
        return this.#freeSpace;
    }

    addMineral(mineral) {
        if (!mineral) throw new Error("No Mineral passed in to addMineral");
        const mineralStorageAmount = mineral.getSellValue() / 10;
        if (this.#freeSpace < mineralStorageAmount) return; // don't store if there's no room
        this.#minerals.push(mineral);
        this.#freeSpace -= mineralStorageAmount;
    }

    getMinerals() {
        return this.#minerals;
    }
}