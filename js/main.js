import { Game } from './game.js';
import { Grid } from './grid.js';
import { Graphics } from './graphics.js';
import { Terrain } from './terrain.js';

// we separate out DOM stuff because otherwise Jest tests get mad because of conflicting implementation vs test DOMs
document.addEventListener('DOMContentLoaded', () => {
    const grid = new Grid();
    const graphics = new Graphics(grid);
    const terrain = new Terrain();
    const game = new Game(grid, graphics, terrain);
    game.setupEventListeners(document);
});