var Populations = require('Populations');
var CreepFactory = require('CreepFactory');
var PopulationManager = require('PopulationManager');
var Hive = require('Hive');
var RoomCache = require('RoomCache');

/** @param Room room */
function RoomHandler(room) {
    this.room = room;
    this.cache = new RoomCache(room);
    this.populations = new Populations(room, this.cache);
    this.populationMgr = new PopulationManager();
    this.creepFactory = new CreepFactory(room);
    this.hive = new Hive();
}

RoomHandler.prototype.run = function() {
    this.cache.clear();
    
    this.populations.update();
    
    var toBuild = this.populationMgr.manage(this.room, this.populations.values());
    
    for(var n in toBuild) {
        this.creepFactory.createCreep(n, toBuild[n]);
    }
    
    this.hive.run(this.room, this.cache);
}

module.exports = RoomHandler;
