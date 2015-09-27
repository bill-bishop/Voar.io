var Velocity = require('./Velocity');
var Position = require('./Position');

function gravitationalForce(mass, radius) {
    var G = Math.pow(6.67, -11);
    return G * mass / Math.pow(radius, 2);
}

function orbitStep(a, b, dt) {
    var position = a.position;
    var velocity = a.velocity;
    var dr = velocity.r * dt;
    var dtheta = velocity.theta * dt;
    var force = gravitationalForce(b.mass, position.r);

    var radialVelocityIncrease = position.r + (.5 * dr * Math.pow(dtheta, 2) - force * Math.pow(dt, 2));
    var tangentialVelocityIncrease = 0 - 2 * dr * dtheta / (position.r + .5 * dr);

    return {
        position: new Position(dr, dtheta),
        velocity: new Velocity(radialVelocityIncrease, tangentialVelocityIncrease)
    };
}

module.exports = {
    force: gravitationalForce,
    orbitStep: orbitStep
};