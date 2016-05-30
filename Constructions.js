var HelperFunctions = require('HelperFunctions');

Constructions.CONSTRUCTION_PRIORITY = [
    STRUCTURE_RAMPART,
    STRUCTURE_WALL,
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_ROAD
];

const UPDATE_CONSTRUCTION_QUEUE_DELAY = 50;
const ROAD_DELAY = 200;
const WALL_DELAY = 203; // not simultaneous

const MAX_ROAD_CONSTRUCTON = 3;
const MAX_WALL_CONSTRUCTION = 3;
const MAX_EXPAND_CONSTRUCTION = 4;

const MIN_ROAD_PATH_USE = 3;

const EXITS = [ FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT];

const FILTER_RAMPART = function(v) {return v.structureType == STRUCTURE_RAMPART;};
const FILTER_WALL_OR_RAMPART = function(v) {return v.structureType == STRUCTURE_RAMPART || v.structureType == STRUCTURE_WALL;};

/** @param RoomHandler roomHandler */
function Constructions(roomHandler) {
    this.roomHandler = roomHandler;
    this.memory = HelperFunctions.createMemory('constructions', roomHandler.room);
    this.roads = [];
    this.queue = [];
};


Constructions.prototype.updateConstructionQueue = function() {
    if(!HelperFunctions.outdated(this, UPDATE_CONSTRUCTION_QUEUE_DELAY, 'queueLastUpdate'))
        return;

    var structs = CONTROLLER_STRUCTURES[this.roomHandler.room.controller.level];

    // TODO
};

Constructions.prototype.updateWallQueue = function() {
    if(!this.wallsQueue || !this.wallsPos)
        return;

    if(!HelperFunctions.outdated(this, UPDATE_CONSTRUCTION_QUEUE_DELAY, 'wallsQueueLastUpdate'))
        return;

    var queue = this.updateQueue(
        this.wallsQueue,
        this.wallsPos,
        this.roomHandler.cache.myConstructionSites().filter(FILTER_WALL_OR_RAMPART),
        MAX_WALL_CONSTRUCTION);


    var room = this.roomHandler.room;
    for(var i = 0; i < queue.length; ++i) {
        var p = queue[i];

        // TODO : remove possible existing construction site or building of something else

        room.createConstructionSite(p.x, p.y, p.rampart ? STRUCTURE_RAMPART : STRUCTURE_WALL);
    }
}

Constructions.prototype.updateQueue = function(queue, testedPos, existingConstructions, maxCount) {
    // we remove misplaced constructions
    // TODO remove finished construction too ?
    var validCount = 0;
    for(var i = 0; i < existingConstructions.length; ++i) {
        var cs = existingConstructions[i];

        // if it's not a tested pos, it's invalid
        if(!(HelperFunctions.posToInt(cs.pos) in testedPos))
            cs.remove();
        else if(validCount >= maxCount)
            cs.remove();
        else
            validCount++;
    }

    var res = [];

    for(var i = validCount; i < maxCount; ++i) {
        if(!queue.length)
            break;
        res.push(queue.pop());
    }

    return res;
}

Constructions.prototype.updateWalls = function() {
    if(!HelperFunctions.outdated(this, WALL_DELAY, 'wallsLastUpdate'))
        return;

    this.walls = [];
    this.wallsPos = {};
    var invalidPos = {};

    for(var i = 0; i < EXITS.length; ++i) {
        this.generateInvalidWallPos(invalidPos, EXITS[i]);
        this.generateWalls(this.walls, this.wallsPos, invalidPos, EXITS[i]);
    }

    // init wall queue
    this.wallsQueue = this.walls.slice();
}

Constructions.prototype.generateInvalidWallPos = function(invalidPos, exit) {
    var room = this.roomHandler.room;
    var exits = room.find(exit);

    for(var i = 0; i < exits.length; ++i) {
        var x = exits[i];

        var badPos = tooCloseWallPositions(x);
        for(var j = 0; j < badPos.length; ++j)
            invalidPos[HelperFunctions.posToInt(badPos[j])] = true;
    }
}

Constructions.prototype.generateWalls = function(walls, testedPos, invalidPos, exit) {
    var room = this.roomHandler.room;
    var exits = room.find(exit);
    var rampartFound = false;

    for(var i = 0; i < exits.length; ++i) {
        var x = exits[i];

        var possiblePos = getPossibleWallsPositions(x);
        for(var j = 0; j < possiblePos.length; ++j) {
            var pos = possiblePos[j];
            var p = HelperFunctions.posToInt(pos);

            // aleady done or invalid
            if(testedPos[p] || invalidPos[p])
                continue;

            // w/e happens, it's an invalid pos now
            testedPos[p] = true;

            if(isRampart(room, pos.x, pos.y)) {
                rampartFound = true;
            } else if(isValidWallConstruction(room, pos.x, pos.y)) {
                // TODO at worse we create more rempart than needed
                if(!rampartFound)  {
                    rampartFound = true;
                    walls.push({x: pos.x, y: pos.y, rampart: true});
                } else {
                    walls.push({x: pos.x, y: pos.y});
                }
            }
        }
    }

    if(!rampartFound && walls.length)
        walls[0].rampart = true;
};

function isRampart(room, x,y) {
    return room.lookForAt(LOOK_STRUCTURES,x,y).filter(FILTER_RAMPART).length;
}

function isValidWallConstruction(room, x,y) {
    if(room.lookForAt(LOOK_SOURCES,x,y).length)
        return false;
    if(room.lookForAt(LOOK_MINERALS,x,y).length)
        return false;
    if(room.lookForAt(LOOK_NUKES,x,y).length)
        return false;

    var structures = room.lookForAt(LOOK_STRUCTURES,x,y)
        .concat(room.lookForAt(LOOK_CONSTRUCTION_SITES,x,y));
    for(var i = 0; i < structures.length; ++i) {
        var st = structures[i].structureType;
        // walls takes precedence over other structures
        if(st == STRUCTURE_WALL ||
            st == STRUCTURE_RAMPART)
            return false;
    }

    var terrains = room.lookForAt(LOOK_TERRAIN,x,y);
    return terrains.length && terrains[0] != 'wall';
}

function isValidPos(x,y) {
    return x >= 0 && x < 50 && y >= 0 && y < 50;
}

function tooCloseWallPositions(pos) {
    var res = [];

    // anything in range 1 (square)
    for(var dx = -1; dx <= 1; ++dx)
        for(var dy = -1; dy <= 1; ++dy)
            res.push({x: pos.x + dx, y: pos.y + dy});

    return res;
}

function getPossibleWallsPositions(pos) {
    var res = [];

    for(var dx = -2; dx <= 2; ++dx)
        for(var dy = -2; dy <= 2; ++dy) {
            if(Math.abs(dx) < 2 && Math.abs(dy) < 2)
                continue;

            var nx = pos.x + dx;
            var ny = pos.y + dy;
            if(!isValidPos(nx,ny))
                continue;

            res.push({x: nx, y: ny});
        }

    return res;
}


Constructions.prototype.buildRoads = function() {
    var pathUse = this.memory.pathUse;
    this.memory.pathUse = {};

    if(!pathUse)
        return;

    var room = this.roomHandler.room;

    var max = MAX_ROAD_CONSTRUCTON - this.roomHandler.cache.myConstructionSites().filter(
        function(v) {return v.structureType == STRUCTURE_ROAD;}
    ).length;

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

Constructions.prototype.canBuildWalls = function() {
    var level = this.roomHandler.room.controller.level;
    return CONTROLLER_STRUCTURES['constructedWall'][level] > 0
        && CONTROLLER_STRUCTURES['rampart'][level] > 0;
}

Constructions.prototype.canBuildRoads = function() {
    var level = this.roomHandler.room.controller.level;
    return CONTROLLER_STRUCTURES['road'][level] > 0;
}

Constructions.prototype.run = function() {
    if(this.canBuildRoads()) {
        if(HelperFunctions.outdated(this, ROAD_DELAY, 'roadsLastUpdate'))
            this.buildRoads();

        this.updatePathUse();
    }

    if(this.canBuildWalls()) {
        this.updateWalls();

        this.updateWallQueue();
    }
};

module.exports = Constructions;
