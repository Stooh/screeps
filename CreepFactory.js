const ROLES = require('Roles');

/** @param Room room */
function CreepFactory(roomHandler) {
    this.room = roomHandler.room;
}

function getBodyFromRole(roleName) {
    var role = ROLES[roleName];

    if(!role) {
        console.log('Unknown role: ' + roleName);
        return [];
    }

    return role.body;
}

CreepFactory.prototype.createCreep = function(role, count = 1) {
    var spawns = this.room.find(FIND_MY_SPAWNS);
    var body = getBodyFromRole(role);

    for(var c = 0; c < count; ++c) {
        var created = false;
        for(var i = 0; i < spawns.length; ++i) {
            var spawn = spawns[i];

           // if(spawn.canCreateCreep(body)) {
                var creep = spawn.createCreep(body, '', {role: role});
                if(creep) {
                    created = true;
                    break;
                }
            //}
        }

        if(!created)
            break;
    }

    return c;
}

module.exports = CreepFactory;
