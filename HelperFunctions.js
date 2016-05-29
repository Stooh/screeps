var HelperFunctions = {};

const OBJECT_CREATE_CALLBACK = function() {return {}};

HelperFunctions.createMemory = function(label, base) {
    var memory = base ? base.memory : Memory;
    var res = memory[label];
    if(!res) {
        res = {};
        memory[label] = res;
    }
    return res;
};

HelperFunctions.getOrCreateFromMemory = function(base, label, createCallback) {
	createCallback = createCallback || OBJECT_CREATE_CALLBACK;
    var res = base.memory[label];
    if(!res) {
        res = createCallback.apply(null, null);
        base.memory[label] = res;
    }
    return res;
};

HelperFunctions.outdated = function(base, delay, label) {
	label = label || 'lastUpdateTime';
    var lastUpdate = base.memory[label];
    if(lastUpdate && Game.time - lastUpdate <= delay)
        return false;

    base.memory[label] = Game.time;
    return true;
};

HelperFunctions.garbageCollection =  function() {
	var counter = 0;
	for(var n in Memory.creeps) {
		var c = Game.creeps[n];
		if(!c) {
			delete Memory.creeps[n];
			counter++;
		}
	}
};

const POS_MUL = 10000;

HelperFunctions.posToInt = function(pos) {
    return pos.x * POS_MUL + pos.y;
};

HelperFunctions.intToPos = function(value) {
    var y = value % POS_MUL;
    var x = (value - y) / POS_MUL;
    return {x: x, y: y};
};

module.exports = HelperFunctions;
