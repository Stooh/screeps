var HelperFunctions = require('HelperFunctions');

const ROLES = require('Roles');

const REHAB_DELAY = 20;

/** @param RoomHandler roomHandler */
function CreepRoleRehab(roomHandler) {
    this.roomHandler = roomHandler;
    this.room = roomHandler.room;
    this.memory = HelperFunctions.createMemory('creepRehab', this.room);
}

/** @param Creep creep */
function getExistingBodyStruct(creep) {
    var res = {};
    for(var i= 0; i < creep.body.length; ++i) {
        var t = creep.body[i].type;
        res[t] = (res[t] || 0) + 1;
    }
    return res;
}

/** @param Creep creep */
CreepRoleRehab.prototype.rehabCreep = function(creep) {
    // we try to give a role to creeps that oddly dont have one

    var bodyStruct = getExistingBodyStruct(creep);

    if(creep.memory.role) {
        // We check if we can still do our role
        var role = ROLES[creep.memory.role];
        if(role) {
            var level = role.getMaxExistingBodyLevel(bodyStruct);
            // if that's the case we keep it that way
            if(level >= 0)
                return;
        }
    }

    // TODO : use wished populations too
    var best;
    var bestLevel;
    for(var r in ROLES) {
        var role = ROLES[r];

        var level = role.getMaxExistingBodyLevel(bodyStruct);
        if(level >= 0 && (!best || level > bestLevel)) {
            best = r;
            bestLevel = level;
        }
    }

    if(best) {
        console.log('Creep rehab: ' + creep.name + ' from ' + creep.memory.role + ' to ' + best);
        creep.memory.role = best;
        creep.memory.roleLvl = bestLevel;
        creep.memory.rehabAt = Game.time;
    } else {
        console.log('Creep rehab failed, suicide ' + creep.name);
        // TODO Suicide role ? So that we try to get recycled ?
        creep.suicide();
    }
}

CreepRoleRehab.prototype.run = function() {
    if(!HelperFunctions.outdated(this, REHAB_DELAY))
        return;

    var cache = this.roomHandler.cache;

    var creeps = cache.myCreeps();
    for(var i = 0; i < creeps.length; ++i)
        this.rehabCreep(creeps[i]);
}

module.exports = CreepRoleRehab;
