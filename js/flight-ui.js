import { Expedition } from './expedition.js';
import { Renderer } from './renderer.js';
import { AudioEngine } from './audio.js';
import { UPGRADES, ORES, MODULES, LOGS, HAZARDS, DRILL_POWER, biome } from './config.js';
import { readSave, writeSave, validateSave } from './persistence.js';

const $ = id => document.getElementById(id);
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
let storage; try { storage = window.localStorage; } catch { storage = null; }
const loaded = readSave(storage);
let game = new Expedition(loaded.data);
const renderer = new Renderer($('gameCanvas'),game,$('minimap'));
const audio = new AudioEngine();
const keys = new Set();
const panel = $('panel');
let currentPanel = null, last = performance.now(), lastUI = 0, autosave = 0, started = !!loaded.data, lastToast = '', lastToastTime = 0, saveWarned = false;
let allMuted = false;
let activeHazard = 'gas';
let queuedVertical = null;
renderer.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (started) $('briefing').hidden = true;
function toast(text,tone='info') {
    if(text===lastToast && performance.now()-lastToastTime<1800)return;
    lastToast=text;lastToastTime=performance.now();
    const node=document.createElement('div');node.className=`toast ${tone}`;node.textContent=text;
    $('toasts').append(node);while($('toasts').children.length>3)$('toasts').firstChild.remove();setTimeout(()=>node.remove(),5500);
}
function save() { if(!writeSave(storage,game)&&!saveWarned){saveWarned=true;toast('Local save unavailable. Export your save from the flight menu.','warning');} }
function engage() { started=true;$('briefing').hidden=true;audio.start().catch(()=>{}); }
function perform(action) {
    if(panel.open)return;engage();
    if((action==='ascend'||action==='descend')&&game.transition>0){queuedVertical=action;return;}
    game.action(action);drainEvents();updateUI();
}
function close() { panel.close();currentPanel=null;keys.clear();$('gameCanvas').focus({preventScroll:true}); }
function open(name) {
    if(panel.open&&currentPanel===name){close();return;}
    if(game.state.lost && name!=='lost')name='lost';
    currentPanel=name;keys.clear();queuedVertical=null;renderPanel();if(!panel.open)panel.showModal();
}
function contract() {
    const s=game.state;
    if(s.sold<4)return ['A foothold in the dark','Sell 4 minerals at the orbital shop.',`${s.sold} / 4`,'+100 CR'];
    if(s.deepest<5)return ['Beyond the regolith','Upgrade your drill. Reach 50 m.',`${s.deepest*10} / 50 m`,'+180 CR'];
    if(s.sold<24)return ['Supply line','Deliver 24 mineral samples in total.',`${s.sold} / 24`,'+300 CR'];
    if(s.deepest<10)return ['Under pressure','Reach the geothermal fault at 100 m.',`${s.deepest*10} / 100 m`,'+400 CR'];
    if(s.deepest<15)return ['Into the dark','Find the black cathedral at 150 m.',`${s.deepest*10} / 150 m`,'+650 CR'];
    return ['The listener','Recover black boxes at 50, 100, 150 and 200 m.',`${s.recovered.length} / 4`,s.completed?'COMPLETE':'+1,500 CR'];
}
function updateUI() {
    const s=game.state,stats=game.stats,b=biome(s.depth);
    $('biomeName').innerHTML=`${b.name}<span>.</span>`;
    const here=game.world.cell(s.depth,s.x,s.y);
    $('biomeSubtitle').textContent=here.shaftUp||here.shaftDown?'Shaft '+[here.shaftUp?'up':'',here.shaftDown?'down':''].filter(Boolean).join(' & ')+' · 2 energy':s.depth===0?'Trade anywhere on the surface':`Drill rated to ${stats.maxDepth*10} m`;
    document.querySelector('[data-action="descend"]').title=`${here.shaftDown?'Use shaft':'Bore down'}: ${game.verticalCost(1).toFixed(1)} energy`;
    document.querySelector('[data-action="ascend"]').title=`${here.shaftUp?'Use shaft':'Bore up'}: ${game.verticalCost(-1).toFixed(1)} energy`;
    $('depthValue').textContent=String(s.depth*10).padStart(3,'0');$('risk').textContent=s.depth===0?'Safe':b.risk.toLowerCase()+' risk';
    $('depthMarker').style.left=`${Math.min(100,s.depth/21*100)}%`;
    for(const [name,amount,max] of [['energy',s.energy,stats.energy],['hull',s.hull,stats.hull],['heat',s.heat,100],['cargo',s.cargo.length,stats.capacity]]) {
        const percent=Math.max(0,Math.min(100,amount/max*100));$(name+'Meter').value=percent;
        $(name+'Value').textContent=name==='cargo'?`${amount} / ${max}`:`${Math.round(percent)}%`;
        $(name+'Value').title=`${amount.toFixed(1)} / ${max}`;
        $(name+'Meter').parentElement.classList.toggle('low',name==='heat'?percent>80:name==='cargo'?percent>=100:percent<25);
    }
    $('credits').innerHTML=`${s.credits.toLocaleString()} <span>CR</span>`;$('recordCount').textContent=`${s.recovered.length}/4`;
    $('scanStatus').textContent=game.scanCooldown>0?`Ready in ${Math.ceil(game.scanCooldown)}s`:'Q to scan';
    $('signalText').textContent=s.energy<game.stats.energy*.2?'Low battery. Retrace a shaft and ascend with Space.':s.completed?'The moon is silent.':s.depth===0?'Press E to sell cargo and refit.':s.depth<4?'Press Q to scan for minerals.':s.depth<8?'Scan ahead. Unstable ground can collapse.':s.depth<15?'Watch for lava and gas. Scan before advancing.':'Black-box signals detected in the deep strata.';
    const c=contract();['contractTitle','contractText','contractProgress','contractReward'].forEach((id,i)=>$(id).textContent=c[i]);
    const budget=game.energyStatus;
    $('ascentBudget').hidden=s.depth===0;$('ascentCost').textContent=`${budget.needed} energy`;
    $('ascentBudget').classList.toggle('over-budget',budget.remaining<budget.needed);
    const energyInstrument=$('energyMeter').parentElement;
    energyInstrument.classList.toggle('battery-caution',budget.band===1&&!s.lost);
    energyInstrument.classList.toggle('battery-critical',budget.band===2&&!s.lost);
    $('signalText').classList.toggle('battery-message',budget.band>0&&!s.lost);
    if(budget.band&&!s.lost)$('signalText').textContent=s.depth===0?`Low battery · ${budget.remaining} energy · Press E to recharge`:`${budget.band===2?'Critical reserve':'Return now'} · ${budget.needed} energy to surface / ${budget.remaining} remaining`;
}
function renderPanel() {
    const s=game.state,stats=game.stats;
    const titles={shop:'Orbital exchange',help:'Flight manual',cargo:'Cargo manifest',journal:'The things we left behind',menu:'Flight systems',lost:'Expedition lost',complete:'A silence, at last.',reset:'Start a new expedition?',hazard:HAZARDS[activeHazard].name};
    $('panelTitle').textContent=titles[currentPanel];
    let html='';
    if(currentPanel==='shop') {
        const docked=s.depth===0;
        html=`<p class="intro">${docked?'Orbital uplink established. Your battery, hull and drill cooling have been serviced at no charge.':'Remote catalogue. Return to the surface with Space to sell minerals, service your ship and install upgrades.'}</p><div class="shop-summary"><div><p>Available balance</p><strong>${s.credits.toLocaleString()} CR</strong><small>${s.cargo.length} samples / ${Math.round(game.cargoValue)} CR cargo value</small></div><button id="sellCargo" class="primary" ${!docked||!s.cargo.length?'disabled':''}>Sell all cargo ${icon('arrow')}</button></div><div class="upgrade-grid">`;
        const values={drill:`${stats.power}${s.tiers.drill<6?' → '+DRILL_POWER[s.tiers.drill+1]:''} damage per hit · ${stats.maxDepth*10} m rated`,battery:`${stats.energy} energy capacity`,storage:`${stats.capacity} mineral samples`,hull:`${stats.hull} hull integrity`};
        for(const [id,spec] of Object.entries(UPGRADES)) html+=`<article class="upgrade-card">${icon(id==='storage'?'cargo':id)}<div class="card-title"><h3>${spec.name}</h3><span class="tier">TIER ${s.tiers[id]+1} / 7</span></div><p>${spec.detail}</p><div class="upgrade-stat">${values[id]}</div><button class="buy-button" data-buy="${id}" ${!docked||s.tiers[id]>=spec.max||s.credits<game.cost(id)?'disabled':''}>${s.tiers[id]>=spec.max?'Fully upgraded':`Upgrade / ${game.cost(id)} CR`}</button></article>`;
        html+='</div><h3 class="subheading">EXPERIMENTAL LOADOUT / ONE ACTIVE MODULE</h3>';
        if(!s.recovered.length)html+='<p class="muted-copy">Recover your first black box at 50 m to unlock alternative modules. Swapping modules anywhere on the surface is free.</p>';
        html+='<div class="module-grid">';
        for(const [id,m] of Object.entries(MODULES))html+=`<button data-module="${id}" class="module ${s.module===id?'selected':''}" ${!docked||(!s.recovered.length&&id!=='balanced')?'disabled':''}><strong>${m.name}${s.module===id?' / FITTED':''}</strong><span>${m.detail}</span></button>`;
        html+=`</div><div class="menu-actions"><button data-close class="primary">Return to ship ${icon('arrow')}</button></div>`;
    } else if(currentPanel==='help') {
        html='<p class="intro">Your view is a horizontal slice of the moon. Move and mine within each stratum, then bore vertically to explore the next one. Hold a direction to keep drilling.</p><div class="controls-list">';
        for(const [label,key] of [['Move & drill','WASD / ARROWS'],['Dig deeper','C'],['Ascend','SPACE'],['Pulse scan','Q'],['Orbital shop','E'],['Cargo manifest','I'],['Black-box journal','J'],['Controls','H'],['Pause / flight systems','ESC'],['Mute all audio','M']])html+=`<div class="control-row"><span>${label}</span><kbd>${key}</kbd></div>`;
        html+='</div><div class="tips"><p>Start with the copper-colored ferrite near the starting area. Collect 4 samples, press E, and sell them to claim your first contract bonus.</p><p>Return with Space for free servicing. Retrace your vertical shafts for the trip home: existing passages cost only 2 energy per level. Boring a new passage costs more. Natural shafts appear throughout the moon. Dark rock openings lead down; pale overhead light marks passages up. Natural shafts can span several levels. There is no passive battery drain.</p><p>Scan before entering unfamiliar terrain. Amber fractured ground can collapse after 1.7 seconds. Green vapor ignites on entry; orange lava damages you while you remain in it. These hazards begin at 40, 60 and 80 m.</p><p>Heat cools when you stop drilling. Menus and hidden browser tabs pause the simulation. Locate black boxes at 50, 100, 150 and 200 m to uncover the signal.</p></div>';
    } else if(currentPanel==='cargo') {
        html=`<p class="intro">${s.cargo.length} of ${stats.capacity} storage slots occupied. Estimated sale value: ${Math.round(game.cargoValue)} credits.</p>`;
        if(!s.cargo.length)html+='<div class="tips">Your hold is empty. Drill into mineral veins to collect samples. A pulse scan illuminates richer deposits farther away.</div>';
        ORES.forEach((ore,i)=>{const count=s.cargo.filter(v=>v===i).length;if(count)html+=`<div class="cargo-row"><i class="ore-chip" style="background:${ore.color}"></i><strong>${ore.name}</strong><span>${count} samples</span><span>${count*ore.value} CR</span></div>`;});
        html+='<div class="menu-actions"><button data-panel="shop" class="primary">Orbital exchange '+icon('arrow')+'</button></div>';
    } else if(currentPanel==='journal') {
        html='<p class="intro">Each box pays credits immediately and adds a story entry here. Your first unlocks three free ship modules: equip one in the orbital shop at the surface. Collect all four for an extra 1,500 CR and the story ending.</p>';
        if(s.recovered.length)html+='<div class="menu-actions"><button data-panel="shop" class="secondary">View ship modules</button></div>';
        LOGS.forEach((log,i)=>{const found=s.recovered.includes(i),reward=200+log.depth*15;html+=`<article class="journal-record ${found?'':'locked'}"><small>${String(log.depth*10).padStart(3,'0')} M / ${found?`RECOVERED · ${reward} CR PAID`:`${reward} CR REWARD`}</small><h3>${found?log.title:'Encrypted black box'}</h3><p>${found?log.text:'Scan at this depth to find the pale beacon. Move onto it to collect the credits and record. No cargo space or sale is needed.'}</p></article>`;});
    } else if(currentPanel==='menu') {
        html=`<p class="intro">Expedition progress saves automatically, including terrain, cargo and installed upgrades. Keep a portable backup if you move the game to a different folder or browser.</p><label class="settings-row">Ambient soundtrack<input id="musicSetting" type="checkbox" ${audio.music?'checked':''}></label><label class="settings-row">Ship & mining effects<input id="effectsSetting" type="checkbox" ${audio.effects?'checked':''}></label><label class="settings-row">Master volume<input id="volumeSetting" aria-label="Master volume" type="range" min="0" max="1" step="0.05" value="${audio.volume}"></label><label class="settings-row">Reduced motion & camera shake<input id="motionSetting" type="checkbox" ${renderer.reduced?'checked':''}></label><div class="menu-actions"><button id="exportButton" class="secondary">Export save</button><button id="importButton" class="secondary">Import save</button><button data-panel="reset" class="secondary">New expedition</button><button data-close class="primary">Resume flight ${icon('arrow')}</button></div><p class="muted-copy">Deepest dive: ${s.deepest*10} m / Minerals delivered: ${s.sold} / Black boxes: ${s.recovered.length} of 4<br>Original procedural score. Headphones recommended. Version 0.3.0.</p>`;
    } else if(currentPanel==='lost') {
        const causes={gas:'An explosive gas pocket ruptured the hull. Drifting green vapor warns of gas; mineral color alone does not indicate danger.',lava:'Prolonged lava exposure destroyed the hull. Orange molten pools deal continuous damage while you remain on them.',collapse:'Falling slabs from a cave-in destroyed the hull. Leave the marked area before its countdown ends.',power:'The reactor ran out of energy. Reuse vertical shafts to conserve power and return to the surface before the battery is depleted.'};
        html=`<p class="intro">${causes[s.lossCause]||'Your hull failed in the depths. The expedition is over.'}</p><div class="tips">All cargo, credits, upgrades, records and excavated terrain are lost. Your next expedition starts from scratch on a new moon.</div><p class="muted-copy">For your next run: monitor hull and battery, and retrace your shafts to the surface before either reaches zero.</p><div class="menu-actions"><button id="newRunAfterLoss" class="primary">Begin new expedition ${icon('arrow')}</button></div>`;
    } else if(currentPanel==='hazard') {
        const hazard=HAZARDS[activeHazard];
        html=`<p class="intro">${hazard.appearance}</p><div class="hazard-example ${activeHazard}" aria-hidden="true"><i></i><i></i><i></i></div><div class="tips"><p>${hazard.consequence}</p><p>${hazard.advice}</p></div><p class="muted-copy">No damage has occurred yet. The game is paused so you can plan a route. A destroyed ship ends the entire run.</p><div class="menu-actions"><button data-close class="primary">Understood · return to ship ${icon('arrow')}</button></div>`;
    } else if(currentPanel==='complete') {
        html='<p class="intro">The last record resolves into a pulse. Then nothing. For the first time in decades, the receiver is quiet.</p><div class="journal-record"><h3>You found the listener.</h3><p>Somewhere beneath your ship, something has decided to let you leave. All four black boxes are recovered. Your final contract has been paid. You can return to the surface, continue mining, or begin another expedition from flight systems.</p></div><div class="menu-actions"><button data-panel="journal" class="secondary">Read the final record</button><button data-close class="primary">One more ascent '+icon('arrow')+'</button></div>';
    } else if(currentPanel==='reset') {
        html='<p class="intro">This resets credits, upgrades, cargo and records, and generates a new moon. Your existing expedition will be replaced. Export a save from the flight menu if you want to keep it.</p><div class="menu-actions"><button id="resetConfirm" class="primary danger-button">Start fresh</button><button data-close class="secondary">Keep this expedition</button></div>';
    }
    $('panelContent').innerHTML=html;
    $('closePanel').hidden=currentPanel==='lost';
}
function drainEvents() {
    const events=game.events.splice(0);
    for(const e of events){
        renderer.event(e);audio.play(e.type==='depth'&&e.reused?'shaft':e.type,game.state.tiers.drill);
        if(e.type==='message')toast(e.text,e.tone);
        if(e.type==='dock')toast('Ship serviced. Press E to sell cargo and upgrade.','good');
        if(e.type==='save')save();
        if(e.type==='relic'){toast(`Black box recovered: +${e.reward} CR.${e.unlockedModules?' Ship modules unlocked. Equip one at the surface (E).':''}`,'good');open('journal');}
        if(e.type==='complete')open('complete');
        if(e.type==='lost')open('lost');
        if(e.type==='tutorial'){activeHazard=e.hazard;open('hazard');}
    }
}
function resetGame(next) { game=next;renderer.game=game;renderer.cachedRevision=-1;renderer.cachedDepth=-1;renderer.event({type:'depth'});keys.clear();queuedVertical=null;save();updateUI(); }
document.addEventListener('click',e=>{
    const button=e.target.closest('button');if(!button)return;audio.start().catch(()=>{});
    if(button.dataset.panel){if(button.dataset.panel==='shop'&&game.state.depth===0&&!game.state.lost)game.service();open(button.dataset.panel);save();updateUI();}
    if(button.dataset.action)perform(button.dataset.action);
    if(button.hasAttribute('data-close'))close();
    if(button.dataset.buy){game.buy(button.dataset.buy);drainEvents();renderPanel();updateUI();}
    if(button.dataset.module){if(!game.fit(button.dataset.module))toast('Unload cargo before fitting a module with less storage.','warning');drainEvents();renderPanel();updateUI();}
    if(button.id==='sellCargo'){game.sell();drainEvents();renderPanel();updateUI();}
    if(button.id==='exportButton'){
        const url=URL.createObjectURL(new Blob([JSON.stringify(game.snapshot())],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='dig-deep-descent-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    if(button.id==='importButton')$('importSave').click();
    if(button.id==='resetConfirm'){close();resetGame(new Expedition());started=false;$('briefing').hidden=false;}
    if(button.id==='newRunAfterLoss'){close();resetGame(new Expedition());started=false;$('briefing').hidden=false;}
});
$('closePanel').addEventListener('click',close);
panel.addEventListener('cancel',e=>{e.preventDefault();if(!game.state.lost)close();});
$('beginButton').addEventListener('click',()=>{perform('descend');$('gameCanvas').focus();});
$('exploreButton').addEventListener('click',()=>{engage();$('gameCanvas').focus();toast('Mine nearby ferrite. Sell 4 samples at the orbital shop to earn your first bonus.');});
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();open('menu');});
$('importSave').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    try {if(file.size>5e6)throw new Error();const data=JSON.parse(await file.text());if(!validateSave(data))throw new Error();close();resetGame(new Expedition(data));started=true;$('briefing').hidden=true;toast('Expedition restored.','good');if(game.state.lost)open('lost');}catch{toast('That file is not a valid Dig: Deep Descent 0.3.0 save.','warning');}
    e.target.value='';
});
document.addEventListener('input',e=>{
    const id=e.target.id;
    if(id==='musicSetting')audio.music=e.target.checked;
    if(id==='effectsSetting')audio.effects=e.target.checked;
    if(id==='volumeSetting')audio.volume=Number(e.target.value);
    if(id==='motionSetting')renderer.reduced=e.target.checked;
    audio.updateGains();
});
function mute(){allMuted=!allMuted;audio.music=!allMuted;audio.effects=!allMuted;audio.updateGains();$('soundButton').classList.toggle('muted',allMuted);$('soundButton').setAttribute('aria-label',allMuted?'Enable audio':'Mute audio');}
$('soundButton').addEventListener('click',mute);
const movement={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
const shortcuts={KeyC:'descend',Space:'ascend',KeyQ:'scan'};
const menus={KeyH:'help',KeyE:'shop',KeyI:'cargo',KeyJ:'journal',Escape:'menu'};
document.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input'))return;
    if(e.code==='Escape'&&panel.open)return;
    if(panel.open){if(menus[e.code]&&!e.repeat){e.preventDefault();if(!game.state.lost)open(menus[e.code]);}return;}
    if(e.target.closest('button,a')&&(e.code==='Space'||e.code==='Enter'))return;
    if(movement[e.code]||shortcuts[e.code]||menus[e.code]||e.code==='KeyM')e.preventDefault();
    if(movement[e.code]){keys.add(e.code);if(!e.repeat)perform(movement[e.code]);}
    if(shortcuts[e.code]&&!e.repeat)perform(shortcuts[e.code]);
    if(menus[e.code]&&!e.repeat){if(game.state.lost){open('lost');return;}if(menus[e.code]==='shop'&&game.state.depth===0)game.service();open(menus[e.code]);save();updateUI();}
    if(e.code==='KeyM'&&!e.repeat)mute();
});
document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();save();});
document.addEventListener('visibilitychange',()=>{keys.clear();last=performance.now();if(document.hidden){audio.suspend();save();}else if(started)audio.start().catch(()=>{});});
window.addEventListener('pagehide',save);
window.addEventListener('resize',()=>renderer.resize());
function frame(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    if(!document.hidden){
        if(!panel.open&&started){
            game.tick(dt);const active=[...keys].pop();
            if(queuedVertical&&game.transition<=0){const action=queuedVertical;queuedVertical=null;game.action(action);}
            else if(active)game.action(movement[active]);
            drainEvents();
        }
        renderer.draw(dt,panel.open||!started);audio.tick(game.state.depth);
        lastUI+=dt;autosave+=dt;if(lastUI>.1){updateUI();lastUI=0;}if(autosave>5&&started){save();autosave=0;}
    }
    requestAnimationFrame(frame);
}
updateUI();requestAnimationFrame(frame);
if(loaded.error)toast(loaded.error,'warning');
if(game.state.lost)open('lost');
