const ROLES = require('Roles');

/** @param Room room */
function CreepFactory(roomHandler) {
    this.roomHandler = roomHandler;
    this.room = roomHandler.room;
}

function getBodyFromRole(roleName) {
    var role = ROLES[roleName];

    if(!role) {
        console.log('Unknown role: ' + roleName);
        return undefined;
    }

    // for now only level 1
    return role.bodies[0].body;
}

CreepFactory.prototype.createCreep = function(role, count) {
	count = count || 1;
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
