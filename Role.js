function Role(base) {
    this.label = base.label;
    this.capLabel = capitalizeFirstLetter(this.label);
    this.base = base;
    //this.bodyStructs = base.bodyStructs;
    if(base.scalableBody)
        this.bodies = generateScalableBodiesInfos(base);
    else
        this.bodies = generateBodies(base.bodyStructs);
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

        res.push({body: body, bodyStruct: struct, cost: cost});
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

function cloneBodyStruct(body) {
    var res = {};

    for(n in body)
        res[n] = body[n];

    return res;
}

function registerScalableBodyInfos(store, bodyStruct, cost, partCount) {
    if(partCount > MAX_CREEP_SIZE)
        return false;

    store.push({
        bodyStruct: cloneBodyStruct(bodyStruct),
        cost: cost,
        body: generateBody(bodyStruct),
    });

    return true;
}

function generateScalableBodiesInfos(base) {
    var res = [];
    var scalableBody = base.scalableBody;

    var curBodyStruct = {};
    var totalCost = 0;
    var totalPartCount =  0;

    // first run for the base model
    for(var i = 0; i < scalableBody.length; ++i) {
        var part = scalableBody[i].part;

        // already added ? we ignore for now
        if(curBodyStruct[part])
            continue;

        curBodyStruct[part] = 1;
        totalCost += BODYPART_COST[part];
        totalPartCount ++;
    }

    // register base body
    if(!registerScalableBodyInfos(res, curBodyStruct, totalCost, totalPartCount))
        return res;

    // now we add parts, ignoring the ones we already added once
    var alreadyAdded = {};
    // we loop, the n counter is just for security
    for(var n = 0; n < MAX_CREEP_SIZE; ++n) {
        for(var i = 0; i < scalableBody.length; ++i) {
            var part = scalableBody[i].part;

            // we added this part previously, we have to ignore one
            if(!alreadyAdded[part]) {
                alreadyAdded[part] = true;
                continue;
            }

            var count = 'count' in scalableBody[i] ? scalableBody[i].count : 1;
            // we add part one by one
            for(var j = 0; j < count; ++j) {
                curBodyStruct[part] ++;
                totalCost += BODYPART_COST[part];
                totalPartCount ++;

                if(!registerScalableBodyInfos(res, curBodyStruct, totalCost, totalPartCount))
                    return res; // we went over max size, we stop here
            }
        }
    }

    return res;
}

Role.prototype.getMaxExistingBodyLevel = function(bodyStruct) {
    // we start by checking the highest level first
    for(var i = this.bodies.length - 1; i >= 0; --i) {
        var bs = this.bodies[i].bodyStruct;
        var valid = true;
        for(var r in bs) {
            if((bodyStruct[r] || 0) < bs[r]) {
                valid = false;
                break;
            }
        }

        if(valid)
            return i;
    }
    return -1;
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
