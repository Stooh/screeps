var Role = require('Role');
var RoleHarvester = require('RoleHarvester');
var RoleUpgrader = require('RoleUpgrader');
var RoleEnergy = require('RoleEnergy');
var RoleSpawner = require('RoleSpawner');
var RoleBuilder = require('RoleBuilder');
var RoleFighter = require('RoleFighter');
var RoleRepair = require('RoleRepair');


function generateRoles() {
    var res = {};

    [
        RoleHarvester,
        RoleUpgrader,
        RoleEnergy,
        RoleSpawner,
        RoleBuilder,
        RoleFighter,
        RoleRepair,
    ].forEach(function(r) {
        var role = new Role(r);
        res[role.label] = role;
    });

    return res;
}

const ROLES = generateRoles();

module.exports = ROLES;
