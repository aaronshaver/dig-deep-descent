export class Player {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    draw(ctx, cellSize, gridGap) {
        const x = this.x * (cellSize + gridGap);
        const y = this.y * (cellSize + gridGap);
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        const radius = cellSize / 2 - 2;

        ctx.fillStyle = '#4477AA';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#66AAFF';
        ctx.fillRect(x + 4, y + 2, cellSize - 8, 3);
        ctx.fillRect(x + 4, y + cellSize - 5, cellSize - 8, 3);

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}