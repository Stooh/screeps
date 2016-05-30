var RoleUpgrader = {
    label: 'upgrader',
    scalableBody: [{part: MOVE, count: 0}, {part: CARRY, count:3}, {part: WORK, count: 1}],
};

/** @param Creep creep */
RoleUpgrader.run = function(creep, roomHandler) {
    var controller = creep.room.controller;
    if(creep.carry.energy == 0) {
        if(!creep.pos.isNearTo(controller))
            creep.moveTo(creep.room.controller);
    }
    else {
        if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller);
        }
    }
};

module.exports = RoleUpgrader;
