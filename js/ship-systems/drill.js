export const DrillDirections = {
    CENTER: 'CENTER',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    UP: 'UP',
    DOWN: 'DOWN',
};

export class Drill {
    #strength; // how much damage the drill can do against drill-able objects
    #direction; // which cardinal direction the drill faces (or centered)

    constructor() {
        this.#strength = 100;
        this.#direction = DrillDirections.CENTER;
    }

    getStrength() {
        return this.#strength;
    }

    getDirection() {
        return this.#direction;
    }

    setDirection(direction) {
        this.#direction = direction;
    }
}
