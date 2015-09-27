var physics = require('../physics');

Ship.extends(physics.Body);

function Ship (options) {
    this.super(options);

    this.id = options.id;
    this.playerName = options.playerName;
}

Ship.prototype = {
    spawn: function () {
    },

    thrust: function () {
    },

    getOptions: function () {
        return {
            position: this.body.position,
            velocity: this.body.velocity
        };
    }
};

module.exports = Ship;