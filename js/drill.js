export const DrillDirections = {
    CENTER: 'CENTER',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    UP: 'UP',
    DOWN: 'DOWN',
};

export class Drill {
    #power;
    #direction;

    constructor() {
        this.#power = 100;
        this.#direction = DrillDirections.CENTER;
    }

    getPower() {
        return this.#power;
    }

    getDirection() {
        return this.#direction;
    }

    setDirection(direction) {
        this.#direction = direction;
    }
}
