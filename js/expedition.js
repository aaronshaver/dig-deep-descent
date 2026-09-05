import { World } from './world.js';
import { UPGRADES, ORES, LOGS, MODULES, DRILL_POWER } from './config.js';

export class Expedition {
    constructor(saved = null) {
        this.world = new World(saved?.seed, saved?.changes);
        this.state = {
            x: 12, y: 12, depth: 0, energy: 320, hull: 100, heat: 0, credits: 0,
            cargo: [], tiers: { drill: 0, battery: 0, storage: 0, hull: 0 }, module: 'balanced',
            deepest: 0, sold: 0, recovered: [], milestones: [],
            direction: 0, lost: false, completed: false, tutorials: [], lastDamage: null, lossCause: null, ...(saved?.state || {}),
        };
        this.events = [];
        this.pending = saved?.pending || [];
        this.cooldown = 0; this.scanCooldown = 0; this.transition = 0; this.damageNoticeCooldown = 0;
        this.energyWarningBand = 0; this.energyAlertCooldown = 0;
        this.world.level(this.state.depth);
        this.reveal();
    }
    get stats() {
        const s = this.state;
        return { power: DRILL_POWER[s.tiers.drill], energy: 320 + s.tiers.battery * 100,
            capacity: 12 + s.tiers.storage * 8 - (s.module === 'bastion' ? 3 : 0),
            hull: 100 + s.tiers.hull * 30 - (s.module === 'prospector' ? 20 : 0),
            maxDepth: 3 + s.tiers.drill * 3 };
    }
    get cargoValue() { return this.state.cargo.reduce((sum, ore) => sum + ORES[ore].value, 0) * (this.state.module === 'prospector' ? 1.25 : 1); }
    emit(type, data = {}) { this.events.push({ type, ...data }); }
    message(text, tone = 'info') { this.emit('message', { text, tone }); }
    reveal() { const s = this.state; this.world.reveal(s.depth, s.x, s.y, 5); }
    cost(id) { return Math.round(UPGRADES[id].base * 1.67 ** this.state.tiers[id]); }
    buy(id) {
        const spec = UPGRADES[id]; const s = this.state;
        if (!spec || s.depth !== 0 || s.lost || s.tiers[id] >= spec.max || s.credits < this.cost(id)) return false;
        s.credits -= this.cost(id); s.tiers[id]++;
        s.energy = this.stats.energy; s.hull = this.stats.hull;
        this.emit('purchase'); this.message(`${spec.name} upgraded to tier ${s.tiers[id] + 1}.`); this.emit('save'); return true;
    }
    fit(id) {
        if (this.state.depth !== 0 || this.state.lost || !MODULES[id] || (id !== 'balanced' && this.state.recovered.length === 0)) return false;
        if (this.state.cargo.length > 12 + this.state.tiers.storage * 8 - (id === 'bastion' ? 3 : 0)) return false;
        this.state.module = id; this.state.hull = this.stats.hull; this.emit('save'); return true;
    }
    service() { this.state.energy = this.stats.energy; this.state.hull = this.stats.hull; this.state.heat = 0; }
    dock() {
        if (this.state.depth !== 0 || this.state.lost) return false;
        this.service(); this.emit('dock'); this.emit('save'); return true;
    }
    sell() {
        const s = this.state;
        if (s.depth !== 0 || s.lost || !s.cargo.length) return false;
        const value = Math.round(this.cargoValue); s.credits += value; s.sold += s.cargo.length; s.cargo = [];
        this.service(); this.message(`Cargo transferred. +${value} credits.`, 'good'); this.emit('purchase'); this.contracts(); this.emit('save'); return true;
    }
    contracts() {
        const s = this.state;
        for (const [id, done, reward, text] of [
            ['first', s.sold >= 4, 100, 'First shipment'], ['depth5', s.deepest >= 5, 180, 'Beyond the regolith'],
            ['sold24', s.sold >= 24, 300, 'Supply line'], ['depth10', s.deepest >= 10, 400, 'Under pressure'],
            ['depth15', s.deepest >= 15, 650, 'Into the dark'], ['signal', s.recovered.length >= 4, 1500, 'The listener'],
        ]) {
            if (done && !s.milestones.includes(id)) { s.milestones.push(id); s.credits += reward; this.message(`Contract complete: ${text}. +${reward} credits.`, 'good'); }
        }
    }
    action(action) {
        const s = this.state;
        if (s.lost || this.transition > 0) return false;
        const moves = { up: [0,-1,-Math.PI/2], down: [0,1,Math.PI/2], left: [-1,0,Math.PI], right: [1,0,0] };
        if (moves[action]) {
            if (this.cooldown > 0) return false;
            const [dx,dy,angle] = moves[action]; s.direction = angle;
            const cell = this.world.cell(s.depth, s.x + dx, s.y + dy);
            if (!cell) { this.message('Survey boundary reached. Try another heading.'); this.cooldown = .2; return false; }
            if(cell.hazard && !s.tutorials.includes(cell.hazard)) {
                s.tutorials.push(cell.hazard);this.emit('tutorial',{hazard:cell.hazard});this.emit('save');return false;
            }
            if (cell.solid) {
                if (s.heat >= 96) { this.message('Drill overheated. Let the assembly cool.', 'warning'); this.cooldown = .5; return false; }
                if (cell.ore !== null && s.cargo.length >= this.stats.capacity && cell.hp <= this.stats.power) {
                    this.message('Cargo full. Return to orbit to sell your minerals.', 'warning'); this.cooldown = .5; return false;
                }
                s.energy = Math.max(0, s.energy - 2.2);
                s.heat = Math.min(100, s.heat + 7 * (s.module === 'ghost' ? 1.3 : 1));
                this.world.change(s.depth, cell, { hp: Math.max(0, cell.hp - this.stats.power) });
                this.emit('dig', { x: cell.x, y: cell.y, broken: cell.hp === 0 });
                this.cooldown = .18 - s.tiers.drill * .011;
                if (cell.hp === 0) {
                    if (cell.ore !== null) { s.cargo.push(cell.ore); this.emit('ore', { x: cell.x, y: cell.y, ore: cell.ore }); }
                    this.world.change(s.depth, cell, { solid: false, ore: null, rubble: false });
                    this.enter(cell);
                }
            } else { s.energy = Math.max(0, s.energy - (s.module === 'ghost' ? .27 : .45)); this.cooldown = .12; this.enter(cell); }
            this.checkLoss(); return true;
        }
        if (action === 'scan') {
            if (this.scanCooldown > 0) return false;
            if (s.energy < 5) { this.message('Insufficient energy for a scan.', 'warning'); return false; }
            s.energy -= 5; this.scanCooldown = 4;
            this.world.reveal(s.depth, s.x, s.y, 9, true); this.emit('scan'); this.message('Pulse returned. Mineral signatures and hazards mapped.'); this.checkLoss(); return true;
        }
        if (action === 'descend' || action === 'ascend') return this.changeDepth(action === 'descend' ? 1 : -1);
        return false;
    }
    enter(cell) {
        const s = this.state; s.x = cell.x; s.y = cell.y; this.reveal(); this.emit('move');
        if (cell.relic) {
            const id = LOGS.findIndex(log => log.depth === s.depth);
            if (id >= 0 && !s.recovered.includes(id)) {
                const reward=200+s.depth*15;
                const unlockedModules=s.recovered.length===0;
                s.recovered.push(id); s.credits += reward;
                this.world.change(s.depth, cell, { relic: false }); this.emit('relic', { id, reward, unlockedModules });
                if (id === 3 && s.recovered.length === 4) { s.completed = true; this.emit('complete'); }
                // Recovering the final record out of order still completes the objective.
                if (s.recovered.length === 4 && !s.completed) { s.completed = true; this.emit('complete'); }
                this.contracts(); this.emit('save');
            }
        }
        if (cell.hazard === 'gas') {
            this.damage(24 + s.depth, 'Gas pocket ignited. Avoid the drifting green vapor.', 'gas'); s.heat = Math.min(100, s.heat + 20);
            this.emit('explosion', { x: cell.x, y: cell.y }); this.world.change(s.depth, cell, { hazard: null });
        }
        if (cell.hazard === 'unstable' && !this.pending.some(p => p.depth === s.depth && p.x === cell.x && p.y === cell.y)) {
            this.pending.push({ x: cell.x, y: cell.y, depth: s.depth, time: 1.7 });
            this.message('Seismic event. Clear the marked area!', 'warning'); this.emit('alarm');
        }
    }
    damage(amount, reason, cause = null) {
        const s = this.state;
        const actual=amount * (s.module === 'bastion' ? .65 : 1) / (1 + s.tiers.hull * .12);
        s.hull = Math.max(0, s.hull - actual);if(cause)s.lastDamage=cause;
        if(this.damageNoticeCooldown<=0 || cause!=='lava') {
            this.emit('damage',{cause,amount:actual});this.damageNoticeCooldown=.9;
            if(reason)this.message(`${reason} Hull −${Math.round(actual)}.`, 'warning');
            else if(cause==='lava')this.message('Lava is damaging the hull. Move off the orange pool now!', 'warning');
        }
        this.checkLoss();
    }
    verticalCost(delta) {
        const s=this.state;
        if(s.depth+delta<0)return 0;
        const cell=this.world.cell(s.depth,s.x,s.y);
        if(cell[delta>0?'shaftDown':'shaftUp'])return 2;
        return delta>0?9+(s.depth+1)*1.4:6+s.depth*.7;
    }
    get ascentCost() {
        const s=this.state,key=`${s.x}:${s.y}:${s.depth}:${this.world.revision}`;
        if(this.ascentCache?.key===key)return this.ascentCache.cost;
        let cost=0;
        for(let depth=s.depth;depth>0;depth--)cost+=this.world.cell(depth,s.x,s.y).shaftUp?2:6+depth*.7;
        cost=Math.ceil(cost);this.ascentCache={key,cost};return cost;
    }
    get energyStatus() {
        const needed=this.ascentCost,remaining=Math.floor(this.state.energy),capacity=this.stats.energy;
        const buffer=Math.max(20,capacity*.12,needed*.25);
        const cautionAt=Math.max(capacity*.3,needed+buffer);
        const criticalAt=Math.max(capacity*.1,needed+Math.max(8,capacity*.04));
        return {needed,remaining,band:this.state.energy<=criticalAt?2:this.state.energy<=cautionAt?1:0};
    }
    changeDepth(delta) {
        const s = this.state; const depth = s.depth + delta;
        if (depth < 0) return this.dock();
        if (delta > 0 && depth > this.stats.maxDepth) { this.message(`Pressure interlock: upgrade the drill to descend below ${s.depth * 10} m.`, 'warning'); this.cooldown = .4; return false; }
        const energy = this.verticalCost(delta);
        if (s.energy < energy) { this.message('Not enough power to bore here. Find an existing shaft: it costs only 2 energy per level.', 'warning'); return false; }
        const origin=this.world.cell(s.depth,s.x,s.y);
        const reused=!!origin[delta>0?'shaftDown':'shaftUp'];
        this.world.change(s.depth,origin,{[delta>0?'shaftDown':'shaftUp']:true});
        s.energy -= energy; s.depth = depth; s.deepest = Math.max(s.deepest, depth);
        const cell = this.world.cell(depth, s.x, s.y);
        // The vertical bore creates a safe arrival pocket; it cannot harvest ore for free.
        this.world.change(depth, cell, { solid: false, ore: null, hazard: null, rubble:false, [delta>0?'shaftUp':'shaftDown']:true });
        if(!reused)s.heat=Math.min(100,s.heat+10);
        this.reveal(); this.transition = reused?.32:.65; this.cooldown = .2; this.emit('depth', { depth, reused });
        this.enter(cell); this.contracts();
        if (depth === 0) { this.service(); this.emit('dock'); }
        else if ([4,6,8].includes(depth)) this.message(({4:'Seismic instability detected. Watch for collapsing ground.',6:'Volatile gas pockets detected. Scan ahead.',8:'Thermal activity detected. Keep moving across lava.'})[depth], 'warning');
        this.checkLoss(); this.emit('save'); return true;
    }
    tick(dt) {
        if (this.state.lost) return;
        const s = this.state;
        this.cooldown = Math.max(0, this.cooldown - dt); this.scanCooldown = Math.max(0, this.scanCooldown - dt);this.damageNoticeCooldown=Math.max(0,this.damageNoticeCooldown-dt);
        this.transition = Math.max(0, this.transition - dt); s.heat = Math.max(0, s.heat - dt * 13);
        if (this.world.cell(s.depth, s.x, s.y).hazard === 'lava') { this.damage((10 + s.depth * .7) * dt,null,'lava'); s.heat = Math.min(100, s.heat + dt * 25); }
        for (const p of this.pending) {
            p.time -= dt;
            if (p.time <= 0) {
                const cell = this.world.cell(p.depth, p.x, p.y);
                this.world.change(p.depth, cell, { hazard: null, rubble: true });
                if (p.depth === s.depth) {
                    this.emit('collapse', { x:p.x, y:p.y });
                    if (Math.hypot(s.x-p.x,s.y-p.y) <= 1.4) this.damage(32 + s.depth, 'Cave-in impact. Falling rock struck the hull.', 'collapse');
                }
                // Leave diggable rubble, but never trap the ship inside a solid cell.
                if (!(s.depth === p.depth && s.x === p.x && s.y === p.y)) this.world.change(p.depth, cell, { solid: true, hp: 30, maxHp: 30 });
            }
        }
        this.pending = this.pending.filter(p => p.time > 0);
        this.checkLoss();this.warnEnergy(dt);
    }
    warnEnergy(dt) {
        if(this.state.lost)return;
        const {band,needed,remaining}=this.energyStatus;
        this.energyAlertCooldown=Math.max(0,this.energyAlertCooldown-dt);
        if(!band){this.energyWarningBand=0;this.energyAlertCooldown=0;return;}
        const changed=band!==this.energyWarningBand;
        if(changed||this.energyAlertCooldown<=0){
            this.emit(band===2?'criticalEnergy':'lowEnergy');
            this.energyAlertCooldown=band===2?7:22;
            if(changed)this.message(this.state.depth===0?`Low battery: ${remaining} energy. Press E to recharge now.`:`${remaining<needed?'Not enough power for a straight ascent':'Return to the surface now'}: ${needed} energy needed, ${remaining} remaining. ${remaining<needed?'Retrace your route to an existing shaft.':'This includes boring through uncut rock above you.'}`, 'warning');
        }
        this.energyWarningBand=band;
    }
    checkLoss() {
        if (this.state.lost) return;
        if (this.state.energy <= 0 || this.state.hull <= 0) {
            this.state.lossCause=this.state.energy<=0?'power':this.state.lastDamage;
            this.state.lost = true; this.emit('lost'); this.emit('save');
        }
    }
    snapshot() { return { version: 3, seed: this.world.seed, state: JSON.parse(JSON.stringify(this.state)), changes: this.world.changes, pending: this.pending }; }
}
