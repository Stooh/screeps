const ROLES = require('Roles');

function Hive() {
}

/** @param Room room */
Hive.prototype.run = function(room, roomCache) {
    var creeps = roomCache.myCreeps();
    
    for(var r in ROLES) {
        var role = ROLES[r];
        role.runRoom(room, roomCache);
    }
    
    for(var i = 0; i < creeps.length; ++i) {
        var creep = creeps[i];
        var role = ROLES[creep.memory.role];
        if(role)
            role.run(creep, roomCache);
    }
}

module.exports = Hive;
