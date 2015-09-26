function Planet (options) {
    var p2 = options.p2;

    this.world = options.world;

    this.body = new p2.Body({
        mass: options.mass,
        velocity: [0, 0],
        position: [0, 0]
    });

    this.body.addShape(new p2.Circle({
        radius: 50
    }));

    this.world.addBody(this.body);
}

module.exports = Planet;