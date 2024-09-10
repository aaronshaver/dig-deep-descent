
# 0.3

* finish back-filling test coverage

# 0.4

* feature: introduce a slight delay on keypress so that you can't just zip through rocks or fly across the screen
* feature: visual effects pipeline, and start using it for random light brown triangles while digging
    * rock fragment triangles should be two steps lighter using a TDD function that takes color
* feature: suffix battery level with (warning) and (DANGER) for low battery levels
* feature: new class: VerticalHole + graphic on each affected level (two) to indicate it

# 0.5

* gem and rock rarity system for "fading" rock and gem types in and out depending on level
    * maybe min percent, increment, decrement, max percent values?
* gems should have a radius attribute
* feature: add first mineral, and be sure to replace rocks with minerals rather than placing them on empty ground
* feature: minerals are hidden until scanner reveals them

# 0.6

* feature: add PayPal donation links at bottom of left and right columns
* feature: white drill dot fades from white to black as correlated with percentage of battery
* feature: visual indicator of drill at work; maybe a ring, maybe a different color dot
* feature: correlate the # of triangles with the points of drill power to show increasing strength visually; i.e. 400 drill power should add more triangles than 100 power

# 0.7

* feature: mouseover objects == show short description + stats like hit points of rocks
* feature: add one-time-use items in addition to permanent upgrades to make it feel like an expedition/stocking up
    * need to detail this out before starting work
* feature: a graphical bar along the side to visually indicate depth

# 0.8

* feature: local storage of game data + New Game button which resets everything

# 0.9

* feature: show “Please play on a desktop or laptop; mobile is not currently supported” if mobile is detected
* seek balance feedback from beta testers
