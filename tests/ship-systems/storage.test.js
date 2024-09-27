/**
 * @jest-environment jsdom
 */

import { Storage } from '../../js/ship-systems/storage.js';
import { Mineral } from '../../js/solid-objects.js';
import Position from '../../js/position.js';

describe('Storage', () => {
    test('returns expected default size', () => {
        const storage = new Storage();
        expect(storage.getFreeSpace()).toBe(100);
    });

    test('is able to store a mineral', () => {
        const mineral = new Mineral("Red Mineral", new Position(1, 2, 3), 0.44, 100);
        const storage = new Storage();
        storage.addMineral(mineral);
        expect(storage.getMinerals()).toEqual([mineral]);
    });

    test('reduces free space when mineral is added', () => {
        const mineral = new Mineral("Red Mineral", new Position(1, 2, 3), 0.44, 100);
        const storage = new Storage();
        expect(storage.getFreeSpace()).toBe(100);
        storage.addMineral(mineral);
        expect(storage.getFreeSpace()).toBe(90);
    });

    test('throws error if no Mineral passed to addMineral', () => {
        const storage = new Storage();
        expect(() => {
            storage.addMineral();
        }).toThrow('No Mineral passed in to addMineral');
    });

    test('when full: does not reduce free space when Mineral is added, nor add the Mineral', () => {
        const mineral = new Mineral("Red Mineral", new Position(1, 2, 3), 0.44, 100);
        const storage = new Storage();
        expect(storage.getFreeSpace()).toBe(100);
        expect(storage.getMinerals()).toEqual([]);
        for (let i = 0; i < 10; i++) {
            storage.addMineral(mineral);
        }
        expect(storage.getFreeSpace()).toBe(0);
        storage.addMineral(mineral);
        expect(storage.getFreeSpace()).toBe(0);
        expect(storage.getMinerals().length).toEqual(10);
    });
});