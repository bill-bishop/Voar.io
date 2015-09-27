var physics = require('../physics');

Planet.extends(physics.Body);
function Planet(options) {
    this.super(options);
}

Planet.EARTH = new Planet({
    mass: Math.pow(5.6, 24),
    position: new physics.Position(0, 0),
    velocity: new physics.Velocity(0, 0)
});
module.exports = Planet;