var RoleEnergy = require('RoleEnergy');
var Rooms = require('Rooms');

var LegacyExtends = {};

[StructureExtension, Source, ConstructionSite].forEach(
    function(v) {
        if(v.prototype.hasOwnProperty('memory'))
            return;

        Object.defineProperty(v.prototype, 'memory', {
            get: function() {
                if(_.isUndefined(Memory.gameObject)) {
                    Memory.gameObject = {};
                }
                if(!_.isObject(Memory.gameObject)) {
                    return undefined;
                }
                return Memory.gameObject[this.id] = Memory.gameObject[this.id] || {};
            },
            set: function(value) {
                if(_.isUndefined(Memory.gameObject)) {
                    Memory.gameObject = {};
                }
                if(!_.isObject(Memory.gameObject)) {
                    throw new Error('Could not set gameObject memory');
                }
                Memory.gameObject[this.id] = value;
            }
        })
    }
);

RoomPosition.prototype.getDistance = function(other) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
}

Creep.prototype.usesEnergyTransfer = function() {
    return this.memory.role == 'builder'
    || this.memory.role == 'upgrader'
    || this.memory.role == 'harvester'
    || this.memory.role == 'repair';
}

Creep.prototype.wantsGiveEnergy = function() {
    return this.memory.role == 'harvester';
}

Creep.prototype.curEnergy = function() {
    return this.carry.energy;
}

Creep.prototype.maxEnergy = function() {
    return this.carryCapacity;
}

Creep.prototype.needsEnergyTransfer = function() {
    return this.memory.role != 'energy' &&
        this.memory.role != 'harvester' &&
        this.memory.role != 'spawner' &&
        this.carry.energy < this.carryCapacity;
}

Structure.prototype.usesEnergyTransfer = function() {
    return this.maxEnergy() > 0;
}

Structure.prototype.wantsGiveEnergy = function() {
    return false;
}

Structure.prototype.curEnergy = function() {
    return this.energy;
}

Structure.prototype.maxEnergy = function() {
    return this.energyCapacity;
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
