var HelperFunctions = require('HelperFunctions');

const ROLE_ENERGY = 'energy';

const FULL_SCORE = 1000;
const CONSECUTIVE_FULL_SCORE = 50;

const EMPTY_SCORE = 1000;
const CONSECUTIVE_EMPTY_SCORE = 50;

const DISTANCE_SCORE = 100;

const TARGETED_BY_CHECK_DELAY = 10;
const TARGET_CHECK_DELAY = 10;

const FILTER_IDLE = function(c) {return !c.memory.target};
const FILTER_POSITIVE_ENERGY_SCORE = function(v) {return v.memory.energyScore > 0;};

var RoleEnergy = {
    label: ROLE_ENERGY,
    scalableBody: [{part: MOVE}, {part: CARRY}],
};

/** @param Room room */
RoleEnergy.runWorld = function() {
}

/** @param Room room */
RoleEnergy.runRoom = function(roomHandler) {

    var roomCache = roomHandler.cache;

    var targets = roomCache.usesEnergyTransfer();
    updateEnergyStatus(targets);

    // on recupere les idle
    var creeps = getIdleCreeps(roomHandler);

    if(!creeps.length)
        return;

    // we keeps only targets with positive energy score
    targets = targets.filter(FILTER_POSITIVE_ENERGY_SCORE);

    if(!targets.length)
        return;

    // we most likely will have only one 'usefull' idle at a time
    // so we try to maximise target score for a every idle
    for(var i = 0; i < creeps.length; ++i) {
        var creep = creeps[i];

        var best = undefined;
        var bestScore = 0;
        var bestAction = 0;

        for(var j = 0; j < targets.length; ++j) {
            var target = targets[j];
            var wantsGive = target.wantsGiveEnergy();

            var action = getAction(creep, wantsGive);

            //if we cant help this target, we skip it
            if(!action)
                continue;

            // if we can help we calculate a score
            var targetScore = getTargetScore(creep, target, wantsGive, action);
            if(targetScore <= 0)
                continue;

            if(!best || bestScore < targetScore) {
                best = target;
                bestScore = targetScore;
                bestAction = action;
            }
        }

        if(!best)
            continue;

        if(!best.memory.energyTargetedBys)
            best.memory.energyTargetedBys = {};

        best.memory.energyTargetedBys[creep.id] = bestAction;
        best.memory.energyTargetedByLastCheck = Game.time;
        best.memory.energyFutureAction += bestAction;

        creep.memory.target = best.id;
        creep.memory.targetAction = bestAction;
    }
};

function getTargetScore(creep, target, wantsGive, action) {
    var score = target.memory.energyScore;
    var curEnergy = target.memory.curEnergy;

    var action = action > 0 ?
        Math.min(action, target.maxEnergy() - curEnergy)
        : Math.max(action, curEnergy);

    if(action <= 0)
        return 0;

    // now we make a percent -> how much the action will mean
    // we want to give/take a good percent of one of the two max capacities
    var maxCapacity = Math.min(creep.maxEnergy(), target.maxEnergy());
    var percentEfficiency = Math.max(0, Math.min(100, 100 * Math.abs(action) / maxCapacity));

    // we give a bonus if we're close to target
    var distanceScore = 100 * DISTANCE_SCORE * (1000 - creep.pos.getDistance(target.pos));

    return score * percentEfficiency + distanceScore;
};

function getIdleCreeps(roomHandler) {
    var creeps = roomHandler.cache.myCreepsEnergy();

    // check if target is still valid
    checkTargets(roomHandler, creeps);

    return creeps.filter(FILTER_IDLE);
};

function isEnergyCritical(target, wantsGive, curEnergy) {
    return wantsGive ?
        curEnergy >= target.maxEnergy()
        : curEnergy <= 0;
};

function getPercentCritical(target, wantsGive, curEnergy) {
    var percentFull = Math.max(0, Math.min(100, 100 * curEnergy / target.maxEnergy()));
    return wantsGive ? percentFull : 100 - percentFull;
};

function getAction(creep, targetWantsGive) {
    return targetWantsGive ?
        creep.curEnergy() - creep.maxEnergy() // TAKE maxEnergy - curEnergy
        : creep.curEnergy();
};

function checkTargets(roomHandler, creeps) {
    if(!HelperFunctions.outdated(roomHandler.room, TARGET_CHECK_DELAY, 'energyTargetLastCheck'))
        return;

    for(var i = 0; i < creeps.length; ++i) {
        var creep = creeps[i];

        var tId = creep.memory.target;
        if(!tId)
            continue;

        // check target is still valid and targeted by us
        var target = Game.getObjectById(tId);
        if(!target
            || typeof target.usesEnergyTransfer != 'function'
            || !target.usesEnergyTransfer()
            || !target.memory
            || !target.memory.energyTargetedBys
            || !target.memory.energyTargetedBys[creep.id]) {
            delete creep.memory.target;
            continue;
        }

        // we dont check if our action is usefull, as it's done by the target
    }
};

function checkTargetedBys(target, wantsGive) {
    if(!HelperFunctions.outdated(target, TARGETED_BY_CHECK_DELAY, 'energyTargetedByLastCheck'))
        return;

    var targetedBys = target.memory.energyTargetedBys;
    var futureAction = 0;
    for(var tId in target.memory.energyTargetedBys) {
        var creep = Game.getObjectById(tId);

        // check creep is still valid and targeting us
        if(!creep
            || !creep.memory
            || creep.memory.role != ROLE_ENERGY
            || creep.memory.target != target.id
        ) {
            delete targetedBys[tId];
            continue;
        }

        // check if action of creep is still usefull
        var action = getAction(creep, wantsGive);
        if(action == 0) {
            // no need to target us anymore
            delete creep.memory.target;
            delete targetedBys[tId];
            continue;
        }

        futureAction += action;
    }

    // clean up if empty
    if(futureAction == 0)
        delete target.memory.energyTargetedBys;

    target.memory.energyFutureAction = futureAction;
};

function updateEnergyStatus(targets) {
    for(var i = 0; i < targets.length; ++i) {
        var target = targets[i];

        var curEnergy = target.curEnergy();
        var wantsGive = target.wantsGiveEnergy();

        // If already targeted
        if(target.memory.energyTargetedBys) {
            // we check from time to time that the targeting creep is still valid
            checkTargetedBys(target, wantsGive);

            // we take into account the targeting incoming action
            curEnergy = Math.max(0, Math.min(target.maxEnergy(), curEnergy + target.memory.energyFutureAction));
        }

        var critical = isEnergyCritical(target, wantsGive, curEnergy);
        var percentCritical = critical ? 100 : getPercentCritical(target, wantsGive, curEnergy);

        var consecutiveCritical = 0;
        if(critical) {
            consecutiveCritical = (target.memory.lastEnergyCritical == Game.time - 1) ?
                target.memory.consecutiveEnergyCritical + 1 : 1;

            target.memory.lastEnergyCritical = Game.time;
            target.memory.consecutiveEnergyCritical = consecutiveCritical;
        }

        var score;
        if(wantsGive) {
            score = FULL_SCORE * percentCritical + 100 * consecutiveCritical * CONSECUTIVE_FULL_SCORE;
        } else {
            score = EMPTY_SCORE * percentCritical + 100 * consecutiveCritical * CONSECUTIVE_EMPTY_SCORE;
        }

        target.memory.curEnergy = curEnergy;
        target.memory.energyScore = score;
    }
};

function clearTarget(creep, target) {
    if(!creep)
        return;
    delete creep.memory.target;
    var action = creep.memory.targetAction || 0;
    delete creep.memory.targetAction;

    if(target && target.memory.energyTargetedBys) {
        delete target.memory.energyTargetedBys[creep.id];
        target.memory.energyFutureAction -= action;
    }
}

/** @param Creep creep */
RoleEnergy.run = function(creep, roomHandler) {
    var tId = creep.memory.target;
    if(!tId)
        return;

    var target = Game.getObjectById(tId);
    if(!target) {
        clearTarget(creep, target);
        return;
    }

    var giver;
    var taker;
    if(target.wantsGiveEnergy()) {
        giver = target;
        taker = creep;
    } else {
        giver = creep;
        taker = target;
    }

    if(giver.curEnergy() <= 0 || taker.curEnergy() >= taker.maxEnergy()) {
        clearTarget(creep, target);
        return;
    }

    if(giver.transfer(taker, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    } else {
        // if it worked, or failed for another reason, our work is done
        clearTarget(creep, target);
    }
};

module.exports = RoleEnergy;
