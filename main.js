var LegacyExtends = require('LegacyExtends');
var HelperFunctions = require('HelperFunctions');
var Rooms = require('Rooms');

module.exports.loop = function () {

    // console.log('energy: ' + Game.rooms.sim.energyAvailable);
    console.log(Game.time + "> cpu used: " + Game.cpu.getUsed());

    Rooms.instance.run();

    HelperFunctions.garbageCollection();
}
