# Geospatial: Workshop

Lets create an app backed on GeoSpatial Redis.
We will focus on Redis code and deliver a initial app.
App by default will show you where are, then you can:
 * Add Location
 * Select new Location to center map and get Near locations
 * Select radius to zoom in or out near locations

## Dependencies
 1. Install node and npm
 1. Install redis 3.2 **(Follow instructions)[../express-api/README.md]**
 1. Frontend deps: **(Follow instructions)[../ionic/README.md]**

## Intro
 1. Clone repo `git clone https://github.com/Altoros/redis-labs-use-cases.git`
 1. Config Geo App (config.js)[../express-api/config.js]
    * Redis credentials
    * Structure store names
    * Add default values if 1 (load cities as locations to test app)
 1. Go to **geo-workshop-base** branch `git checkout geo-workshop-base`
 1. How to use Redis client? **check here (backend.js)[../express-api/modules/backend.js]**

## Add Location

### Redis backend

On (backend.js)[../express-api/modules/backend.js] add:

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

On (backend.js)[../express-api/modules/backend.js] add:

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

On (routes.js)[../express-api/routes/routes.js] add:

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

