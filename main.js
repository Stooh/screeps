var LegacyExtends = require('LegacyExtends');
var Rooms = require('Rooms');

var rooms = new Rooms();

module.exports.loop = function () {
    
    // console.log('energy: ' + Game.rooms.sim.energyAvailable);
    console.log("cpu used: " + Game.cpu.getUsed());

    rooms.run();
    
}
