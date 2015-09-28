var physics = require('../physics');

function Ship(options) {
    this.super(options);

    this.alive = true;
    this.id = options.id;
    this.playerName = options.playerName;
}

Ship.prototype = {
    spawn: function () {
        this.alive = true;
    },

    kill: function () {
        this.alive = false;
    },

    thrust: function () {
        var radialVelocityIncrease = 1000; // m/s
        var tangentialVelocityIncrease = .00005;

        this.velocity.add(radialVelocityIncrease, tangentialVelocityIncrease);
    },

    getOptions: function () {
        return {
            position: this.body.position,
            velocity: this.body.velocity
        };
    }
};


Ship.extends(physics.Body);

module.exports = Ship;