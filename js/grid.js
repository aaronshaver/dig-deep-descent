import { Rocks } from './rocks.js';

export class Grid {
    constructor(size, cellSize, gridGap) {
        this.size = size;
        this.cellSize = cellSize;
        this.gridGap = gridGap;
    }

    draw(ctx, canvasWidth, canvasHeight) {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#222';
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const x = col * (this.cellSize + this.gridGap);
                const y = row * (this.cellSize + this.gridGap);
                ctx.fillRect(x, y, this.cellSize, this.cellSize);
            }
        }
        this.rocks.drawRocks(ctx, this.cellSize, this.gridGap);
    }
}