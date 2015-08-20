var debug = require('debug')('cache:redis:key-generator');

var KeyGenerator = function (delimiter) {
    this.delimiter = delimiter || ' ';
};
KeyGenerator.create = KeyGenerator.prototype.create = function(name, obj, delimiter) {
    var keys = [];
    obj = obj || {};

    if(Array.isArray(obj)) {
        keys = obj.map(function (value) {
            return JSON.stringify(value);
        });
    } else {
        keys = Object.keys(obj).map(function (property) {
            return property + ':' + JSON.stringify(obj[property]);
        });
    }
    keys.sort();
    keys.unshift('['+name+']');
    debug(keys);
    return keys.join(delimiter || this.delimiter || ' ');
};
module.exports = KeyGenerator;