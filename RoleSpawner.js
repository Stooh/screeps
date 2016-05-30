var RoleSpawner = {
    label: 'spawner',
    scalableBody: [{part: WORK}, {part: CARRY}, {part: MOVE}],
};

/** @param Creep creep */
RoleSpawner.run = function(creep, roomHandler) {
    var roomCache = roomHandler.cache;

    // on veut faire au plus vite au plus court pour "lancer la machine"
    if(creep.carry.energy < creep.carryCapacity) {
        var target = creep.pos.findClosestByRange(roomCache.activeSources());
        if(creep.pos.isNearTo(target)) {
            creep.harvest(target);
        } else {
            creep.moveTo(target);
        }
    } else {
        var target = creep.pos.findClosestByRange(roomCache.mySpawnsEnergy());
        if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
};

module.exports = RoleSpawner;
