class Position {
    #x;
    #y;
    #z;

    constructor(x, y, z) {
        Object.defineProperties(this, {
          x: { value: x, writable: false },
          y: { value: y, writable: false },
          z: { value: z, writable: false }
        });
      }

    get x() { return this.#x; }
    set x(value) { this.#x = value; }

    get y() { return this.#y; }
    set y(value) { this.#y = value; }

    get z() { return this.#z; }
    set z(value) { this.#z = value; }
}

export default Position;