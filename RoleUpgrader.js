var RoleUpgrader = {
    label: 'upgrader',
    bodyStructs: [
        {work:2, carry:1, move:1},
        {work:3, carry:6, move:1},
        {work:6, carry:9, move:1}
    ],
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
