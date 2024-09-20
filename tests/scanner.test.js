import { Scanner } from '../js/ship-systems/scanner.js';

describe('Scanner', () => {
    test('returns expected default range', () => {
        const scanner = new Scanner();
        expect(scanner.getRange()).toBe(2);
    });
});