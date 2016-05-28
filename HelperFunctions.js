var HelperFunctions = {};

HelperFunctions.createMemory = function(label, base) {
    var memory = base ? base.memory : Memory;
    var res = memory[label];
    if(!res) {
        res = {};
        memory[label] = res;
    }
    return res;
}

HelperFunctions.getOrCreateFromMemory = function(base, label, createCallback = () => ({})) {
    var res = base.memory[label];
    if(!res) {
        res = createCallback.apply(null, null);
        base.memory[label] = res;
    }
    return res;
}

HelperFunctions.outdated = function(base, delay, label = 'lastUpdateTime') {
    var lastUpdate = base.memory[label];
    if(lastUpdate && Game.time - lastUpdate <= delay) 
        return false;
        
    base.memory[label] = Game.time;    
    return true;
}

HelperFunctions.garbageCollection =  function() {
	var counter = 0;
	for(var n in Memory.creeps) {
		var c = Game.creeps[n];
		if(!c) {
			delete Memory.creeps[n];
			counter++;
		}
	}
}

module.exports = HelperFunctions;
