var RoleBuilder = {};

/** @param Creep creep */
RoleBuilder.run = function(creep, roomHandler) {
    var targets = roomHandler.cache.constructionSites();
    if(targets.length) {
        if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
        }
    }
};

module.exports = RoleBuilder;
