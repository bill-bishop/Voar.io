function Ship (options) {
    var p2 = options.p2;

    this.id = options.id;

    this.world = options.world;

    this.body = new p2.Body({
        mass: 5,
        velocity: [0, 0],
        position: [0, 0]
    });

    this.body.addShape(new p2.Box({
        width: 10,
        height: 20
    }));

    console.log(this.body.shapes[0].__proto__);
}

Ship.prototype = {
    spawn: function () {
        this.world.addBody(this.body);
    },

    thrust: function () {
        this.body.velocity[0] += 250;
        this.body.velocity[1] += 250;
    },

    getOptions: function () {
        return {
            position: this.body.position,
            velocity: this.body.velocity
        };
    }
};

module.exports = Ship;