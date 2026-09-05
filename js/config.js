export const VERSION = '0.3.0';
export const SIZE = 25;
export const CELL = 64;
export const DRILL_POWER = [24, 48, 90, 160, 280, 470, 760];
export const ORES = [
    { name: 'Ferrite', color: '#edaa79', value: 30 },
    { name: 'Silicate', color: '#b9dee2', value: 55 },
    { name: 'Cobalt', color: '#64aef4', value: 90 },
    { name: 'Amethyst', color: '#ba94e8', value: 140 },
    { name: 'Helium-3', color: '#e8ce7b', value: 210 },
    { name: 'Cryonite', color: '#69e9d4', value: 290 },
    { name: 'Void opal', color: '#ea98d1', value: 420 },
];
export const UPGRADES = {
    drill: { name: 'Drill assembly', detail: 'Much more damage per hit and faster drilling. Unlock 30 m more depth per tier.', base: 130, max: 6 },
    battery: { name: 'Reactor cell', detail: 'Carry 100 more energy per tier. Longer dives, safer returns.', base: 110, max: 6 },
    storage: { name: 'Cargo expansion', detail: 'Carry 8 more mineral samples per tier.', base: 100, max: 6 },
    hull: { name: 'Pressure plating', detail: 'Add 30 hull integrity and reduce environmental damage.', base: 140, max: 6 },
};
export const MODULES = {
    balanced: { name: 'Standard issue', detail: 'Reliable systems. No special tradeoffs.' },
    prospector: { name: 'Prospector', detail: 'Minerals sell for 25% more. Maximum hull reduced by 20.' },
    ghost: { name: 'Ghost drive', detail: 'Movement uses 40% less energy. Drilling generates 30% more heat.' },
    bastion: { name: 'Bastion', detail: 'Hazard damage reduced by 35%. Cargo capacity reduced by 3.' },
};
export const LOGS = [
    { depth: 5, title: '01 / The knocking', text: 'SHIFT 114. The survey team keeps reporting knocks from beneath the basalt. Three taps. A pause. Three taps. The company says it is thermal expansion. Thermal expansion does not wait for you to answer.' },
    { depth: 10, title: '02 / An empty channel', text: 'SHIFT 128. We disconnected the antenna. The voice stayed. It reads our old departure manifests, one name at a time. Yesterday it reached the name of someone who has not arrived yet.' },
    { depth: 15, title: '03 / Not a distress call', text: 'SHIFT 131. The pulse is a map. We thought someone was asking to be rescued. Now I think the machinery above us was built to keep something asleep. Do not bring it to the surface.' },
    { depth: 20, title: '04 / The listener', text: 'UNREGISTERED TRANSMISSION. You have come a very long way to hear your own heartbeat. We kept it safe for you. We kept all of them safe. The signal folds inward. For the first time since you landed, the moon is silent.' },
];
export const HAZARDS = {
    gas: { name: 'Volatile gas', appearance: 'Drifting yellow-green vapor marks an explosive gas pocket. Mineral crystals alone are not a hazard.', consequence: 'Breaking open the rock or entering the pocket ignites it, causing immediate hull damage and heat.', advice: 'Scan with Q to mark gas pockets. Choose a different route, or upgrade hull plating before taking the hit. The gas burns away after one explosion.' },
    unstable: { name: 'Unstable ground', appearance: 'Amber fractures and a dashed boundary mark ground beneath a weakened cave ceiling.', consequence: 'Entering triggers a cave-in after 1.7 seconds. Falling rocks damage everything within the warning circle.', advice: 'Move at least two cells away as soon as the warning appears. The collapse leaves rubble you can drill through later.' },
    lava: { name: 'Lava exposure', appearance: 'Bright orange molten pools are exposed lava. Glowing orange mineral crystals are safe to mine.', consequence: 'Lava continuously damages your hull and heats the drill while your ship stays on it.', advice: 'Go around it when possible. If you cross, keep moving. Hull plating reduces the damage, but does not make you immune.' },
};
export function biome(depth) {
    if (depth === 0) return { name: 'The surface', subtitle: 'SELENE-9 / LANDING ZONE', color: '#8b857d', risk: 'NOMINAL' };
    if (depth < 4) return { name: 'The regolith', subtitle: 'FRACTURED SILICATE', color: '#80756a', risk: 'LOW' };
    if (depth < 8) return { name: 'Hollow earth', subtitle: 'UNSTABLE CAVERN NETWORK', color: '#657b78', risk: 'ELEVATED' };
    if (depth < 13) return { name: 'The furnace', subtitle: 'GEOTHERMAL FAULT', color: '#856958', risk: 'HIGH' };
    if (depth < 18) return { name: 'Black cathedral', subtitle: 'UNCLASSIFIED FORMATION', color: '#6e6882', risk: 'SEVERE' };
    return { name: 'The listener', subtitle: 'SIGNAL ORIGIN', color: '#626f81', risk: 'UNKNOWN' };
}
export function random(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// As in the original game, hardness belongs to the surrounding rock matrix,
// independently of the mineral it contains. A rich vein may be an easy find.
export function rockHitPoints(depth, density = 1, variation = .5) {
    const matrix = 38 + depth * 13 + variation * (16 + depth * 4);
    return Math.round(matrix * density);
}
