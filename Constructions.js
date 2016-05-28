var HelperFunctions = require('HelperFunctions');

const ROAD_DELAY = 200;

/** @param RoomHandler roomHandler */
function Constructions(roomHandler) {
    this.roomHandler = roomHandler;
    this.memory = HelperFunctions.createMemory('constructions', roomHandler.room);
};

Constructions.prototype.buildRoads = function() {
    var pathUse = this.memory.pathUse;
    this.memory.pathUse = {};

    if(!pathUse)
        return;

    var room = this.roomHandler.room;
    var minPathUse = 2;
    for(var pos in pathUse) {
        if(pathUse[pos] >= minPathUse) {
            var p = HelperFunctions.intToPos(pos);
            if(canBuildRoad(room, p))
                continue;
            room.createConstructionSite(p.x, p.y, STRUCTURE_ROAD);
        }
    }
}

function canBuildRoad(room, p) {
    var structures = room.lookForAt(LOOK_STRUCTURES, p.x, p.y)
    if(structures.length)
        return true;

    var constructions = room.lookForAt(LOOK_CONSTRUCTION_SITES, p.x, p.y);
    if(constructions.length)
        return true;

    return false;
}

Constructions.prototype.updatePathUse = function() {
    var pathUse = this.memory.pathUse;
    var creeps = this.roomHandler.cache.myCreeps();
    for(var i = 0; i < creeps.length; ++i) {
        var creep = creeps[i];

        var p = HelperFunctions.posToInt(creep.pos);
        if(!p in pathUse)
            pathUse[p] = 1;
        else
            pathUse[p]++;
    }
}

Constructions.prototype.run = function() {
    if(HelperFunctions.outdated(this, ROAD_DELAY)) {
        this.buildRoads();
    } else {
        this.updatePathUse();
    }
};

module.exports = Constructions;
