var HelperFunctions = require('HelperFunctions');

const ROLE_ENERGY = 'energy';

const FULL_SCORE = 1000;
const CONSECUTIVE_FULL_SCORE = 200;

const EMPTY_SCORE = 1000;
const CONSECUTIVE_EMPTY_SCORE = 200;

const TARGETED_BY_CHECK_DELAY = 10;

const FILTER_IDLE = function(c) {return !c.memory.target};
const FILTER_GIVER_TARGET = function(t) {return t.memory.energyScore > 0 && t.wantsGiveEnergy();};
const FILTER_TAKER_TARGET = function(t) {return t.memory.energyScore > 0 && !t.wantsGiveEnergy();};
const SORT_ENERGY_SCORE = function(a,b) {return a.memory.energyScore - b.memory.energyScore;};

var RoleEnergy = {
    label: ROLE_ENERGY,
    bodyStructs: [
        {carry:2, move:2},
        {carry:5, move:5},
        {carry:10, move:10},
        {carry:25, move:25}
    ],
};

/** @param Room room */
RoleEnergy.runWorld = function() {
}

/** @param Room room */
RoleEnergy.runRoom = function(roomHandler) {

    var roomCache = roomHandler.cache;

    var targets = roomCache.usesEnergyTransfer();
    RoleEnergy.updateEnergyScores(targets);

    // on recupere les idle
    var creeps = roomCache.myCreepsEnergy().filter(FILTER_IDLE);

    // on affecte chaque idle au target le plus urgent
    if(creeps.length) {
        // TODO : sort w/ distance for every creep. We probably have only one idle at a time anyway
        targets.sort(SORT_ENERGY_SCORE);
        var giverTargets = targets.filter(FILTER_GIVER_TARGET);
        var takerTargets = targets.filter(FILTER_TAKER_TARGET);

        for(var i = 0; i < creeps.length; ++i) {
            var creep = creeps[i];
            if(giverTargets.length == 0 && takerTargets.length == 0)
                break;

            var target;
            if(creep.curEnergy() > 0 && takerTargets.length > 0) {
                target = takerTargets.pop();
            } else if(creep.curEnergy() <= creep.maxEnergy() && giverTargets.length > 0) {
                target = giverTargets.pop();
            }

            if(!target)
            	continue;

            target.memory.energyTargetedBy = creep.id;
            target.memory.energyTargetedByLastCheck = Game.time;
            creep.memory.target = target.id;
        }
    }
}

RoleEnergy.updateEnergyScores = function(targets) {
    for(var i = 0; i < targets.length; ++i) {
        var target = targets[i];

        // If already targeted. ignore
        if(target.memory.energyTargetedBy) {
            // we check from time to time that the targeting creep is still valid
            if(HelperFunctions.outdated(target, TARGETED_BY_CHECK_DELAY, 'energyTargetedByLastCheck')) {
                var creep = Game.getObjectById(target.memory.energyTargetedBy);
                if(!creep || !creep.memory || !creep.memory.role == ROLE_ENERGY) {
                    delete target.memory.energyTargetedBy;
                } else {
                    target.memory.energyScore = 0;
                    continue;
                }
            } else {
                target.memory.energyScore = 0;
                continue;
            }
        }

        var wantsGive = target.wantsGiveEnergy();
        var critical;
        var percentCritical;
        if(wantsGive) {
            critical = target.curEnergy() >= target.maxEnergy();
            percentCritical = critical ? 100 : 100 * target.curEnergy() / target.maxEnergy();
        } else {
            critical = target.curEnergy() <= 0;
            percentCritical = critical ? 100 : (100 - 100 * (target.curEnergy() / target.maxEnergy()))
        }

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

        target.memory.energyScore = score;
    }
}

/** @param Creep creep */
RoleEnergy.run = function(creep, roomHandler) {
    var tId = creep.memory.target;
    if(!tId)
        return;

    var target = Game.getObjectById(tId);
    if(!target) {
        delete creep.memory.target;
        return;
    }

    if(target.wantsGiveEnergy()) {
        if(target.curEnergy() <= 0 || creep.curEnergy() >= creep.maxEnergy()) {
            delete creep.memory.target;
            delete target.memory.energyTargetedBy;
            return;
        }

        if(target.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            creep.moveTo(target);
    } else {
        if(creep.curEnergy() <= 0 || target.curEnergy() >= target.maxEnergy()) {
            delete creep.memory.target;
            delete target.memory.energyTargetedBy;
            return;
        }

        if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
};

module.exports = RoleEnergy;
