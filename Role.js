function Role(base) {
    this.label = base.label;
    this.capLabel = capitalizeFirstLetter(this.label);
    this.base = base;
    this.bodyStructs = base.bodyStructs;
    this.bodies = generateBodies(this.bodyStructs);
}

function capitalizeFirstLetter(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const BODY_PART_PRIORITY = [
    TOUGH,
    ATTACK,
    RANGED_ATTACK,
    HEAL,
    CLAIM,
    MOVE,
    WORK,
    CARRY,
];

function getBodyCost(bodyStruct) {
    var res = 0;
    for(n in bodyStruct) {
        res += BODYPART_COST[n] * bodyStruct[n];
    }
    return res;
}

function generateBodies(bodyStructs) {
    var res = [];

    for(var i = 0; i < bodyStructs.length; ++i) {
        var struct = bodyStructs[i];
        var body = generateBody(struct);
        var cost = getBodyCost(struct);

        res.push({body: body, cost: cost});
    }

    return res
}

function generateBody(parts) {
    var res = [];

    for(var i = 0; i < BODY_PART_PRIORITY.length; ++i) {
        var part = BODY_PART_PRIORITY[i];

        var count = parts[part];
        if(count)
            for(var j = 0; j < count; ++j)
                res.push(part);
    }

    return res;
}

/** @param Creep creep */
Role.prototype.run = function(creep, roomCache) {
    if(this.base.run)
        this.base.run(creep, roomCache);
}

Role.prototype.runRoom = function(room, roomCache) {
    if(this.base.runRoom)
        this.base.runRoom(room, roomCache);
}

module.exports = Role;
