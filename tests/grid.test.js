import { Grid } from '../js/grid.js';
import Position from '../js/position.js';

describe('Grid', () => {
  let grid;

  beforeEach(() => {
    grid = new Grid();
  });

  test('constructor initializes with default values', () => {
    expect(grid.getGridSize()).toBe(25);
    expect(grid.getCellSize()).toBe(30);
    expect(grid.getGridGap()).toBe(1);
    expect(grid.getLevelsWithGeneratedTerrain().size).toBe(0);
    expect(grid.levelExists(0)).toBe(true);
    expect(grid.getGridAtZLevel(0)).toBeDefined();
    expect(grid.getGridAtZLevel(0).length).toBe(25);
    expect(grid.getGridAtZLevel(0)[0].length).toBe(25);
  });

  test('createEmptyLevel creates empty level for new z', () => {
    grid.createEmptyLevel(1);
    const level = grid.getGridAtZLevel(1);
    expect(level).toBeDefined();
    expect(level.length).toBe(25);
    expect(level[0].length).toBe(25);
    expect(level.every(row => row.every(cell => cell === null))).toBe(true);
  });

  test('createEmptyLevel doesn\'t overwrite existing level', () => {
    const obj = {};
    grid.setObject(new Position(0, 0, 0), obj);
    grid.createEmptyLevel(0);
    expect(grid.getObject(new Position(0, 0, 0))).toBe(obj);
  });

  test('getLevelsWithGeneratedTerrain returns correct set', () => {
    grid.setTerrainAsGeneratedForLevel(1);
    const levels = grid.getLevelsWithGeneratedTerrain();
    expect(levels.size).toBe(1);
    expect(levels.has(1)).toBe(true);
  });

  test('setTerrainAsGeneratedForLevel adds new level', () => {
    grid.setTerrainAsGeneratedForLevel(1);
    expect(grid.getLevelsWithGeneratedTerrain().has(1)).toBe(true);
  });

  test('getGridSize returns correct size', () => {
    expect(grid.getGridSize()).toBe(25);
  });

  test('getCellSize returns correct cell size', () => {
    expect(grid.getCellSize()).toBe(30);
  });

  test('getGridGap returns correct grid gap', () => {
    expect(grid.getGridGap()).toBe(1);
  });

  test('getCenteredInitialShipPosition returns center position', () => {
    const center = grid.getCenteredInitialShipPosition();
    expect(center.x).toBe(12);
    expect(center.y).toBe(12);
    expect(center.z).toBe(0);
  });

  test('getObject returns correct object at position', () => {
    const obj = {};
    const pos = new Position(1, 1, 0);
    grid.setObject(pos, obj);
    expect(grid.getObject(pos)).toBe(obj);
  });

  test('getObject returns null for empty position', () => {
    const pos = new Position(1, 1, 0);
    expect(grid.getObject(pos)).toBeNull();
  });

  test('setObject places object correctly', () => {
    const obj = {};
    const pos = new Position(1, 1, 0);
    grid.setObject(pos, obj);
    expect(grid.getObject(pos)).toBe(obj);
  });

  test('setObject throws error for invalid input', () => {
    expect(() => grid.setObject(null, {})).toThrow('Invalid position or object');
    expect(() => grid.setObject(new Position(0, 0, 0), null)).toThrow('Invalid position or object');
  });

  test('removeObject removes object correctly', () => {
    const obj = {};
    const pos = new Position(1, 1, 0);
    grid.setObject(pos, obj);
    grid.removeObject(pos);
    expect(grid.getObject(pos)).toBeNull();
  });

  test('levelExists returns true for initialized level', () => {
    expect(grid.levelExists(0)).toBe(true);
  });

  test('levelExists returns false for uninitialized level', () => {
    expect(grid.levelExists(1)).toBe(false);
  });
});