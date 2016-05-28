var RoleEnergy = require('RoleEnergy');
var Rooms = require('Rooms');

var LegacyExtends = {};

Creep.prototype.needsEnergyTransfer = function() {
    return this.memory.role != 'energy' &&
        this.memory.role != 'harvester' &&
        this.memory.role != 'spawner' &&
        this.carry.energy < this.carryCapacity;
}

Structure.prototype.needsEnergyTransfer = function() {
    return this.energy < this.energyCapacity;
}

Room.prototype.getHandler = function() {
    return Rooms.instance.rooms[this.name];
}

Room.prototype.getCache = function() {
    return getHandler().cache;
}

Room.prototype.getPopulations = function() {
    return getHandler().populations;
}

Room.prototype.getPopulationMgr = function() {
    return getHandler().populationMgr;
}

Room.prototype.getHive = function() {
    return getHandler().hive;
}

Room.prototype.getCreepFactory = function() {
    return getHandler().creepFactory;
}

module.exports = LegacyExtends;
