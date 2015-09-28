var Velocity = require('./Velocity');
var Position = require('./Position');

function gravitationalForce(mass, radius) {
    // mass should be kg, radius should be m
    var G = 6.67e-15;
    return G * mass / Math.pow(radius, 1.5);
}

function orbitStep(a, b, dt, steps) {
    if(a.forEach) {
        a.forEach(function (body) {
            orbitStep(body, b, dt, steps);
        });
        return;
    }
    steps = steps || 1;
    for(var i = 0; i < steps; i++) {
        var rn = a.position.r;
        var thetan = a.position.theta;
        var dr = a.velocity.r;
        var dtheta = a.velocity.theta - .000000001;
        var force = gravitationalForce(b.mass, rn);

        var step = {
            rn: rn + dr,
            thetan: thetan + dtheta,
            dr: dr + ((rn + .5 * dr) * Math.pow(dtheta, 2) - force * Math.pow(dt, 2)),
            dtheta: dtheta - 2 * dr * dtheta / (rn + .5 * dr)
        };

        a.position.set(step.rn, step.thetan);
        a.velocity.set(step.dr, step.dtheta);
    }
}

module.exports = {
    force: gravitationalForce,
    orbitStep: orbitStep
};