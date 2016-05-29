// Pour eviter de calculer plusieurs fois la meme chose au meme tick

const ROLES = require('Roles');

function createCacheFunction(label, runnable) {
    return function() {
        return this.get(label, runnable, this.room);
    };
}

var caches = [
    {name: 'myCreeps', runnable: function(room) {return room.find(FIND_MY_CREEPS)}},
    {name: 'hostileCreeps', runnable: function(room) {return room.find(FIND_HOSTILE_CREEPS).filter(function(t) {return t.name != 'Source Keeper';});}},
    {name: 'hostileSpawns', runnable: function(room) {return room.find(FIND_HOSTILE_SPAWNS);}},
    {name: 'myStructs', runnable: function(room) {return room.find(FIND_MY_STRUCTURES);}},
    {name: 'mySpawns', runnable: function(room) {return room.find(FIND_MY_SPAWNS);}},
    {name: 'sources', runnable: function(room) {return room.find(FIND_SOURCES);}},
    {name: 'constructionSites', runnable: function(room) {return room.find(FIND_CONSTRUCTION_SITES);}},
    {name: 'activeSources', runnable: function(room) {return room.find(FIND_SOURCES_ACTIVE);}},
    {name: 'myCreepsAndStructs', runnable: function(room) {return this.myCreeps().concat(this.myStructs());}},
    {name: 'usesEnergyTransfer', runnable: function(room) {return this.myCreepsAndStructs().filter(function(v) {return v.usesEnergyTransfer();});}},
    {name: 'needsEnergyTransfer', runnable: function(room) {return this.myCreepsAndStructs().filter(function(v) {return v.needsEnergyTransfer();});}},
];
caches.forEach(function(v) { RoomCache.prototype[v.name] = createCacheFunction(v.name, v.runnable); });

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

RoomCache.prototype.clear = function() {
    var cache = {};
    this.cache = cache;
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
