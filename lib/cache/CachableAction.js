var KeyGenerator = require('./KeyGenerator');

var CachableAction = function (name, fn, parameters) {
    this.name = ''+name;
    this.fn = typeof fn === 'function' ? fn : function noop(next) { next(); };
    this.parameters = parameters;
};
CachableAction.prototype.invoke = function (done) {
    this.fn.apply(this, [this.parameters, done]);
};
CachableAction.prototype.getKey = function () {
    return KeyGenerator.create(this.name, this.parameters);
};

module.exports = CachableAction;