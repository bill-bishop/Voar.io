var Position = require('./Position');

Velocity.extends(Position);
function Velocity (r, theta) {
    this.super(r, theta);
}

module.exports = Velocity;