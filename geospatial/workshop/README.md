# Geospatial: Workshop

 * Lets create an app backed on GeoSpatial Redis.
 * We will focus on Redis code and deliver a initial app.
 * App by default will show you where are, then you can:
    * Add Location
    * Select new Location to center map and get Near locations
    * Select radius to zoom in or out near locations

## Dependencies
 1. Install node and npm
 1. Install redis 3.2 **[Follow instructions](../express-api/README.md)**
 1. Frontend deps: **[Follow instructions](../ionic/README.md)**

## Intro
 1. Clone repo `git clone https://github.com/Altoros/redis-labs-use-cases.git`
 1. Go to **geo-workshop-base** branch `git checkout geo-workshop-base`
 1. Config Geo App [config.js](../express-api/config.js)
    * Redis credentials
    * Structure store names
    * Add default values if 1 (load cities as locations to test app)

## Libraries used

### Redis
 * Using a complete and feature rich Redis client for node.js. [node-redis](http://redis.js.org/)
 * How to use Redis client? **check here [backend.js](../express-api/modules/backend.js)**

### Promises
 * Using [Kriskowal Q](https://github.com/kriskowal/q) as promise handler
 * Docs [Here](http://documentup.com/kriskowal/q/)

### API
 * [Express](http://expressjs.com/): Fast, unopinionated, minimalist web framework for Node.js

### Utilities
 * [Lodash](https://lodash.com/): Library delivering modularity and performance.


## Add Location **[GEOADD Command](http://redis.io/commands/geoadd)**

### Redis backend

On [backend.js](../express-api/modules/backend.js) add:

```javascript
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
```

### Redis Default values

Check for add default location and add all locations on cities.js (json locations with lat and long)

On [backend.js](../express-api/modules/backend.js) add:

```javascript
  redis.on("ready", function () {
    ...

    var addLocation = function(city)  {
      exports.addLocation(city.city, city.lon, city.lat);
    };

    if(config.addDefaultValues) {
      _.forEach(cities, addLocation);
    }

    ...
  });
```

### Add feature and route on API

On [routes.js](../express-api/routes/routes.js) add:

```javascript
var addLocation = function(req, res, next) {
  if(!req.query.name || !req.query.latitude || !req.query.longitude) {
    return res.json({"status" : "error", "message" : 'No name, latitude or longitude provided.'});
  }

  backend.addLocation(req.query.name, req.query.latitude, req.query.longitude, req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};
```

```javascript
var appRouter = function(app) {
  ...
  app.get('/add/', addLocation);
};
```

## Get Locations **[GEOPOS](http://redis.io/commands/geopos) and [ZRANGE](http://redis.io/commands/zrange)**

### Redis - Get location pos

We are sending member param (location name in this case) and get the latitude and longitude.
Then returning an json with the data.

On [backend.js](../express-api/modules/backend.js) add:

```javascript
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
```

### Redis - Get all locations

GeoSet is an special zset, so every command from zset will work.
We are getting all the members (locations names) from the zset.

On [backend.js](../express-api/modules/backend.js) add:

```javascript
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
```


### Add feature and route on API

On [routes.js](../express-api/routes/routes.js) add:

```javascript
var findLocationPos = function(req, res, next) {
  if(!req.query.member) {
    return res.json({"status" : "error", "message" : 'No member provided.'});
  }

  backend.findLocationPos(req.query.member, req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findMembers = function(req, res, next) {
  backend.findMembers(req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};
```

```javascript
var appRouter = function(app) {
  ...
  app.get('/findpos/', findLocationPos);
  app.get('/members/', findMembers);
};
```

## Get Near Locations **[GEORADIUS Command](http://redis.io/commands/georadius)**

### Redis - backend

We use georadius to get near members and theirs positions (longitude, latitude) from a position and radius.
**Georadius supports multiple units for radius like miles, kilometers, feets, meters and also you can get distances.**

On [backend.js](../express-api/modules/backend.js) add:

```javascript
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
```

### Add feature and route on API

On [routes.js](../express-api/routes/routes.js) add:

```javascript
var findLocationsByCoords = function(req, res, next) {
  if(!req.query.radius || !req.query.lat || !req.query.long) {
    return res.json({"status" : "error", "message" : 'No radius or lat or long provided.'});
  }

  var values = req.query.radius.split(' ');
  if(values.length != 2) {
    return res.json({"status" : "error", "message" : 'Wrong radius format.'});
  }

  backend.findLocationsByCoords(req.query.long, req.query.lat, values[0], values[1], req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};
```

```javascript
var appRouter = function(app) {
  ...
  app.get('/findbycoords/', findLocationsByCoords);
};
```
