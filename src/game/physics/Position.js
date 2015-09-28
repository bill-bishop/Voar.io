function Position (r, theta) {
    this.r = r;
    this.theta = theta;
}

Position.prototype.set = function (r, theta) {
    this.r = r;
    this.theta = theta;
};

Position.prototype.add = function (r, theta) {
    if(r.add) {
        theta = r.theta;
        r = r.r;
    }
    this.r += r;
    this.theta += theta;
};

var scale = .00001;
Position.prototype.cartesian = function (offset) {
    var self = this;
    offset = offset || { x: 0, y: 0 };
    return {
        x: self.r * Math.cos(self.theta) * scale + offset.x,
        y: self.r * Math.sin(self.theta) * scale + offset.y
    };
};

module.exports = Position;