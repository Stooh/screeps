var RoleHarvester = {};

/** @param Room room */
RoleHarvester.runRoom = function(room, roomCache) {
    var creeps = roomCache.myCreepsHarvester();
    
    var sources = roomCache.sources();
    if(sources.length <= 0) {
        console.log('no source');
        return;
    }
    
    for(var i = 0; i < creeps.length; ++i) {
        var creep = creeps[i];
        
        if(!creep.memory.targetSource) {
            var r = Math.floor(Math.random()*sources.length);
            creep.memory.targetSource = sources[r].id;
        }
    }
}

/** @param Creep creep */
RoleHarvester.run = function(creep, roomCache) {
    var target = Game.getObjectById(creep.memory.targetSource);
    if(!target)
        return;
    if(creep.pos.isNearTo(target)) {
        creep.harvest(target);
    } else {
        creep.moveTo(target);
    }
    if(creep.carry.energy < creep.carryCapacity) {
        return;
        var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
    }
};

module.exports = RoleHarvester;
