var HelperFunctions = require('HelperFunctions');

const REFRESH_DELAY = 20;

const WANTED_POPULATION = {
    spawner: {
        min: 2,
        max: 2,
        weight: 300,
    },
    
    upgrader: {
      min: 1,
      max: 1,
      weight: 100,
      source: 0,
    },
    
    harvester: {
        min: 3,
        max: 5,
        weight: 200,
        source: 1,
    },
    
    energy: {
        min:5,
        max:10,
        weight: 20,
    },
};

/** @param Room room */
function PopulationManager(room) {
    this.room = room;
    this.memory = HelperFunctions.createMemory('populationMgr', room);
}

/*PopulationManager.prototype.calculateWanted = function(room) {
    if(!HelperFuctions.outdated(this, REFRESH_DELAY))
        return;
        
    var res = {};
        
    for(var role in WANTED_POPULATION) {
        
    }
    
    return res;
}*/

PopulationManager.prototype.manage = function(room, populations) {
    var best = undefined;
    var bestCount = 0;
    var bestWeight = 0;
    for(var role in WANTED_POPULATION) {
        var wanted = WANTED_POPULATION[role];
        var actual = populations[role];
        if(!actual)
            actual = 0;
        
        if(wanted.min > actual && wanted.weight > bestWeight) {
            best = role;
            bestCount = (wanted.min - actual);
            bestWeight = wanted.weight;
        }
    }
    
    if(best === undefined) 
        return {};
        
    var res = {};
    
    res[best] = bestCount;
    return res;
}

module.exports = PopulationManager;
