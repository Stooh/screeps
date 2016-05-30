var HelperFunctions = require('HelperFunctions');

const REFRESH_DELAY = 50;

/** @param RoomHandler roomHandler */
function RessourceSlots(roomHandler) {
    this.roomHandler = roomHandler;
    this.room = roomHandler.room;
    this.memory = HelperFunctions.createMemory('ressourceSlots', this.room);
}

RessourceSlots.prototype.refresh = function() {
    this.refreshSourceSlots();
    this.refreshUsedSlots();
};

function isSpotFree(room, x,y) {
    //if(room.lookForAt(LOOK_RESOURCES,x,y).length)
    //    return false;
    if(room.lookForAt(LOOK_SOURCES,x,y).length)
        return false;
    if(room.lookForAt(LOOK_MINERALS,x,y).length)
        return false;
    if(room.lookForAt(LOOK_NUKES,x,y).length)
        return false;

    var structures = room.lookForAt(LOOK_STRUCTURES,x,y);
    for(var i = 0; i < structures.length; ++i) {
        var st = structures[i].structureType;
        if(st != STRUCTURE_ROAD &&
            st != STRUCTURE_RAMPART)
            return false;
    }

    var terrains = room.lookForAt(LOOK_TERRAIN,x,y);
    return terrains.length && terrains[0] != 'wall';
}

function getArea(x, y, range) {
    var res = [];
    for(var dx = -range; dx <= range; ++dx)
        for(var dy = -range; dy <= range; ++dy) {
            if(dx || dy)
                res.push({x: x+dx, y: y+dy});
        }
    return res;
}

RessourceSlots.prototype.refreshSourceSlots = function() {
    var sources = this.roomHandler.cache.sources();
    var totalSpots = 0;

    for(var i = 0; i < sources.length; ++i) {
        var source = sources[i];

        var area = getArea(source.pos.x, source.pos.y, 1);

        var count = 0;
        for(var j = 0; j < area.length; ++j) {
            if(isSpotFree(this.room, area[j].x, area[j].y))
                ++count;
        }

        source.memory.spots = count;
        source.memory.availableSpots = count;
        totalSpots += count;
    }

    this.memory.totalSpots = totalSpots;
    this.memory.availableSpots = totalSpots;
}

RessourceSlots.prototype.refreshUsedSlots = function() {
    var harvesters = this.roomHandler.cache.myCreepsHarvester();

    for(var i = 0; i < harvesters.length; ++i) {
        var harvester = harvesters[i];

        var tId = harvester.memory.targetSource;
        if(!tId)
            continue;

        var target = Game.getObjectById(tId);

        // check if target exists and is a source
        // and if it has an available spot
        if(!target || !target.ticksToRegeneration || target.memory.availableSpots <= 0) {
            // removing his invalid target
            delete harvester.memory.targetSource;
            continue;
        }

        // consume one available spot
        target.memory.availableSpots--;
        this.memory.availableSpots--;
    }
}


RessourceSlots.prototype.run = function() {
    if(HelperFunctions.outdated(this, REFRESH_DELAY))
        this.refresh();
}

module.exports = RessourceSlots;
