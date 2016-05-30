var RoleHarvester = {
    label: 'harvester',
    scalableBody: [{part: MOVE, count: 0}, {part: CARRY, count:3}, {part: WORK, count: 1}],
};

/** @param Room room */
RoleHarvester.runRoom = function(roomHandler) {
    var ressourceSlots = roomHandler.ressourceSlots;
    var roomCache = roomHandler.cache;
    var creeps = roomCache.myCreepsHarvester();

    var sources = roomCache.sources();
    if(sources.length <= 0) {
        console.log('no source');
        return;
    }

    if(ressourceSlots.memory.availableSpots <= 0)
        return;

    for(var i = 0; i < creeps.length; ++i) {
        var creep = creeps[i];

        // give some source to idle creeps
        if(!creep.memory.targetSource) {
            for(var j= 0; j < sources.length; ++j) {
                var source = sources[j];
                if(source.memory.availableSpots > 0) {
                    source.memory.availableSpots --;
                    creep.memory.targetSource = source.id;
                    break;
                }
            }
        }
    }
}

/** @param Creep creep */
RoleHarvester.run = function(creep, roomHandler) {
    // No target && no spot, we're not needed
    if(!creep.memory.targetSource && roomHandler.ressourceSlots.memory.availableSpots <= 0)
        creep.suicide();

    var target = Game.getObjectById(creep.memory.targetSource);
    if(!target) {
        delete creep.memory.targetSource;
        return;
    }

    if(creep.pos.isNearTo(target)) {
        creep.harvest(target);
    } else {
        creep.moveTo(target);
    }
};

module.exports = RoleHarvester;
