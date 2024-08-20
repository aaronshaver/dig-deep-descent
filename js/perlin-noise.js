export class PerlinNoise {
    constructor() {
      this.p = this.generatePermutationTable();
      this.permutation = this.p.slice().concat(this.p);
      this.gradients = [
        [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
        [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
        [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
      ];
    }

    generatePermutationTable() {
      const p = Array.from({length: 256}, (_, i) => i);
      for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
      }
      return p;
    }

    dotGridGradient(ix, iy, iz, x, y, z) {
      const index = this.permutation[(this.permutation[ix] + iy) % 256] ^ iz;
      const gradient = this.gradients[index % 12];
      return gradient[0] * x + gradient[1] * y + gradient[2] * z;
    }

    smoothCurve(t) {
      return t * t * (3 - 2 * t);
    }

    get(x, y, z) {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const zi = Math.floor(z);
      const xf = x - xi;
      const yf = y - yi;
      const zf = z - zi;

      const ntt = this.smoothCurve(xf);
      const nbt = this.smoothCurve(yf);
      const fbt = this.smoothCurve(zf);

      const ntn = this.dotGridGradient(xi, yi, zi, xf, yf, zf);
      const nbb = this.dotGridGradient(xi, yi + 1, zi, xf, yf - 1, zf);
      const ftn = this.dotGridGradient(xi, yi, zi + 1, xf, yf, zf - 1);
      const fbb = this.dotGridGradient(xi, yi + 1, zi + 1, xf, yf - 1, zf - 1);

      const nty = ntn * (1 - yf) + nbb * yf;
      const fty = ftn * (1 - yf) + fbb * yf;
      const nfz = nty * (1 - zf) + fty * zf;

      return nfz * (1 - xf) + this.dotGridGradient(xi + 1, yi, zi, xf - 1, yf, zf) * xf;
    }
  }