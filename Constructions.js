var HelperFunctions = require('HelperFunctions');

const ROAD_DELAY = 200;

/** @param RoomHandler roomHandler */
function Constructions(roomHandler) {
    this.roomHandler = roomHandler;
    this.memory = HelperFunctions.createMemory('constructions', roomHandler.room);
};

const MIN_ROAD_PATH_USE = 3;
const MAX_ROAD_CONSTRUCTON = 5;

Constructions.prototype.buildRoads = function() {
    var pathUse = this.memory.pathUse;
    this.memory.pathUse = {};

    if(!pathUse)
        return;

    var room = this.roomHandler.room;

    var max = MAX_ROAD_CONSTRUCTON - this.roomHandler.cache.constructionSites().filter(
        function(v) {v.structureType == STRUCTURE_ROAD}
    );

    if(max <= 0)
        return;

    for(var pos in pathUse) {
        if(pathUse[pos] >= MIN_ROAD_PATH_USE) {
            var p = HelperFunctions.intToPos(pos);
            if(!canBuildRoad(room, p))
                continue;
            room.createConstructionSite(p.x, p.y, STRUCTURE_ROAD);

            max--;
            if(max <= 0)
                return;
        }
    }
}

function canBuildRoad(room, p) {
    var structures = room.lookForAt(LOOK_STRUCTURES, p.x, p.y)
    if(structures.length > 0)
        return false;

    var constructions = room.lookForAt(LOOK_CONSTRUCTION_SITES, p.x, p.y);
    if(constructions.length > 0)
        return false;

    return true;
}

Constructions.prototype.updatePathUse = function() {
    var pathUse = this.memory.pathUse;
    // we only take into account energy creeps because they move a lot
    var creeps = this.roomHandler.cache.myCreepsEnergy();
    for(var i = 0; i < creeps.length; ++i) {
        var creep = creeps[i];

        var p = HelperFunctions.posToInt(creep.pos);

        // we dont want to count creeps that doesnt move
        var last = creep.memory.lastPos;
        creep.memory.lastPos = p;

        if(!last || last == p)
            continue;

        var old = pathUse[p];
        pathUse[p] = old ? (old + 1) : 1;
    }
}

Constructions.prototype.run = function() {
    if(HelperFunctions.outdated(this, ROAD_DELAY))
        this.buildRoads();

    this.updatePathUse();
};

module.exports = Constructions;
