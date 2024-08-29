
* Extract highly canvas-oriented code out of "thing" classes into a Graphics class

* Convert "const depth = Math.abs(this.ship.getZ()) * 10;" into a getDisplayDepth() function
* Extract and hoist constants toward the tops of files, functionss, functions
* Create battery and drill classes
    * get this "const battery = 1000;" out of game.js and into a getBattery()
* add unit, integration tests
* feature: introduce a slight delay on keypress so that you can't just zip through rocks or fly across the screen
* feature: add first mineral, and be sure to replace rocks with minerals rather than placing them on empty ground
* feature: mouseover objects == show short description
* feature: local storage of game data + New Game button which resets everything
* feature: new class: VerticalHole and graphics to indicate it
