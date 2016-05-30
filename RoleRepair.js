var Constructions = require('Constructions');

var RoleRepair = {
    label: 'repair',
    scalableBody: [{part: CARRY}, {part: WORK}, {part: MOVE}],
};

const KEEP_REPEARING_TIME = 20;
const PRIORITY_SCORE = 10000;
const DISTANCE_SCORE = 100;
const HEALTH_SCORE = 1;
const HEALTH_BASE_SCORE = 10000000;

function getTarget(creep) {
    var tId = creep.memory.targetRepair;
    return tId ? Game.getObjectById(tId) : undefined;
}

function targetScore(creep, target) {
    if(target.hits >= target.hitsMax)
        return 0;

    // distance
    var score = DISTANCE_SCORE * creep.pos.getDistance(target.pos);

    // structureType
    var order = Constructions.CONSTRUCTION_PRIORITY;
    for(var i = 0; i < order.length; ++i)
        if(order[i] == target.structureType) {
            score += PRIORITY_SCORE * (order.length - i);
            break;
        }

    // currentHealth
    score += HEALTH_BASE_SCORE - target.hits * HEALTH_SCORE;

    return score;
}

function choseTargetSite(creep, roomHandler) {
    // choose a new target
    var targets = roomHandler.cache.repairables();
    if(!targets.length)
        return;

    var best = undefined;
    var bestScore;
    for(var i = 0; i < targets.length; ++i) {
        var target = targets[i];

        var score = getTargetScore(creep, target);
        if(!best || score > bestScore) {
            best = target;
            bestScore = score;
        }
    }

    if(!best)
        return;

    creep.memory.targetRepair = best.id;
    delete creep.memory.targetRepairStartTime;
    return target;
}

/** @param Creep creep */
RoleRepair.run = function(creep, roomHandler) {
    var target = getTarget(creep);
    if(!target) {
        target = choseTargetSite(creep, roomHandler);

        if(!target)
            return;
    }

    var err = creep.repair(target)
    if(err == ERR_NOT_IN_RANGE)
        creep.moveTo(target);
    else if(err != OK) {
        delete creep.memory.targetRepair;
        delete creep.memory.targetRepairStartTime;
    } else if(!creep.memory.targetRepairStartTime)
        creep.memory.targetRepairStartTime = Game.time; // init start repair time
    else if(Game.time - creep.memory.targetRepairStartTime > KEEP_REPEARING_TIME) {
        delete creep.memory.targetRepair;
        delete creep.memory.targetRepairStartTime;
    }
};

module.exports = RoleRepair;
