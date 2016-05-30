var RoleHarvester = {
    label: 'harvester',
    bodyStructs: [
        {work:2, carry:1, move:1},
        {work:3, carry:6, move:1},
        {work:6, carry:9, move:1}
    ],
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
        this.suicide();

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
