const ROLE_ENERGY = 'energy';

var RoleEnergy = {};

/** @param Room room */
RoleEnergy.runWorld = function() {
}

/** @param Room room */
RoleEnergy.runRoom = function(roomHandler) {
    var roomCache = roomHandler.cache;
    var creeps = roomCache.myCreepsEnergy();
    var sources = roomCache.myCreepsHarvester();
    if(sources.length <= 0) {
        console.log('no harvester');
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
RoleEnergy.run = function(creep, roomHandler) {
    if(creep.carry.energy < creep.carryCapacity) {
        var source = Game.getObjectById(creep.memory.targetSource);
        if(!source)
            return;
        if(source.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    } else {
        /*var targets = creep.room.find(FIND_CREEPS, {
                filter: (creep) => {
                    return creep.memory.role != ROLE_ENERGY && creep.carry.energy < creep.carryCapacity;
                }
        });*/
        var targets = roomHandler.cache.needsEnergyTransfer();

        /*creep.room.find(FIND_CREEPS, {
                filter: (creep) => {
                    return creep.needsEnergyTransfer(); //memory.role != ROLE_ENERGY && creep.carry.energy < creep.carryCapacity;
                }
        });*/
        if(targets.length > 0) {
            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        }
    }
};

module.exports = RoleEnergy;
