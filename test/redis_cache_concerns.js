var sinon = require('sinon'),
    expect = require('expect.js'),
    redis = require('redis'),
    debug = require('debug')('cache:concerns');

var RedisCache = require('../lib/cache').RedisCache,
    CachableAction = require('../lib/cache').CachableAction,
    KeyGenerator = require('../lib/cache').KeyGenerator;

describe("given I have an empty redis cache", function () {
    var name = 'Test Query 1';

    before(function () {
        var client = redis.createClient();
        client.del(name, function () {
            client.quit();
        });
    });

    it("it should invoke the action with the correct parameter", function (done) {
        var cache = new RedisCache(),
            query = sinon.stub().yields(null, 1),
            param = { a:1 },
            cachable = new CachableAction(name, query, param);

        cache.store(cachable, function () {
            expect(query.calledWith(param)).to.be(true);
            done();
        });
    });
});

describe("given I have a populated redis cache", function () {
    var name = 'Test Query 2',
        populatedValue = 1;

    before(function () {
        var client = redis.createClient();
        debug('set %s with %s', name, populatedValue)
        client.set(KeyGenerator.create(name), populatedValue, function () {
            client.quit();
        });
    });

    it("it should provide the populated value and not invoke the action", function (done) {
        var cache = new RedisCache(),
            query = sinon.stub().yields(),
            cachable = new CachableAction(name, query);

        cache.store(cachable, function (err, result) {
            expect(query.called).to.be(false);
            expect(result).to.be(populatedValue)
            done();
        });
    });
});
