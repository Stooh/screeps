function Role(label, body, runnable) {
    this.label = label;
    this.capLabel = capitalizeFirstLetter(label);
    this.body = body;
    this.runnable = runnable;
}

function capitalizeFirstLetter(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/** @param Creep creep */
Role.prototype.run = function(creep, roomCache) {
    if(this.runnable.run)
        this.runnable.run(creep, roomCache);
}

Role.prototype.runRoom = function(room, roomCache) {
    if(this.runnable.runRoom)
        this.runnable.runRoom(room, roomCache);
}

module.exports = Role;
