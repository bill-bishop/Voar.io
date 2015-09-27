function Position (r, theta) {
    this.r = r;
    this.theta = theta;
}

Position.prototype.add = function (r, theta) {
    this.r += r.r || r;
    this.theta += r.theta || theta;
};

Position.prototype.cartesian = function () {
    var self = this;
    return {
        x: self.r * Math.cos(self.theta),
        y: self.r * Math.sin(self.theta)
    };
};

module.exports = Position;