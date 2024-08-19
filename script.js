document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const gridSize = 27;
    const cellSize = 30;
    const gridGap = 1;

    canvas.width = gridSize * (cellSize + gridGap) - gridGap;
    canvas.height = canvas.width;

    function drawGrid() {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#222';
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = col * (cellSize + gridGap);
                const y = row * (cellSize + gridGap);
                ctx.fillRect(x, y, cellSize, cellSize);

                // // Draw a period in each cell
                // ctx.fillStyle = '#ddd';
                // ctx.font = '12px Arial';
                // ctx.textAlign = 'center';
                // ctx.textBaseline = 'middle';
                // ctx.fillText('.', x + cellSize / 2, y + cellSize / 2);
                // ctx.fillStyle = '#222';
            }
        }
    }

    drawGrid();
});