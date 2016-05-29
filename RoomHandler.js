var Populations = require('Populations');
var CreepFactory = require('CreepFactory');
var PopulationManager = require('PopulationManager');
var Hive = require('Hive');
var RoomCache = require('RoomCache');
var Constructions = require('Constructions');
var CreepRoleRehab = require('CreepRoleRehab');

/** @param Room room */
function RoomHandler(room) {
    this.room = room;
    this.cache = new RoomCache(room);
    this.hive = new Hive(this);
    this.populations = new Populations(this);
    this.creepFactory = new CreepFactory(this);
    this.populationMgr = new PopulationManager(this);
    this.constructions = new Constructions(this);
    this.creepRoleRehab = new CreepRoleRehab(this);
}

RoomHandler.prototype.run = function() {
    this.cache.clear();

    this.creepRoleRehab.run();

    this.populations.update();

    var toBuild = this.populationMgr.manage();

    for(var n in toBuild) {
        this.creepFactory.createCreep(n, toBuild[n]);
    }

    this.hive.run();

    this.constructions.run();
}

module.exports = RoomHandler;
