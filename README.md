# Dig: Deep Descent

## Play it

https://aaronshaver.github.io/dig-deep-descent/

## Status update 2026-09-05

GPT-6 Astra High updated the game to version 0.3.0, building out the orbital shop, ship upgrades, progression contracts, hazards, animated mining, detailed Canvas graphics, and an original procedural sci-fi soundtrack. The overhaul adds a black-box mystery, experimental ship modules, permadeath, accessible pop-up controls, and portable saves while preserving direct `index.html` play and expanding the modular unit and browser tests.

## Status update 2024-09-30

I have decided to focus on my paid freelancing job and put this unpaid side project on pause.

I have learned more about Jest testing, CSS, and JavaScript event listeners/event dispatching/etc. As well, I got more practice with project management/scope/planning, TDD, and OO-design.

It was also interesting to create my own game engine from scratch. This had benefits, like total control of it, and not needing to spend hours looking up Unity quirks and such. But it had real downsides too, like much less power to make fancy graphics, no built-in physics or animation or simulation systems to take advantage of, and needing to re-invent the wheel for problems that engines have already solved. If I ever attempt to make another game in the future, I will use an engine.

## Features

* Layered procedural terrain, five underground biomes, and increasingly valuable minerals. Hardness depends on depth and the surrounding rock density, independently of mineral value.
* Detailed Canvas ship and terrain, animated drilling, fractures, debris, work lights, sonar pulses, fog and depth transitions.
* Persistent vertical shafts with fractured rock rims and light from above. Reusing a shaft costs only 2 energy and transitions faster; natural shafts extend through varying numbers of strata.
* Surface shop with seven tiers of drill, battery, cargo and hull systems. Sell minerals and claim progression contracts to fund upgrades.
* Stronger, faster drill tiers and floating mineral sale values. The shop is available anywhere on the surface and opens only when requested.
* Heat management, delayed cave-ins, explosive gas and lava, with first-encounter tutorials and explicit damage causes. Early strata are safe; hazards start at 40 m.
* Battery warnings account for the energy needed to ascend from your actual location, including uncut rock above you, with a safety margin. The HUD shows ascent cost and escalates visual and audio warnings near that reserve. Existing shaft travel has a soft whoosh instead of a drilling impact.
* Four recoverable black boxes, a sci-fi mystery, and three unlockable experimental modules with tradeoffs.
* Roguelike permadeath: ship destruction ends the run. The next expedition starts with no credits, upgrades, cargo, records or excavated terrain.
* Original, locally synthesized ambient music and mining effects, with separate volume and mute controls.
* Larger, responsive ship instruments; keyboard and mouse menus; reduced motion; automatic pause in menus and hidden tabs.
* Automatic local saves, including changed terrain, with portable JSON export/import.

## Try it out

Open **index.html** directly in a current desktop browser. No server, installation, internet connection, or runtime CDN is needed. Keep `index.html`, `style.css`, and `game.bundle.js` together. The checked-in bundle is ready to play; music starts after your first interaction.

The hosted project is at https://aaronshaver.github.io/dig-deep-descent/ (it reflects the last deployed revision).

Move and drill with **WASD / arrows**, descend with **C**, ascend with **Space**, scan with **Q**, and open the orbital shop with **E**. Surfacing repairs and recharges the ship but does not open the shop automatically. **H** opens the full controls, **I** cargo, **J** the journal, **M** mute, and **Escape** the flight menu.

Mine four ferrite samples near the starting area and sell them to earn the first contract bonus. Denser and deeper rock requires more drilling; stronger drills reduce its energy and heat cost. Valuable minerals may still occur in softer rock. Upgrade before pushing deeper, and reserve 2 energy per level to ascend through existing shafts. Boring upward elsewhere costs more. There is no idle battery drain. The final black box lies at 200 m.

Saves belong to the current browser and file location. Use **Flight systems → Export save** before moving the folder or changing browsers. If local storage is unavailable, the game remains playable and shows a notice to use manual export. Import replaces the current expedition; **New expedition** asks before resetting progress.

## Development

```sh
npm ci
npm run build
```

Edit the ES modules under `js/`, then rebuild the checked-in `game.bundle.js`. esbuild creates a classic script bundle because local `file://` pages cannot reliably load ES module imports. Players never need Node or a build step.

`expedition.js` owns simulation and economy; `world.js` adapts the original multi-scale terrain generator; `renderer.js` owns Canvas visuals; `audio.js` synthesizes the soundtrack and effects; `persistence.js` validates saves; `flight-ui.js` connects the interface and input. The original terrain and ship-system modules and regression tests remain available alongside the new expedition tests.

## Testing

```sh
npm test                 # Unit and regression tests
npm run test:browser     # Real file:// browser flows and responsive layouts
npm run check            # Build, unit tests and browser tests
```

Browser tests use installed Microsoft Edge on Windows. On other platforms, run `npx playwright install chromium` once, or set `PW_CHANNEL` to an installed Playwright-supported browser channel. Tests cover mining and storage, upgrade gates and pricing, rock hardness, hazards and permadeath, record progression, save validation, offline launch, menus, and desktop/mobile layouts.
