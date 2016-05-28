var HelperFunctions = require('HelperFunctions');

const REFRESH_DELAY = 20;

const WANTED_POPULATION = {
    spawner: {
        min: 2,
        max: 2,
        cost: 1,
    },

    upgrader: {
      max: 3,
      cost: 100,
    },

    harvester: {
        min: 1,
        maxSource: 2,
        cost: 60
    },

    energy: {
        min:1,
        max:20,
        cost: 90,
    },

    builder: {
        max: 10,
        cost: 150,
    },
};

/** @param Room room */
function PopulationManager(roomHandler) {
    this.room = roomHandler.room;
    this.roomCache = roomHandler.cache;
    this.populations = roomHandler.populations;
    this.memory = HelperFunctions.createMemory('populationMgr', this.room);
}

PopulationManager.prototype.calculateWanted = function() {
    if(!HelperFunctions.outdated(this, REFRESH_DELAY))
        return;

    var sourceCount = this.roomCache.sources().length;

    var res = {};

    for(var role in WANTED_POPULATION) {
        var wanted = WANTED_POPULATION[role];

        var min = wanted.min ? wanted.min : 0;
        if(wanted.minSource)
            min += wanted.minSource * sourceCount;
        var max = wanted.max ? wanted.max : 0;
        if(wanted.maxSource)
            max += wanted.maxSource * sourceCount;
        var cost = wanted.cost ? wanted.cost : 100;

        res[role] = {min: min, max: max, cost: cost};
    }

    this.memory.wanted = res;
    return res;
}

PopulationManager.prototype.getWanted = function() {
    this.calculateWanted();

    return this.memory.wanted;
}

PopulationManager.prototype.manage = function() {
    var populations = this.populations.values();
    var wanteds = this.getWanted();

    var best = undefined;
    var bestCount = 0;
    var bestCost = 0;
    var bestMin = false;

    for(var role in wanteds) {
        var wanted = wanteds[role];
        var actual = populations[role] || 0;

        if(actual >= wanted.max)
            continue;

        var needMin = wanted.min > actual;
        // le cout incluant la nouvelle unité produite
        var cost = (actual + 1) * wanted.cost;

        if(!best || (needMin && !bestMin) || (cost < bestCost)) {
            best = role;
            bestCost = cost;
            bestMin = needMin;
            bestCount = 1;
        }
    }

    if(best === undefined)
        return {};

    var res = {};

    res[best] = bestCount;
    return res;
}

module.exports = PopulationManager;
