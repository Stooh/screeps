const ROLES = require('Roles');

/** @param Room room */
function CreepFactory(roomHandler) {
    this.roomHandler = roomHandler;
    this.room = roomHandler.room;
};

CreepFactory.prototype.getBodyFromRole = function(roleName) {
    var role = ROLES[roleName];

    if(!role) {
        console.log('Unknown role: ' + roleName);
        return undefined;
    }

    // we chose level from the number of available extensions
    var maxCost = 300 + 50 * this.roomHandler.cache.mySpawnExt().length;
    // TODO use energy input too ?

    // we ask for the highest level we can get depending on our number of extension
    for(var i = role.bodies.length-1; i>=0; --i) {
        var bodyInfo = role.bodies[i];

        if(bodyInfo.cost <= maxCost)
            return bodyInfo.body;
    }

    // fallback on body 0
    console.log('fallback body 0 : ' + roleName + '(cost: ' + role.bodies[0] + ', vs ' + maxCost + ')');
    return role.bodies[0].body;
}

CreepFactory.prototype.createCreep = function(role, count) {
	count = count || 1;
    var spawns = this.room.find(FIND_MY_SPAWNS);
    var body = this.getBodyFromRole(role);

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
