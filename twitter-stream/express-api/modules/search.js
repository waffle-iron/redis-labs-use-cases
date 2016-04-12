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

exports.findRecommendations = function(userId) {
  var deferred = Q.defer();
  var rangeArgs = [ config.store.voteZset, 0, 9 ];

  redis.zrevrange(rangeArgs, function (err, response) {
    var result = [];
    if(err) {
      deferred.reject(err);
    } else {
      if (response.length === 0) {
        // No result
        deferred.resolve([]);
      } else {
        async.forEach(response, function (tweetId, callback) {
          redis.hget(config.store.tweetHash, tweetId, function (err, reply) {
            // console.log(">>",reply);
            result.push({ id: tweetId, content: reply });
            callback();
          });
        }, function (err) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(result);
        });
      }
    }
  });

  return deferred.promise;

};

exports.voteTweet = function(tweetId, userId) {
  var dfd = Q.defer();
  redis.zincrby(config.store.voteZset, 1, tweetId, function (err, reply) {
    if(err) {
      dfd.reject(err);
      return;
    }
    return dfd.resolve(reply);
  });

  return dfd.promise;
};

exports.findById = function(tweetId, userId) {
  var res = null;
  var dfd = Q.defer();
  redis.hget(config.store.tweetHash, tweetId, function (err, reply) {
    if(err) {
      dfd.reject(err);
      return;
    }
    res = (reply) ? { id: tweetId, content: reply } : reply;
    return dfd.resolve(res);
  });

  return dfd.promise;
};

exports.findByHashtag = function(hashtag, offset, count, userId) {
  var deferred = Q.defer();
  var score = stringHash(hashtag);
  var default_offset = 0;
  var default_count = 10;

  offset = (offset === undefined) ? default_offset : offset;
  count = (count === undefined) ? default_count : count;

  var args1 = [ config.store.hashtagZset, score, score, 'LIMIT', offset, count ];

  redis.zrangebyscore(args1, function (err, response) {
    var result = [];
    if(err) {
      deferred.reject(err);
    } else {
      if (response.length === 0) {
        // No result
        deferred.resolve([]);
      } else {
        //console.log('Result', response);
        async.forEach(response, function (tweetId, callback) {
          redis.hget(config.store.tweetHash, tweetId, function (err, reply) {
            // console.log(">>",reply);
            result.push({ id: tweetId, content: reply});
            callback();
          });
        }, function (err) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(result);
        });
      }
    }
  });

  return deferred.promise;
};
