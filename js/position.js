class Position {
  constructor(x, y, z) {
      Object.defineProperties(this, {
        x: { value: x, writable: false }, // immutable values
        y: { value: y, writable: false },
        z: { value: z, writable: false }
      });
  }
}

export default Position;