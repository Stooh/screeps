// Pour eviter de calculer plusieurs fois la meme chose au meme tick

const ROLES = require('Roles');

function createCacheFunction(label, runnable) {
    return function() {
        return this.get(label, runnable, this.room);
    };
}

var caches = [
    {name: 'myCreeps', runnable: (room) => (room.find(FIND_MY_CREEPS))},
    {name: 'myStructs', runnable: (room) => (room.find(FIND_MY_STRUCTURES))},
    {name: 'mySpawns', runnable: (room) => (room.find(FIND_MY_SPAWNS))},
    {name: 'sources', runnable: (room) => (room.find(FIND_SOURCES))},
    {name: 'activeSources', runnable: (room) => (room.find(FIND_SOURCES_ACTIVE))},
    {name: 'myCreepsAndStructs', runnable: function(room) {return this.myCreeps().concat(this.myStructs());}},
    {name: 'needsEnergyTransfer', runnable: function(room) {return this.myCreepsAndStructs().filter(v => v.needsEnergyTransfer());}},
];
caches.forEach(v => { RoomCache.prototype[v.name] = createCacheFunction(v.name, v.runnable); });

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
