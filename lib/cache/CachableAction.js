var KeyGenerator = require('./KeyGenerator');
var debug = require('debug')('cache:redis:action');

var CachableAction = function (name, fn, parameters, keygen) {
    this.name = ''+name;
    this.fn = typeof fn === 'function' ? fn : function noop(next) { next(); };
    this.parameters = parameters;
    this.keygen = keygen || KeyGenerator.create;
};
CachableAction.prototype.invoke = function (done) {
    this.fn.apply(this, [].concat(this.parameters, done));
};
CachableAction.prototype.getKey = function () {
    debug('generating key', this);
    return this.keygen(this.name, this.parameters);
};

module.exports = CachableAction;