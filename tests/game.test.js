import { Game } from '../js/game.js';
import { Grid } from '../js/grid.js';
import { Graphics } from '../js/graphics.js';
import { Terrain } from '../js/terrain.js';
import { Ship } from '../js/ship.js';
import { BasicRock } from '../js/terrain.js';
import Position from '../js/position.js';

jest.mock('../js/graphics.js');
jest.mock('../js/grid.js');
jest.mock('../js/terrain.js');

describe('Game', () => {
  let game;
  let grid;
  let graphics;
  let terrain;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set up Grid mock
    Grid.mockImplementation(() => ({
      getLevelsWithGeneratedTerrain: jest.fn().mockReturnValue(new Set()),
      getCenteredInitialShipPosition: jest.fn().mockReturnValue(new Position(6, 6, 0)),
      setObject: jest.fn(),
      getGridSize: jest.fn().mockReturnValue(11),
      getObject: jest.fn(),
      removeObject: jest.fn(),
    }));

    // Set up Graphics mock
    Graphics.mockImplementation(() => ({
      updateStats: jest.fn(),
      displayGameOver: jest.fn(),
      clearPlayableArea: jest.fn(),
      drawGrid: jest.fn(),
    }));

    // Set up Terrain mock
    Terrain.mockImplementation(() => ({
      generate: jest.fn(),
    }));

    grid = new Grid();
    graphics = new Graphics();
    terrain = new Terrain();
    game = new Game(grid, graphics, terrain);
  });

  test('initializes game with correct initial state', () => {
    expect(game.grid).toBe(grid);
    expect(game.graphics).toBe(graphics);
    expect(game.terrain).toBe(terrain);
    expect(game.ship).toBeInstanceOf(Ship);
    expect(grid.setObject).toHaveBeenCalledWith(expect.any(Position), game.ship);
  });

  test('handleKeyPress responds to different keys correctly', () => {
    expect(game.handleKeyPress('ArrowUp')).toBe(true);
    expect(game.handleKeyPress('ArrowDown')).toBe(true);
    expect(game.handleKeyPress('ArrowLeft')).toBe(true);
    expect(game.handleKeyPress('ArrowRight')).toBe(true);
    expect(game.handleKeyPress('c')).toBe(true);
    expect(game.handleKeyPress(' ')).toBe(true);
    expect(game.handleKeyPress('x')).toBe(false);
  });

  test('updateGameState handles low battery condition', () => {
    game.ship.getBattery = jest.fn().mockReturnValue({ getLevel: jest.fn().mockReturnValue(0) });
    game.updateGameState();
    expect(graphics.displayGameOver).toHaveBeenCalled();
  });

  test('updateGameState generates new terrain when needed', () => {
    grid.getLevelsWithGeneratedTerrain.mockReturnValue(new Set());
    game.updateGameState();
    expect(terrain.generate).toHaveBeenCalled();
  });

  test('setupEventListeners attaches event listener to provided element', () => {
    const mockElement = { addEventListener: jest.fn() };
    game.setupEventListeners(mockElement);
    expect(mockElement.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});