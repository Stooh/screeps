var HelperFunctions = require('HelperFunctions');

const REFRESH_DELAY = 5;

/** @param {Room} room **/
function Populations(room, roomCache) {
    this.room = room;
    this.roomCache = roomCache;
    this.memory = HelperFunctions.createMemory('populations', room);
}

Populations.prototype.update = function() {
    var pops = {};
    var creeps = this.roomCache.myCreeps();
    
    for(var i = 0; i < creeps.length; i++) {
		var creepType = creeps[i].memory.role;
		if(!creepType)
		    creepType = 'none';
		    
		if(!pops[creepType])
		    pops[creepType] = 1;
		else
		    pops[creepType]++;
    }
    
    this.memory.value = pops;
};

Populations.prototype.values = function() {
    return this.memory.value;
}

module.exports = Populations;
