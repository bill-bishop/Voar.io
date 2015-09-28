var physics = require('../physics');

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


Ship.extends(physics.Body);

module.exports = Ship;