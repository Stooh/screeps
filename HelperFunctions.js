var HelperFunctions = {};

const GARBAGE_DELAY = 30;
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

// l'objet qui gère si on doit garbage ou pas
var garbageCollectionMem = {};
garbageCollectionMem.memory = HelperFunctions.createMemory('garbageCollection');

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
    if(!HelperFunctions.outdated(garbageCollectionMem, GARBAGE_DELAY))
        return;

	for(var n in Memory.creeps)
		if(!Game.creeps[n])
			delete Memory.creeps[n];

    for(var n in Memory.spawns)
        if(!Game.spawns[n])
            delete Memory.spawns[n];

    for(var n in Memory.rooms)
        if(!Game.rooms[n])
            delete Memory.rooms[n];

    for(var n in Memory.gameObject)
        if(!Game.getObjectById(n))
            delete Memory.gameObject[n];
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
