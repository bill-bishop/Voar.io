var Position = require('./Position');
var Velocity = require('./Velocity');

function Body(options) {
    this.mass = options.mass || 1;
    this.position = options.position || new Position(0, 0);
    this.velocity = options.velocity || new Velocity(0, 0);

    this.gameEntity = options.gameEntity; // client-side game entity
}

Body.prototype.update = function (offset) {
    if (!this.gameEntity) return;

    var coords = this.position.cartesian(offset);
    this.gameEntity.x = coords.x;
    this.gameEntity.y = coords.y;
};

module.exports = Body;