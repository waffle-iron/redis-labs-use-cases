var config = require('./../config');
var cities = require('./../cities');
var radiuses = require('./../radiuses');
var stringHash = require('string-hash');
var async = require('async');
var Q = require('q');
var _ = require('lodash');

// Set up connection to Redis
var redis_conn = require("redis");
var redis = redis_conn.createClient(config.redis.url, {detect_buffers: true, no_ready_check: false});

redis.on("error", function (err) {
  console.log("Error: " + err);
});

redis.on("ready", function () {
  var version = redis.server_info.redis_version;
  if(version[0] <= 3 && version[1] < 1) {
    console.log('Error: Must have redis >= 3.2');
  }

  var addLocation = function(city)  {
    exports.addLocation(city.city, city.lon, city.lat);
  };

  if(config.addDefaultValues) {
    _.forEach(cities, addLocation);
  }
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

exports.addLocation = function(location, lng, lat, userId) {
  var dfd = Q.defer();
  var locationGeoSet = config.store.locationGeoSet;
  var geoArgs = [ locationGeoSet, lng, lat, location ];
  redis.geoadd(geoArgs, function (err, reply) {
    if(err) {
      dfd.reject(err);
      return;
    }
    return dfd.resolve(reply);
  });

  return dfd.promise;
};

exports.findLocationsByCoords = function(long, lat, radius, unit, userId) {
  var locationGeoSet = config.store.locationGeoSet;
  var geoArgs = [ locationGeoSet, long, lat, radius, unit, 'WITHCOORD' ];
  var deferred = Q.defer();

  redis.georadius(geoArgs, function(err, response) {
    if(err) {
      deferred.reject(err);
    } else {
      var col = _.map(response, function(v,j) { return { name: v[0], long: v[1][0], lat: v[1][1] }; });
      deferred.resolve(col);
    }
  });

  return deferred.promise;
};

exports.findLocationPos = function(member, userId) {
  var locationGeoSet = config.store.locationGeoSet;
  var geoArgs = [ locationGeoSet, member ];
  var deferred = Q.defer();

  redis.geopos(geoArgs, function(err, response) {
    if(err) {
      deferred.reject(err);
    } else {
      var obj = {};
      if(_.every(response, Boolean)) {
        obj = { name: member, long: response[0][0], lat: response[0][1] };
      }
      deferred.resolve(obj);
    }
  });

  return deferred.promise;
};

exports.findMembers = function(userId) {
  var locationGeoSet = config.store.locationGeoSet;
  var geoArgs = [ locationGeoSet, 0, -1 ];
  var deferred = Q.defer();

  redis.zrange(geoArgs, function(err, response) {
    if(err) {
      deferred.reject(err);
    } else {
      deferred.resolve(response);
    }
  });

  return deferred.promise;
};

exports.findRadiuses = function() {
  return radiuses;
};

