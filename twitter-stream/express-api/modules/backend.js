var config = require('./../config');
var stringHash = require('string-hash');
var async = require('async');
var Q = require('q');

// Set up connection to Redis
var redis_conn = require("redis");
var redis = redis_conn.createClient(config.redis.url, {detect_buffers: true, no_ready_check: true});

redis.on("error", function (err) {
  console.log("Error: " + err);
});

// get user id if exists otherwise create user
exports.findUser = function(token) {
  var deferred = Q.defer();

  redis.hget(config.store.auths, token, function(err, reply) {
    if(err) {
     deferred.reject(err);
     return;
    }
    if(reply === null) {
      redis.incr(config.store.user_next_id, function(err, reply) {
        if(err) {
          deferred.reject(err);
          return;
        }
        redis.hset(config.store.auths, token, reply, function(err, reply) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(reply);
        });

      });
    } else {
      deferred.resolve(reply);
    }
  });

  return deferred.promise;
};

exports.getChannels = function() {
  return config.app.channels;
};
