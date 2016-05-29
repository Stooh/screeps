var RoleFighter = {
    label: 'fighter',
    bodyStructs: [
        {move:2, attack:2},
        {move:4, attack:4},
        {tough:4, move:10, attack:6},
        {tough:10, move:25, attack:15}
    ],
};

RoleFighter.act = function(creep, roomHandler) {
    //var avoidArea = this.getAvoidedArea();

    if(RoleFighter.attackHostiles(creep, roomHandler)) { return; }
    if(RoleFighter.attackSpawns(creep, roomHandler)) { return; }

    creep.moveTo(25,25); //, {avoid: avoidArea});
}

RoleFighter.attackHostiles = function(creep, roomHandler) {
    //var avoidArea = this.getAvoidedArea();
    var targets = roomHandler.cache.hostileCreeps();

    if(targets.length) {
        creep.moveTo(targets[0]);//, {avoid: avoidArea});
        creep.attack(targets[0]);
        return true;
    }
}

RoleFighter.attackSpawns = function(creep, roomHandler) {
    //var avoidArea = this.getAvoidedArea();
    var targets = roomHandler.cache.hostileSpawns();
    if(targets.length) {
        var rangedTargets = creep.pos.findInRange(targets, 3);
        if(rangedTargets.length > 0) {
            creep.rangedAttack(rangedTargets[0]);
        }

        creep.moveTo(targets[0]);//, {avoid: avoidArea});
        creep.attack(targets[0]);
        return true;
    };
}

/** @param Creep creep */
RoleFighter.run = function(creep, roomHandler) {
    RoleFighter.act(creep, roomHandler);
};

module.exports = RoleFighter;
