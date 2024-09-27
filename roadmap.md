# 0.3 - sell minerals and buy upgrades

* refactor: see if we can get rid of main.js now that we know about `@jest-environment jsdom` stuff
* get test coverage back up to 100%
* fix: update CSS/etc. so that the mineral stats clearly show three columns instead of the last two fused
* figure out the real/final mineral colors
    * update CSS for the unicode square to use the brighter color of the two mineral colors

* feature: able to sell minerals
* able to buy a single upgrade at the surface and use it
* feature: tips screen overlay/popup when game load with reminders like "battery can only be recharged at the surface"
* bump the version number in index.html

# 0.4 - visual effects + other minor features

* feature: new class: VerticalHole with darker color center, light outline on each affected level (two) to indicate it
* feature: introduce a slight delay on keypress so that you can't just zip through rocks or fly across the screen
* feature: suffix battery level with (warning) and (DANGER) for low battery levels
* feature: visual effects pipeline
    * start using it for random triangles while digging
    * have a system for the chips of rocks that come off when digging where it detects if the base color is more toward FFF or 000 and adds or subtracts accordingly
* bump the version number in index.html

# 0.5 - add hazards

* feature: at least one hazard
* ideas:
    - **Lava Pockets**: Damage the player on contact.
    - **Explosive Gas Spots**: Detonate when mined or disturbed nearby.
    - **Extreme Heat Areas**: Overheat equipment unless cooled.
    - **Cave-ins**: Falling rocks that block paths or cause damage.
    - **Magnetic Fields**: Disrupt navigation systems or drain energy.
    - **Radiation Zones**: Require protective gear to pass safely.

# 0.6 - small visual improvements

* feature: add PayPal donation links at bottom of left and right columns
* feature: white drill dot fades from white to black as correlated with percentage of battery
* feature: visual indicator of drill at work; maybe a ring, maybe a different color dot
* feature: correlate the # of triangles with the points of drill power to show increasing strength visually; i.e. 400 drill power should add more triangles than 100 power
* bump the version number in index.html

# 0.7 - add more upgrades, hazards as needed

* feature: many more upgrades to buy
    * need to plan this out
* feature: more hazards
    * need to plan this out
* feature: add one-time-use items in addition to permanent upgrades to make it feel like an expedition/stocking up
    * need to plan this out before starting work

# 0.8 - quality of life

* upgrade: compressed energy for quick boost of increased drill power
* upgrade: battery auto-recharger
* feature: easy way to do a win condition: the last upgrade on the list is an extremely expensive Buy Space Yacht type upgrade
* feature: local storage of game data + New Game button which resets everything
* feature: mouseover objects == show short description + stats like hit points of rocks
* feature: a graphical bar along the side to visually indicate depth

# 0.9 - beta test period

* feature: show “Please play on a desktop or laptop; mobile is not currently supported” if mobile is detected
* seek balance feedback from beta testers and incorporate changes that are deemed useful

# 1.0 - public release

* fix bugs reported by 1.0 users

# 1.1 - release bug fix version
