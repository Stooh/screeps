var Role = require('Role');
var RoleHarvester = require('RoleHarvester');
var RoleUpgrader = require('RoleUpgrader');
var RoleEnergy = require('RoleEnergy');
var RoleSpawner = require('RoleSpawner');

const ROLES = {
    none: new Role('none', [], () => {}),
    harvester: new Role('harvester', [WORK, WORK, CARRY, MOVE], RoleHarvester),
    upgrader: new Role('upgrader', [WORK, WORK, CARRY, MOVE], RoleUpgrader),
    energy: new Role('energy', [CARRY, CARRY, MOVE, MOVE], RoleEnergy),
    spawner: new Role('spawner', [WORK, CARRY, MOVE], RoleSpawner),
};

module.exports = ROLES;
