var cache = require('./lib/cache'),
    redisCache = new cache.RedisCache();

redisCache.store('GetDataQuery', {
    a:1,
    b:2,
    c:3
}, function (parameters, done) {
    done(null, { created: new Date() });
}, function (err, result) {
    if(err) return console.log('error', err);
    console.log('query returned', result);
});