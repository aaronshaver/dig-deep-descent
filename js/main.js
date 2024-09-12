import { Game } from './game.js';
import { Grid } from './grid.js';
import { Graphics } from './graphics.js';
import { Terrain } from './terrain.js';

// we separate out DOM stuff because otherwise Jest tests get mad because of conflicting implementation DOM vs test DOM
document.addEventListener('DOMContentLoaded', () => {
    const grid = new Grid();
    const graphics = new Graphics(grid);
    const terrain = new Terrain();
    const game = new Game(grid, graphics, terrain);

    document.addEventListener('keydown', (e) => {
        if (game.gameOverReason) return;
        const changed = game.handleKeyPress(e.key);
        if (changed) {
            game.updateGameState();
        }
    });
});