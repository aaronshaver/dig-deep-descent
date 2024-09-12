import { Game } from '../js/game.js';
import { Grid } from '../js/grid.js';
import { Graphics } from '../js/graphics.js';
import { Terrain } from '../js/terrain.js';
import { Ship } from '../js/ship.js';
import { BasicRock } from '../js/terrain.js';
import Position from '../js/position.js';
import { BatteryEvents } from '../js/battery.js';

jest.mock('../js/graphics.js');
jest.mock('../js/grid.js');
jest.mock('../js/terrain.js');
jest.mock('../js/ship.js');

describe('Game', () => {
  let game;
  let mockGrid;
  let mockGraphics;
  let mockTerrain;
  let mockShip;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGrid = {
      getLevelsWithGeneratedTerrain: jest.fn().mockReturnValue(new Set()),
      getCenteredInitialShipPosition: jest.fn().mockReturnValue(new Position(5, 5, 0)),
      setObject: jest.fn(),
      getGridSize: jest.fn().mockReturnValue(11),
      getObject: jest.fn(),
      removeObject: jest.fn(),
    };
    Grid.mockImplementation(() => mockGrid);

    mockGraphics = {
      updateStats: jest.fn(),
      displayGameOver: jest.fn(),
      clearPlayableArea: jest.fn(),
      drawGrid: jest.fn(),
    };
    Graphics.mockImplementation(() => mockGraphics);

    mockTerrain = {
      generate: jest.fn(),
    };
    Terrain.mockImplementation(() => mockTerrain);

    mockShip = {
      getPosition: jest.fn().mockReturnValue(new Position(5, 5, 0)),
      setPosition: jest.fn(),
      getBattery: jest.fn().mockReturnValue({
        getLevel: jest.fn().mockReturnValue(1000),
        reduceBattery: jest.fn(),
      }),
      getDrill: jest.fn().mockReturnValue({
        setDirection: jest.fn(),
        getStrength: jest.fn().mockReturnValue(100),
      }),
    };
    Ship.mockImplementation(() => mockShip);

    game = new Game(mockGrid, mockGraphics, mockTerrain);
  });

  test('initializes game with correct initial state', () => {
    expect(game.grid).toBe(mockGrid);
    expect(game.graphics).toBe(mockGraphics);
    expect(game.terrain).toBe(mockTerrain);
    expect(game.ship).toBeDefined();
    expect(mockGrid.setObject).toHaveBeenCalledWith(expect.any(Position), game.ship);
  });

  test('moves ship to empty adjacent cell', () => {
    mockGrid.getObject.mockReturnValue(null);
    const initialPosition = game.ship.getPosition();
    game.handleKeyPress('ArrowRight');
    expect(mockShip.setPosition).toHaveBeenCalledWith(expect.objectContaining({
      x: initialPosition.x + 1,
      y: initialPosition.y,
      z: initialPosition.z
    }));
  });

  test('attempts to move ship into cell with BasicRock', () => {
    const rockPosition = new Position(6, 5, 0);
    const mockRock = new BasicRock(rockPosition);
    mockRock.getHitPoints = jest.fn().mockReturnValue(100);
    mockGrid.getObject.mockReturnValue(mockRock);

    game.handleKeyPress('ArrowRight');
    expect(mockShip.setPosition).not.toHaveBeenCalled();
  });

  test('destroys BasicRock and moves into its cell', () => {
    const rockPosition = new Position(6, 5, 0);
    const mockRock = new BasicRock(rockPosition);
    mockRock.getHitPoints = jest.fn().mockReturnValue(0);
    mockGrid.getObject.mockReturnValue(mockRock);

    game.handleKeyPress('ArrowRight');
    expect(mockShip.setPosition).toHaveBeenCalledWith(rockPosition);
    expect(mockGrid.removeObject).toHaveBeenCalledWith(rockPosition);
  });

  test('drains battery correctly during lateral movement', () => {
    mockGrid.getObject.mockReturnValue(null);
    game.handleKeyPress('ArrowRight');
    expect(mockShip.getBattery().reduceBattery).toHaveBeenCalledWith(BatteryEvents.LATERAL_MOVE);
  });

  test('drains battery correctly when destroying BasicRock', () => {
    const rockPosition = new Position(6, 5, 0);
    const mockRock = new BasicRock(rockPosition);
    mockRock.getHitPoints = jest.fn().mockReturnValue(0);
    mockGrid.getObject.mockReturnValue(mockRock);

    game.handleKeyPress('ArrowRight');
    expect(mockShip.getBattery().reduceBattery).toHaveBeenCalledWith(BatteryEvents.DIG_BASIC_ROCK);
    expect(mockShip.getBattery().reduceBattery).toHaveBeenCalledWith(BatteryEvents.LATERAL_MOVE);
  });

  test('handles game over when battery depletes', () => {
    mockShip.getBattery().getLevel.mockReturnValue(0);
    game.updateGameState();
    expect(mockGraphics.displayGameOver).toHaveBeenCalled();
  });

  test('handleKeyPress happy path cases where movement occurs', () => {
    mockGrid.getObject.mockReturnValue(null);
    expect(game.handleKeyPress('ArrowUp')).toBe(true);
    expect(game.handleKeyPress('ArrowDown')).toBe(true);
    expect(game.handleKeyPress('ArrowLeft')).toBe(true);
    expect(game.handleKeyPress('ArrowRight')).toBe(true);
    expect(game.handleKeyPress('w')).toBe(true);
    expect(game.handleKeyPress('a')).toBe(true);
    expect(game.handleKeyPress('s')).toBe(true);
    expect(game.handleKeyPress('d')).toBe(true);
    expect(game.handleKeyPress('c')).toBe(true);

    // Mock the ship's initial position to be below the surface
    mockShip.getPosition.mockReturnValue(new Position(5, 5, -1));
    expect(game.handleKeyPress(' ')).toBe(true);
    // Test that it returns false when trying to rise above the surface
    mockShip.getPosition.mockReturnValue(new Position(5, 5, 0));
    expect(game.handleKeyPress(' ')).toBe(false);

    expect(game.handleKeyPress('*')).toBe(false); // unsupported key
  });

  test('handleKeyPress sad path case where movement does not occur', () => {
    mockGrid.getObject.mockReturnValue(null);
    mockShip.getPosition.mockReturnValue(new Position(0, 0, 0));
    expect(game.handleKeyPress('ArrowUp')).toBe(false);
    expect(game.handleKeyPress('ArrowLeft')).toBe(false);
  });

  test('updateGameState generates new terrain when needed', () => {
    mockGrid.getLevelsWithGeneratedTerrain.mockReturnValue(new Set());
    game.updateGameState();
    expect(mockTerrain.generate).toHaveBeenCalled();
  });

  test('setupEventListeners attaches event listener to provided element', () => {
    const mockElement = { addEventListener: jest.fn() };
    game.setupEventListeners(mockElement);
    expect(mockElement.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  test('setupEventListeners correctly handles keydown events', () => {
    const mockElement = { addEventListener: jest.fn() };
    game.setupEventListeners(mockElement);

    // Verify that the event listener was added
    expect(mockElement.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));

    // Get the event handler function
    const eventHandler = mockElement.addEventListener.mock.calls[0][1];

    // Create a mock event
    const mockEvent = { key: 'ArrowRight' };

    // Call the event handler
    eventHandler(mockEvent);

    // Verify that the game state was updated
    expect(mockGraphics.updateStats).toHaveBeenCalled();
    expect(mockGraphics.clearPlayableArea).toHaveBeenCalled();
    expect(mockGraphics.drawGrid).toHaveBeenCalled();
  });
});