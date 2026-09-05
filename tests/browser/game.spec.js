const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('url');
const path = require('path');
const esbuild = require('esbuild');
const compiled=esbuild.buildSync({entryPoints:['js/expedition.js'],bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text;
const simulation={exports:{}};new Function('module','exports',compiled)(simulation,simulation.exports);
const {Expedition}=simulation.exports;
const url = pathToFileURL(path.resolve('index.html')).href;
const errors=[];
test.beforeEach(async ({page})=>{
    errors.length=0;page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url);
    await expect(page.locator('#biomeName')).toHaveText('The surface.');
});
test.afterEach(()=>expect(errors).toEqual([]));
test('file launch, mining, sale, upgrade, descent, pause and reload',async({page})=>{
    await page.screenshot({path:'test-results/surface.png'});
    await page.getByRole('button',{name:'Explore the surface first'}).click();
    await page.keyboard.down('d');await page.waitForTimeout(750);await page.keyboard.up('d');
    await expect(page.locator('#cargoValue')).not.toHaveText('0 / 12');
    await page.keyboard.press('e');await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading',{name:'Orbital exchange'})).toBeVisible();
    await page.getByRole('button',{name:'Sell all cargo'}).click();
    await expect(page.locator('#cargoValue')).toHaveText('0 / 12');
    await page.screenshot({path:'test-results/shop.png'});
    await page.keyboard.press('Escape');await page.keyboard.press('c');
    await expect(page.locator('#depthValue')).toHaveText('010');
    await page.waitForTimeout(750);await page.keyboard.press('h');
    const before=await page.locator('#energyValue').textContent();await page.keyboard.press('d');await page.waitForTimeout(350);
    await expect(page.locator('#energyValue')).toHaveText(before);await page.keyboard.press('Escape');
    await page.keyboard.press('Space');await expect(page.locator('#depthValue')).toHaveText('000');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.locator('#energyValue')).toHaveText('100%');
    await page.keyboard.press('e');await expect(page.getByRole('heading',{name:'Orbital exchange'})).toBeVisible();
    await page.reload();await expect(page.locator('#depthValue')).toHaveText('000');await expect(page.locator('#briefing')).toBeHidden();
});
test('controls and menus remain readable at desktop and compact widths',async({page})=>{
    for(const viewport of [{width:1440,height:900},{width:1280,height:720},{width:390,height:844}]){
        await page.setViewportSize(viewport);
        await expect(page.locator('#beginButton')).toBeInViewport();
        expect(await page.locator('.depth-label').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(12);
        await page.getByRole('button',{name:'Flight menu',exact:true}).click();
        await expect(page.getByRole('heading',{name:'Flight systems'})).toBeVisible();
        await page.getByLabel('Ambient soundtrack').uncheck();await page.getByLabel('Reduced motion & camera shake').check();
        await page.keyboard.press('Escape');
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
        await page.screenshot({path:`test-results/layout-${viewport.width}.png`});
    }
});
test('no network assets are required and invalid imported saves are rejected',async({page})=>{
    const requests=[];page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
    await page.reload();await page.getByRole('button',{name:'Flight menu',exact:true}).click();
    await page.locator('#importSave').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":3}')});
    await expect(page.locator('#toasts')).toContainText('not a valid');expect(requests).toEqual([]);
});

async function importExpedition(page,game){
    await page.getByRole('button',{name:'Flight menu',exact:true}).click();
    await page.locator('#importSave').setInputFiles({name:'expedition.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(game.snapshot()))});
    await expect(page.getByRole('dialog')).toBeHidden();
}
test('surface trade upgrades all systems and confirmation buttons have readable contrast',async({page})=>{
    const game=new Expedition({seed:73});game.state.x=3;game.state.y=7;game.state.credits=1000;game.state.cargo=[0,0,0,0];
    await importExpedition(page,game);await page.keyboard.press('e');await page.getByRole('button',{name:'Sell all cargo'}).click();
    for(const id of ['drill','battery','storage','hull'])await page.locator(`[data-buy="${id}"]`).click();
    await expect(page.locator('#credits')).toContainText('740');await expect(page.locator('#cargoValue')).toHaveText('0 / 20');
    await expect(page.locator('.upgrade-stat').first()).toHaveText('48 → 90 damage per hit · 60 m rated');
    await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.getByRole('button',{name:'New expedition',exact:true}).click();
    const colors=await page.locator('#resetConfirm').evaluate(e=>({color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor}));
    expect(colors.color).toBe('rgb(32, 40, 32)');expect(colors.background).toBe('rgb(237, 188, 124)');
    await page.screenshot({path:'test-results/reset-confirmation.png'});
});
test('cave-in warning, impact, rubble and shaft markers render without errors',async({page})=>{
    const game=new Expedition({seed:17});game.state.depth=4;game.state.deepest=4;game.state.tiers.drill=1;game.state.tutorials=['unstable'];
    game.world.change(4,game.world.cell(4,12,12),{solid:false,hazard:null,ore:null});
    const unstable=game.world.cell(4,13,12);game.world.change(4,unstable,{solid:false,hazard:'unstable',ore:null});
    game.world.change(4,game.world.cell(4,14,12),{solid:false,hazard:null,ore:null});
    game.world.change(4,game.world.cell(4,15,12),{solid:false,hazard:null,ore:null});
    await importExpedition(page,game);await page.keyboard.press('d');
    await page.waitForTimeout(350);await page.screenshot({path:'test-results/cave-warning.png'});
    await page.keyboard.down('d');await page.waitForTimeout(300);await page.keyboard.up('d');
    await page.waitForTimeout(1050);await page.screenshot({path:'test-results/cave-impact.png'});
    await expect(page.locator('#hullValue')).toHaveText('100%');
    await page.waitForTimeout(1900);await page.screenshot({path:'test-results/cave-rubble.png'});
    await page.keyboard.press('c');await expect(page.locator('#depthValue')).toHaveText('050');
    await page.waitForTimeout(700);await expect(page.locator('#biomeSubtitle')).toContainText('Shaft up');
    await page.keyboard.press('Space');await expect(page.locator('#depthValue')).toHaveText('040');
    await page.waitForTimeout(450);await page.keyboard.press('s');await page.waitForTimeout(350);
    await page.screenshot({path:'test-results/vertical-shaft.png'});
});
test('gas tutorial precedes damage; destruction permanently ends the run',async({page})=>{
    const game=new Expedition({seed:92});game.state.depth=6;game.state.deepest=6;game.state.hull=10;game.state.credits=600;game.state.tiers.drill=2;
    game.world.change(6,game.world.cell(6,12,12),{solid:false,hazard:null,ore:null});
    game.world.change(6,game.world.cell(6,13,12),{solid:false,hazard:'gas',ore:null});
    await importExpedition(page,game);await page.keyboard.press('d');
    await expect(page.getByRole('heading',{name:'Volatile gas'})).toBeVisible();
    await expect(page.locator('#hullValue')).toHaveText('10%');
    await page.screenshot({path:'test-results/gas-tutorial.png'});
    await page.getByRole('button',{name:'Understood · return to ship'}).click();await page.keyboard.press('d');
    await expect(page.getByRole('heading',{name:'Expedition lost'})).toBeVisible();
    await expect(page.locator('#panelContent')).toContainText('explosive gas pocket');
    await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toBeVisible();
    await page.reload();await expect(page.getByRole('heading',{name:'Expedition lost'})).toBeVisible();
    await page.getByRole('button',{name:'Begin new expedition',exact:true}).click();
    await expect(page.locator('#credits')).toHaveText('0 CR');await expect(page.locator('#recordCount')).toHaveText('0/4');
    await expect(page.locator('#depthValue')).toHaveText('000');await expect(page.locator('#briefing')).toBeVisible();
});
test('low battery is prominent, escalates to critical and clears after surface service',async({page})=>{
    const game=new Expedition({seed:44});game.state.energy=70;game.state.depth=2;
    game.world.change(2,game.world.cell(2,12,12),{solid:false,hazard:null});
    await importExpedition(page,game);
    await expect(page.locator('.battery-caution')).toBeVisible();await expect(page.locator('#signalText')).toContainText('Return now');
    game.state.energy=20;await importExpedition(page,game);
    await expect(page.locator('.battery-critical')).toBeVisible();await expect(page.locator('#signalText')).toContainText('Critical reserve');
    await page.screenshot({path:'test-results/critical-battery.png'});
    game.state.depth=0;await importExpedition(page,game);await page.keyboard.press('e');
    await expect(page.locator('#energyValue')).toHaveText('100%');await expect(page.locator('.battery-critical')).toHaveCount(0);
});
