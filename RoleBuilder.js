var Constructions = require('Constructions');

var RoleBuilder = {
    label: 'builder',
    scalableBody: [{part: CARRY, count: 2}, {part: WORK}, {part: MOVE}],
};

function getTarget(creep) {
    var tId = creep.memory.target;
    return tId ? Game.getObjectById(tId) : undefined;
}

function choseTargetSite(creep, roomHandler) {
    // choose a new target
    var targets = roomHandler.cache.myConstructionSitesSafe();
    if(!targets.length)
        return;

    // we chose the highest priority construction sites
    // TODO cache ? should not happen often in the same room and same tick
    for(var i = 0; i < Constructions.CONSTRUCTION_PRIORITY; ++i) {
        var filtered = targets.filter(function(v) {return v.structureType == CONSTRUCTION_PRIORITY[i];});
        if(filtered.length) {
            targets = filtered;
            break;
        }
    }

    var target = creep.pos.findClosestByRange(targets);
    if(!target)
        return;

    creep.memory.target = target.id;
    return target;
}

/** @param Creep creep */
RoleBuilder.run = function(creep, roomHandler) {
    var target = getTarget(creep);
    if(!target) {
        target = choseTargetSite(creep, roomHandler);

        if(!target)
            return;
    }

    var err = creep.build(target)
    if(err == ERR_NOT_IN_RANGE)
        creep.moveTo(target);
    if(err != OK)
        delete creep.memory.target;
};

module.exports = RoleBuilder;
