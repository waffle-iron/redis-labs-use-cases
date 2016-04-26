var backend = require("./../modules/backend.js");

var rootFunc = function(req, res) {
  res.send("Geospatial: Express API");
};

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

var findLocationPos = function(req, res, next) {
  if(!req.query.member) {
    return res.json({"status" : "error", "message" : 'No member provided.'});
  }

  backend.findLocationPos(req.query.member, req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findRadiuses = function(req, res, next) {
  var radiuses = backend.findRadiuses();
  return res.json({"status" : "success", "result" : radiuses });
};

var findMembers = function(req, res, next) {
  backend.findMembers(req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var customLogin = function(req, res, next) {

  var token = req.headers['x-access-token'];
  if(!token) {
    return res.status(403).send({ success: false, message: 'No token provided.' });
  }

  backend.findUser(token)
    .then(function(result) {
      req.user = result;
      next();
    })
    .fail(function(err) {
      return res.json({ success: false, message: 'Failed to authenticate token.' });
    });

};

var addLocation = function(req, res, next) {
  if(!req.query.name || !req.query.latitude || !req.query.longitude) {
    return res.json({"status" : "error", "message" : 'No name, latitude or longitude provided.'});
  }

  backend.addLocation(req.query.name, req.query.latitude, req.query.longitude, req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};



var appRouter = function(app) {
  app.get('/', rootFunc);
  app.use(customLogin);
  app.get('/findbycoords/', findLocationsByCoords);
  app.get('/findpos/', findLocationPos);
  app.get('/members/', findMembers);
  app.get('/radiuses/', findRadiuses);
  app.get('/add/', addLocation);
};

module.exports = appRouter;
