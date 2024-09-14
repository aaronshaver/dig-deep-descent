class SolidObject {
    #position;
    #hitPoints;
    #radius;

    constructor(position, hitPoints, radius) {
        if (!position) throw new Error("No position param passed in to SolidObject constructor");
        if (!hitPoints) throw new Error("No hitPoints param passed in to SolidObject constructor");
        if (!radius) throw new Error("No radius param passed in to SolidObject constructor");
        this.#position = position;
        this.#hitPoints = hitPoints;
        this.#radius = radius;
    }

    getPosition() {
        return this.#position;
    }

    setHitPoints(value) {
        this.#hitPoints = value;
    }

    getHitPoints() {
        return this.#hitPoints;
    }

    getRadius() {
        return this.#radius;
    }
}

class Rock extends SolidObject {
    #randomFlatSide;

    constructor(position, hitPoints, radius) {
        if (!position) throw new Error("No position param passed in to Rock constructor");
        if (!hitPoints) throw new Error("No hitPoints param passed in to Rock constructor");
        if (!radius) throw new Error("No radius param passed in to Rock constructor");
        super(position, hitPoints, radius);
        this.#randomFlatSide = Math.floor(Math.random() * 6);
    }

    getFlatSide() {
        return this.#randomFlatSide;
    }
}

class Mineral extends SolidObject {
    #sellValue;

    constructor(position, hitPoints, radius, sellValue) {
        if (!position) throw new Error("No position param passed in to Mineral constructor");
        if (!hitPoints) throw new Error("No hitPoints param passed in to Mineral constructor");
        if (!radius) throw new Error("No radius param passed in to Mineral constructor");
        if (!sellValue) throw new Error("No sellValue param passed in to Mineral constructor");
        super(position, hitPoints, radius);
        this.#sellValue = sellValue;
    }

    getSellValue() {
        return this.#sellValue;
    }
}

class CompositeObject {
    #rock;
    #mineral;
    #isScanned;

    constructor(rock, mineral = null) {
        if (!rock) throw new Error("No rock param passed in to CompositeObject constructor");
        this.#rock = rock;
        this.#mineral = mineral;
        this.#isScanned = true; // hard-coded to true until we're ready to implement Scanner upgrade
    }

    getRock() {
        return this.#rock;
    }

    getMineral() {
        return this.#mineral;
    }

    isScanned() {
        return this.#isScanned;
    }
}

export { SolidObject, Rock, Mineral, CompositeObject };