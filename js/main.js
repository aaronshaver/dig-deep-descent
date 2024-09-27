import { Game } from './game.js';
import { Grid } from './grid.js';
import { Graphics } from './graphics.js';
import { TerrainGenerator } from './terrain-generator.js';
import { PerlinNoise } from './perlin-noise.js';
import { ZLevelDistribution } from '../js/z-level-distribution.js';

document.addEventListener('DOMContentLoaded', () => {
    const grid = new Grid();
    const graphics = new Graphics(grid);
    const terrainGenerator = new TerrainGenerator(new PerlinNoise(), new ZLevelDistribution());
    const game = new Game(grid, graphics, terrainGenerator);

    document.addEventListener('keydown', (e) => {
        if (game.gameOverReason) return;
        const changed = game.handleKeyPress(e.key);
        if (changed) {
            game.updateGameState();
        }
    });

    window.addEventListener('storageFull', graphics.showStorageWarning.bind(graphics));
});