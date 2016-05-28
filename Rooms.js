var HelperFunctions = require('HelperFunctions');
var RoomHandler = require('RoomHandler');

const GARBAGE_DELAY = 10;

function Rooms() {
    this.rooms = {};
    this.memory = HelperFunctions.createMemory('roomHandlers');
}

Rooms.prototype.garbage = function() {
    var roomHandlers = this.memory.rooms;
    if(!roomHandlers)
        return;
        
    for(var name in roomHandlers) {
        if(!name in Game.rooms)
            delete roomHandlers[name];
    }
};

Rooms.prototype.updateRooms = function() {
    // on garbage pas tout le temps
    if(HelperFunctions.outdated(this, GARBAGE_DELAY))
        this.garbage();
    
    // on veut detecter tout de suite un nouveau room
    for(var name in Game.rooms) {
        if(!(name in this.rooms))
            this.rooms[name] = new RoomHandler(Game.rooms[name]);
    }
};

Rooms.prototype.run = function() {
    this.updateRooms();
    
    for(var name in this.rooms) {
        var rh = this.rooms[name];
        rh.run();
    }
};

module.exports = Rooms;
