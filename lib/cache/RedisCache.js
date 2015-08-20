var _ = require('lodash'),
    debug = require('debug')('cache:redis');

var RedisCache = function () {
    var redis = require('redis');
    this.client = redis.createClient.apply(redis, arguments);
    this.client.on('ready', function () {
        debug('Redis Cache ready');
    });
    this.client.on('error', function (err) {
        debug('Redis Cache error - ' + err);
    });
    this.defaultOptions = { autodisconnect: true, expiry: 60 };
};

RedisCache.prototype.store = function (cachableAction, optionsOrDone, done) {
    debug('Redis Cache checking store for %s', cachableAction.name);
    var options = this.defaultOptions,
        cache = this,
        key = cachableAction.getKey();

    if(typeof optionsOrDone === 'function' && done === undefined) {
        done = optionsOrDone;
    } else {
        options = _.extend({}, options, optionsOrDone);
    }
    debug("Redis Cache fetching %s", cachableAction.name);
    this.client.get(key, function (err, result) {
        if(err) {
            debug("Redis Cache error fetching %s", cachableAction.name, err);
            done(err);
        }
        if(result === null || result === undefined) {
            debug("Redis Cache miss %s", key);
            cachableAction.invoke(function (err, actionResult) {
                if(err) {
                    debug("Cache action caused error", err);
                    return next(err);
                }
                debug("Setting key %s", key, options.expiry, JSON.stringify(actionResult).length);
                cache.client.set(key, JSON.stringify(actionResult), function (err, replies) {
                    debug('completed set', key, err, replies);
                });
                cache.client.expire(key, options.expiry);
                next(null, actionResult)
            });
        } else {
            debug("Redis Cache hit");
            next(null, JSON.parse(result, reviver));
        }
    });

    function next(err, result) {
        if(options.autodisconnect) {
            cache.quit();
        }
        done(null, result);
    }
};

RedisCache.prototype.quit = function () {
    this.client.quit()
};

function reviver(key, value) {
  if (typeof value === 'string') {
    var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
    if (a) {
      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
    }
  }
  return value;
}

module.exports = RedisCache;