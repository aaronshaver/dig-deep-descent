
* Create battery and drill classes
    * get this "const battery = 1000;" out of game.js and into a getBattery()
* Convert "const depth = Math.abs(this.ship.getZ()) * 10;" into a getDisplayDepth() function
* Extract and hoist constants toward the tops of files, functions where it makes sense
    * i.e. where I could see myself adjusting those values
* add unit, integration tests
* (after finished refactoring) ask Claude how well my code adheres to SOLID OO design principles to see if there's anything more I can do to build a solid (NPI) foundation
* feature: introduce a slight delay on keypress so that you can't just zip through rocks or fly across the screen
* feature: add first mineral, and be sure to replace rocks with minerals rather than placing them on empty ground
* feature: mouseover objects == show short description
* feature: local storage of game data + New Game button which resets everything
* feature: new class: VerticalHole and graphics to indicate it
