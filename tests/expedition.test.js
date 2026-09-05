import { Expedition } from '../js/expedition.js';
import { World } from '../js/world.js';
import { validateSave, readSave, writeSave } from '../js/persistence.js';
import { ZLevelDistribution } from '../js/z-level-distribution.js';
import { rockHitPoints } from '../js/config.js';

const fresh = () => new Expedition({seed: 12345});
function step(game, action, dt = .2) { game.tick(dt); return game.action(action); }
function target(game, patch) { const s=game.state;const cell=game.world.cell(s.depth,s.x+1,s.y);game.world.change(s.depth,cell,patch);return cell; }

describe('Expedition mining and resource rules', () => {
    test('battery warnings escalate, repeat without toast spam, and reset after servicing', () => {
        const game=fresh();game.state.energy=80;game.tick(.1);
        expect(game.events.some(e=>e.type==='lowEnergy')).toBe(true);const notices=game.events.filter(e=>e.type==='message').length;
        game.tick(22);expect(game.events.filter(e=>e.type==='lowEnergy')).toHaveLength(2);
        expect(game.events.filter(e=>e.type==='message')).toHaveLength(notices);
        game.state.energy=30;game.tick(.1);expect(game.events.some(e=>e.type==='criticalEnergy')).toBe(true);
        game.service();game.tick(.1);expect(game.energyWarningBand).toBe(0);
    });
    test('spending the final energy on a scan ends the run immediately', () => {
        const game=fresh();game.state.energy=5;game.action('scan');expect(game.state.lost).toBe(true);expect(game.state.lossCause).toBe('power');
    });
    test('return warnings account for boring all the way to the surface and trigger with energy to spare', () => {
        const game=fresh();game.state.depth=12;game.state.energy=165;
        for(let d=1;d<=12;d++)game.world.change(d,game.world.cell(d,12,12),{shaftUp:false});
        expect(game.ascentCost).toBe(127);expect(game.energyStatus.band).toBe(1);game.tick(.1);
        expect(game.events.some(e=>e.type==='lowEnergy')).toBe(true);
        for(let i=0;i<12;i++)expect(step(game,'ascend',1)).toBe(true);
        expect(game.state.lost).toBe(false);expect(game.state.depth).toBe(0);expect(game.state.energy).toBe(game.stats.energy);
    });
    test('ascent estimate updates for mixed shafts, boring new connections and moving away from them', () => {
        const game=fresh();game.state.depth=5;
        for(let d=1;d<=5;d++)game.world.change(d,game.world.cell(d,12,12),{shaftUp:true});
        expect(game.ascentCost).toBe(10);
        game.world.change(3,game.world.cell(3,12,12),{shaftUp:false});expect(game.ascentCost).toBe(17);
        game.state.x=13;expect(game.ascentCost).toBeGreaterThan(17);
    });
    test('depth and host rock density determine hardness, independently of mineral value', () => {
        expect(rockHitPoints(10,1)).toBeGreaterThan(rockHitPoints(1,1));
        expect(rockHitPoints(10,1.76)).toBeGreaterThan(rockHitPoints(10,1));
        const strikes=ore=>{
            const game=fresh(),hp=rockHitPoints(0,1);
            target(game,{solid:true,hp,maxHp:hp,ore,hazard:null});
            let hits=0;while(game.state.x===12){game.tick(1);game.action('right');hits++;}return hits;
        };
        expect(strikes(6)).toBe(strikes(0));
    });
    test('a drill upgrade makes a rich deposit take fewer strikes and less energy', () => {
        const mine = tier => {
            const game=fresh();game.state.tiers.drill=tier;
            target(game,{solid:true,hp:rockHitPoints(3,1.38),maxHp:rockHitPoints(3,1.38),ore:3,hazard:null});
            let hits=0;while(game.state.x===12&&hits<100){game.tick(1);game.action('right');hits++;}
            return {hits,energy:game.state.energy,cargo:game.state.cargo};
        };
        const basic=mine(0),upgraded=mine(2);expect(upgraded.hits).toBeLessThan(basic.hits);expect(upgraded.energy).toBeGreaterThan(basic.energy);expect(upgraded.cargo).toEqual([3]);
    });
    test('upgrades visibly outpace earlier rock: first tier one-hits starter ore, tier four clears earlier dense rock', () => {
        const game=fresh();game.state.tiers.drill=1;
        const starter=game.world.cell(0,15,12);expect(Math.ceil(starter.hp/game.stats.power)).toBe(1);
        const earlierDense=rockHitPoints(6,1.38);game.state.tiers.drill=0;const initialHits=Math.ceil(earlierDense/game.stats.power);
        game.state.tiers.drill=3;expect(Math.ceil(earlierDense/game.stats.power)).toBeLessThanOrEqual(2);
        expect(initialHits).toBeGreaterThanOrEqual(6);
    });
    test('mining animates every strike and collects ore without requiring a scan', () => {
        const game=fresh();const rock=target(game,{solid:true,hp:42,maxHp:42,ore:0,hazard:null});
        game.action('right');expect(rock.hp).toBe(18);expect(game.state.x).toBe(12);
        expect(game.events.filter(e=>e.type==='dig')).toHaveLength(1);
        step(game,'right');expect(game.state.x).toBe(13);expect(rock.solid).toBe(false);expect(game.state.cargo).toEqual([0]);
        expect(game.events.filter(e=>e.type==='dig')).toHaveLength(2);
    });
    test('full cargo preserves the mineral and does not spend energy on a rejected final hit', () => {
        const game=fresh();game.state.cargo=Array(12).fill(0);
        const rock=target(game,{solid:true,hp:10,maxHp:42,ore:1});
        const energy=game.state.energy;game.action('right');expect(rock.hp).toBe(10);expect(rock.ore).toBe(1);expect(game.state.energy).toBe(energy);
    });
    test('heat stops continuous drilling and cools without consuming idle energy', () => {
        const game=fresh();target(game,{solid:true,hp:999,maxHp:999,ore:null});game.state.heat=98;
        expect(game.action('right')).toBe(false);const energy=game.state.energy;game.tick(2);
        expect(game.state.heat).toBe(72);expect(game.state.energy).toBe(energy);expect(game.action('right')).toBe(true);
    });
    test('scanning uses a cooldown and reveals distant cells', () => {
        const game=fresh();game.action('scan');const energy=game.state.energy;
        expect(game.world.cell(0,20,12).scanned).toBe(true);expect(game.action('scan')).toBe(false);expect(game.state.energy).toBe(energy);
        game.tick(4);expect(game.action('scan')).toBe(true);
    });
    test('bounds do not consume resources or move the ship', () => {
        const game=fresh();game.state.x=0;expect(game.action('left')).toBe(false);expect(game.state.energy).toBe(320);
    });
});
describe('Shop and progression', () => {
    test.each([[0,0],[24,24],[12,3]])('orbital trade is available anywhere on the surface at %i,%i', (x,y) => {
        const game=fresh();game.state.x=x;game.state.y=y;game.state.cargo=[0,0,0,0];
        expect(game.sell()).toBe(true);expect(game.buy('drill')).toBe(true);
    });
    test('first shipment funds the first drill upgrade, rewards are paid once', () => {
        const game=fresh();game.state.cargo=[0,0,0,0];expect(game.sell()).toBe(true);expect(game.state.credits).toBe(220);
        expect(game.buy('drill')).toBe(true);expect(game.state.credits).toBe(90);expect(game.stats.power).toBe(48);expect(game.stats.maxDepth).toBe(6);
        game.contracts();expect(game.state.credits).toBe(90);expect(game.sell()).toBe(false);
    });
    test.each(['drill','battery','storage','hull'])('%s purchase changes capacity and cannot exceed tier cap', id => {
        const game=fresh();game.state.credits=100000;
        for(let i=0;i<6;i++)expect(game.buy(id)).toBe(true);
        expect(game.state.tiers[id]).toBe(6);const balance=game.state.credits;expect(game.buy(id)).toBe(false);expect(game.state.credits).toBe(balance);
    });
    test('rejects unaffordable and underground transactions', () => {
        const game=fresh();expect(game.buy('battery')).toBe(false);expect(game.buy('unknown')).toBe(false);
        game.state.credits=1000;game.state.depth=1;game.state.cargo=[2];expect(game.buy('drill')).toBe(false);expect(game.sell()).toBe(false);expect(game.dock()).toBe(false);
    });
    test('descent is limited by drill rating and quick transitions block repeated actions', () => {
        const game=fresh();expect(game.action('descend')).toBe(true);expect(game.action('descend')).toBe(false);
        step(game,'descend',1);step(game,'descend',1);expect(game.state.depth).toBe(3);
        expect(step(game,'descend',1)).toBe(false);expect(game.state.depth).toBe(3);
    });
    test('ascension is inexpensive and services the ship at the surface', () => {
        const game=fresh();game.action('descend');game.state.energy=12;game.state.hull=30;
        step(game,'ascend',1);expect(game.state.depth).toBe(0);expect(game.state.energy).toBe(320);expect(game.state.hull).toBe(100);expect(game.events.some(e=>e.type==='dock')).toBe(true);
    });
    test('vertical entry never grants free ore and clears arrival hazards', () => {
        const game=fresh();const cell=game.world.cell(1,12,12);game.world.change(1,cell,{solid:true,ore:6,hazard:'gas'});
        game.action('descend');expect(cell.solid).toBe(false);expect(cell.hazard).toBe(null);expect(game.state.cargo).toHaveLength(0);
    });
    test('experimental modules are locked until a record is found; reduced storage never discards cargo', () => {
        const game=fresh();expect(game.fit('prospector')).toBe(false);game.state.recovered=[0];expect(game.fit('prospector')).toBe(true);
        expect(game.stats.hull).toBe(80);game.state.cargo=[0,0,0,0];expect(game.cargoValue).toBe(150);
        game.state.cargo=Array(12).fill(0);expect(game.fit('bastion')).toBe(false);expect(game.state.cargo).toHaveLength(12);
    });
    test('all records complete the mystery even when recovered out of order', () => {
        const game=fresh();game.state.recovered=[0,1,3];game.state.depth=15;
        const relic=game.world.level(15).find(c=>c.relic);game.enter(relic);
        expect(game.state.recovered).toHaveLength(4);expect(game.state.completed).toBe(true);expect(game.state.milestones).toContain('signal');
        const credits=game.state.credits;game.enter(relic);expect(game.state.credits).toBe(credits);
    });
});
describe('Hazards and permadeath', () => {
    test('first contact warns and pauses before any damage; the warning is only shown once per hazard', () => {
        const game=fresh();game.state.depth=6;target(game,{solid:false,hazard:'gas',ore:null});
        expect(game.action('right')).toBe(false);expect(game.state.hull).toBe(100);expect(game.state.x).toBe(12);
        expect(game.events.some(e=>e.type==='tutorial'&&e.hazard==='gas')).toBe(true);
        expect(game.state.tutorials).toContain('gas');game.action('right');expect(game.state.hull).toBe(70);
        expect(game.state.lastDamage).toBe('gas');
    });
    test('gas explodes once and consumes the pocket', () => {
        const game=fresh();game.state.depth=6;game.state.tutorials=['gas'];const cell=target(game,{solid:false,hazard:'gas',ore:null});
        game.action('right');expect(game.state.hull).toBe(70);expect(cell.hazard).toBe(null);expect(game.events.some(e=>e.type==='explosion')).toBe(true);
    });
    test('collapse warns before damage and escaping avoids the impact', () => {
        const game=fresh();game.state.depth=4;game.state.tutorials=['unstable'];const cell=target(game,{solid:false,hazard:'unstable',ore:null});
        game.action('right');expect(game.pending).toHaveLength(1);game.tick(1);expect(game.state.hull).toBe(100);
        game.state.x+=3;game.tick(.8);expect(game.state.hull).toBe(100);expect(cell.solid).toBe(true);expect(game.pending).toHaveLength(0);
    });
    test('remaining in a collapse causes damage but never embeds ship in rubble', () => {
        const game=fresh();game.state.depth=4;game.state.tutorials=['unstable'];const cell=target(game,{solid:false,hazard:'unstable',ore:null});game.action('right');game.tick(1.8);
        expect(game.state.hull).toBe(64);expect(cell.solid).toBe(false);
    });
    test('lava damage scales with elapsed time; leaving it stops damage', () => {
        const game=fresh();game.state.depth=8;game.state.tutorials=['lava'];target(game,{solid:false,hazard:'lava',ore:null});game.action('right');game.tick(1);
        expect(game.state.hull).toBeCloseTo(84.4);game.state.x--;const hull=game.state.hull;
        game.world.change(8,game.world.cell(8,game.state.x,game.state.y),{hazard:null});game.tick(1);expect(game.state.hull).toBe(hull);
    });
    test('zero power ends the run and blocks every resource transaction', () => {
        const game=fresh();game.state.credits=300;game.buy('drill');game.state.cargo=[1,2];
        game.world.change(0,game.world.cell(0,15,12),{solid:false,ore:null});
        game.state.energy=0;game.checkLoss();
        expect(game.action('right')).toBe(false);expect(game.state.lost).toBe(true);expect(game.state.lossCause).toBe('power');
        expect(game.buy('storage')).toBe(false);expect(game.sell()).toBe(false);expect(game.dock()).toBe(false);
        const next=new Expedition();expect(next.state.credits).toBe(0);expect(next.state.tiers.drill).toBe(0);expect(next.state.cargo).toEqual([]);expect(next.world.changes).not.toEqual(game.world.changes);
    });
    test('fatal gas damage reports the actual cause of death', () => {
        const game=fresh();game.state.depth=6;game.state.tutorials=['gas'];game.state.hull=10;target(game,{solid:false,hazard:'gas',ore:null});
        game.action('right');expect(game.state.lost).toBe(true);expect(game.state.lossCause).toBe('gas');
    });
});
describe('World and persistence', () => {
    test('boring creates paired shafts and retracing them saves energy and time', () => {
        const game=fresh();const newCost=game.verticalCost(1);game.action('descend');
        expect(game.world.cell(0,12,12).shaftDown).toBe(true);expect(game.world.cell(1,12,12).shaftUp).toBe(true);
        expect(game.verticalCost(-1)).toBe(2);step(game,'ascend',1);
        expect(game.verticalCost(1)).toBe(2);expect(newCost).toBeGreaterThan(2);
        step(game,'descend',1);expect(game.transition).toBe(.32);
        expect(game.events.filter(e=>e.type==='depth').map(e=>e.reused)).toEqual([false,true,true]);
        const restored=new Expedition(JSON.parse(JSON.stringify(game.snapshot())));
        expect(restored.world.cell(0,12,12).shaftDown).toBe(true);expect(restored.verticalCost(-1)).toBe(2);
    });
    test('natural shafts connect both levels regardless of generation order', () => {
        const world=new World(555);const [x,y]=world.naturalShafts(7)[0];
        expect(world.cell(8,x,y).shaftUp).toBe(true);expect(world.cell(7,x,y).shaftDown).toBe(true);
        expect(world.cell(7,x,y).solid).toBe(false);expect(world.cell(8,x,y).hazard).toBe(null);
    });
    test('natural shafts have varied lengths and remain connected through intermediate strata', () => {
        const world=new World(991);const lengths=new Set(world.shaftNetworks.map(n=>n.bottom-n.top));
        expect(lengths.size).toBeGreaterThanOrEqual(3);
        const shaft=world.shaftNetworks.find(n=>n.bottom-n.top>=4);
        for(let d=shaft.top;d<shaft.bottom;d++){
            expect(world.cell(d,shaft.x,shaft.y).shaftDown).toBe(true);
            expect(world.cell(d+1,shaft.x,shaft.y).shaftUp).toBe(true);
        }
    });
    test('reusing a natural shaft retains drill depth safety gates', () => {
        const game=fresh();game.state.depth=3;const [x,y]=game.world.naturalShafts(3)[0];game.state.x=x;game.state.y=y;
        expect(game.verticalCost(1)).toBe(2);expect(game.action('descend')).toBe(false);expect(game.state.depth).toBe(3);
    });
    test('world generation is deterministic, depth changes terrain and early strata are safe', () => {
        const a=new World(37),b=new World(37);expect(a.level(2)).toEqual(b.level(2));expect(a.level(2)).not.toEqual(a.level(3));
        for(let depth=0;depth<4;depth++)expect(a.level(depth).every(c=>c.hazard===null)).toBe(true);
        expect(a.level(8).some(c=>c.hazard==='lava')).toBe(true);
    });
    test('starting area guarantees accessible ferrite for an upgrade', () => {
        const world=new World(1);expect(world.cell(0,12,12).solid).toBe(false);
        expect(world.level(0).filter(c=>c.ore===0&&Math.hypot(c.x-12,c.y-12)<5).length).toBeGreaterThanOrEqual(8);
    });
    test('save round-trip preserves mined terrain, state and pending hazards', () => {
        const game=fresh();const cell=target(game,{solid:true,hp:12,ore:0});game.action('right');
        game.pending.push({x:3,y:4,depth:4,time:1.2});const snap=JSON.parse(JSON.stringify(game.snapshot()));expect(validateSave(snap)).toBe(true);
        const restored=new Expedition(snap);expect(restored.state).toEqual(game.state);expect(restored.world.cell(0,cell.x,cell.y).solid).toBe(false);expect(restored.pending).toEqual(game.pending);
    });
    test('malformed saves and unavailable storage fail safely', () => {
        const snapshot=fresh().snapshot();expect(validateSave(null)).toBe(false);snapshot.state.tiers.drill=100;expect(validateSave(snapshot)).toBe(false);
        expect(readSave({getItem:()=>'{broken'}).data).toBe(null);expect(writeSave(null,fresh())).toBe(false);
        const bad=fresh().snapshot();bad.changes={0:{'__proto__':{}}};bad.state.cargo=['bad'];expect(validateSave(bad)).toBe(false);
    });
    test('distribution remains valid at and beyond deepest original stratum', () => {
        const dist=new ZLevelDistribution();expect(()=>dist.getObjectProbabilities(199)).not.toThrow();expect(()=>dist.getObjectProbabilities(1000)).not.toThrow();
    });
});
