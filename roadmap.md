
# 0.2 - mineral system

* gem and rock rarity system for "fading" rock and gem types in and out depending on level
    * maybe min percent, increment, decrement, max percent values?
* gems should have a radius attribute
* feature: add first mineral, and be sure to replace rocks with minerals rather than placing them on empty ground
* feature: minerals are hidden until scanner reveals them
* bump the version number in index.html

# 0.3 - sell minerals and buy upgrades

* feature: able to sell minerals
* feature: able to buy a single upgrade at the surface and use it
* bump the version number in index.html

# 0.4 - add hazards

* feature: at least one hazard

# 0.5 - visual effects + other minor features

* feature: introduce a slight delay on keypress so that you can't just zip through rocks or fly across the screen
* feature: suffix battery level with (warning) and (DANGER) for low battery levels
* feature: visual effects pipeline
    * start using it for random triangles while digging
    * rock fragment triangles should be two steps lighter using a TDD function that takes color
* feature: new class: VerticalHole with darker color center, light outline on each affected level (two) to indicate it
* bump the version number in index.html

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

* feature: local storage of game data + New Game button which resets everything
* feature: mouseover objects == show short description + stats like hit points of rocks
* feature: a graphical bar along the side to visually indicate depth

# 0.9 - beta test period

* feature: show “Please play on a desktop or laptop; mobile is not currently supported” if mobile is detected
* seek balance feedback from beta testers and incorporate changes that are deemed useful

# 1.0 - public release

* fix bugs reported by 1.0 users

# 1.1 - release bug fix version
