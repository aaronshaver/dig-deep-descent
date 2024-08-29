class Position {
    #x;
    #y;
    #z;

    constructor(x = 0, y = 0, z = 0) {
        this.#x = x;
        this.#y = y;
        this.#z = z;
    }

    get x() { return this.#x; }
    set x(value) { this.#x = value; }

    get y() { return this.#y; }
    set y(value) { this.#y = value; }

    get z() { return this.#z; }
    set z(value) { this.#z = value; }
}

export default Position;