const ROLES = require('Roles');

/** @param Room room */
function Hive(roomHandler) {
    this.roomHandler = roomHandler;
    this.room = roomHandler.room;
    this.roomCache = roomHandler.cache;
}

/** @param Room room */
Hive.prototype.run = function() {
    var creeps = this.roomCache.myCreeps();

    for(var r in ROLES) {
        var role = ROLES[r];
        role.runRoom(this.roomHandler);
    }

    for(var i = 0; i < creeps.length; ++i) {
        var creep = creeps[i];
        var role = ROLES[creep.memory.role];
        if(role)
            role.run(creep, this.roomHandler);
    }
}

module.exports = Hive;
