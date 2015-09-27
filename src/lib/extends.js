Function.prototype.extends = function (o) {
    var proto = this.prototype, extending = o.prototype;
    Object.setPrototypeOf(proto, extending);
    this.prototype.super = function () {
        var fn = proto.super;
        delete proto.super;
        extending.constructor.apply(this, arguments);
        proto.super = fn;
    };
};

module.exports = Function.prototype.extends;