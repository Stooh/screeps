var RoleEnergy = require('RoleEnergy');

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

module.exports = LegacyExtends;
