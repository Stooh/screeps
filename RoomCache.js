// Pour eviter de calculer plusieurs fois la meme chose au meme tick

const ROLES = require('Roles');

function createCacheFunction(label, runnable) {
    return function() {
        return this.get(label, runnable, this.room);
    };
}

function createSafeCacheFunction(label, runnable) {
    return function() {
        this.updateUnsafe();
        return this.get(label, runnable, this.room);
    };
}

function createSafeRunnable(runnable) {
    return function(room) {
        return runnable.call(this, room).filter(
            function(v) {
                return !v.memory.unsafe || v.memory.unsafe != Game.time;
            }
        );
    }
}

var caches = [
    {name: 'myCreeps', runnable: function(room) {return room.find(FIND_MY_CREEPS)}},
    {name: 'hostileCreeps', runnable: function(room) {return room.find(FIND_HOSTILE_CREEPS).filter(function(t) {return t.name != 'Source Keeper';});}},
    {name: 'hostileSpawns', runnable: function(room) {return room.find(FIND_HOSTILE_SPAWNS);}},
    {name: 'myStructs', runnable: function(room) {return room.find(FIND_MY_STRUCTURES);}},
    {name: 'structs', runnable: function(room) {return room.find(FIND_STRUCTURES);}},
    {name: 'mySpawns', runnable: function(room) {return room.find(FIND_MY_SPAWNS);}},
    {name: 'sources', runnable: function(room) {return room.find(FIND_SOURCES);}},
    {name: 'myConstructionSites', runnable: function(room) {return room.find(FIND_MY_CONSTRUCTION_SITES);}},
    {name: 'constructionSites', runnable: function(room) {return room.find(FIND_CONSTRUCTION_SITES);}},
    {name: 'activeSources', runnable: function(room) {return room.find(FIND_SOURCES_ACTIVE);}},
    {name: 'mySpawnExts', runnable: function(room) {return this.myStructs().filter(function(v) {return v.structureType == STRUCTURE_EXTENSION;});}},
    {name: 'mySpawnsEnergy', runnable: function(room) {return this.myStructs().filter(function(v) {
        return (v.structureType == STRUCTURE_EXTENSION || v.structureType == STRUCTURE_SPAWN) &&
                v.needsEnergyTransfer();
    });}},
    {name: 'repairables', runnable: function(room) {return this.myCreeps().concat(this.structs());}},
    {name: 'myCreepsAndStructs', runnable: function(room) {return this.myCreeps().concat(this.myStructs());}},
    {name: 'unsafeMarkTargets', runnable: function(room) {return this.myCreeps().concat(this.myStructs()).concat(this.sources()).concat(this.constructionSites);}},
    {name: 'usesEnergyTransfer', runnable: function(room) {return this.myCreepsAndStructs().filter(function(v) {return v.usesEnergyTransfer();});}},
    {name: 'needsEnergyTransfer', runnable: function(room) {return this.myCreepsAndStructs().filter(function(v) {return v.needsEnergyTransfer();});}},
];
caches.forEach(function(v) {
    RoomCache.prototype[v.name] = createCacheFunction(v.name, v.runnable);

    // version 'safe' (loin d'ennemis)
    if(v.name != 'hostileCreeps') {
        var safeName = v.name + 'Safe';
        var safeRunnable = createSafeRunnable(v.runnable);
        RoomCache.prototype[safeName] = createSafeCacheFunction(safeName, safeRunnable);
    }
});

function createCacheRoleFunction(role) {
    var name = 'myCreeps' + role.capLabel;
    var filterFunc = function(creep) { return creep.memory.role == role.label};
    var roleFunc = function(room) { return this.myCreeps().filter(filterFunc); };
    RoomCache.prototype[name] = createCacheFunction(
        name,
        roleFunc
    );
}

for(var rn in ROLES) {
    createCacheRoleFunction(ROLES[rn]);
}

/** @param Room room */
function RoomCache(room) {
    this.room = room;
    this.clear();
}

RoomCache.prototype.updateUnsafe = function() {
    if(this.updatedUnsafe)
        return;

    this.updatedUnsafe = true;
    var hostiles = this.hostileCreeps();
    var targets = this.unsafeMarkTargets();

    for(var i = 0; i < hostiles.length; ++i) {
        var hostile = hostiles[i];

        var unsafes = hostile.pos.findInRange(targets, 3);
        for(var j = 0; j < unsafes.length; ++j)
            unsafe[j].memory.unsafe = Game.time;
    }
}

RoomCache.prototype.clear = function() {
    var cache = {};
    this.cache = cache;
    this.updatedUnsafe = false;
}

RoomCache.prototype.get = function(label, runnable, room) {
    var res = this.cache[label];

    if(res) {
        return res;
    } else {
        var res = runnable.call(this, room);
        this.cache[label] = res;
        return res;
    }
}

module.exports = RoomCache;
