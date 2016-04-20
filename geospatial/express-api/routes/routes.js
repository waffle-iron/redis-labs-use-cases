var backend = require("./../modules/backend.js");

var rootFunc = function(req, res) {
  res.send("Geospatial: Express API");
};

var findLocationsByMember = function(req, res, next) {
  if(!req.query.radius || !req.query.member) {
    return res.json({"status" : "error", "message" : 'No radius or member provided.'});
  }

  var values = req.query.radius.split(' ');
  if(values.length != 2) {
    return res.json({"status" : "error", "message" : 'Wrong radius format.'});
  }

  backend.findLocations(req.query.member, values[0], values[1], req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
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

var appRouter = function(app) {
  app.get('/', rootFunc);
  app.use(customLogin);
  app.get('/findbycoords/', findLocationsByCoords);
  app.get('/findbymember/', findLocationsByMember);
  app.get('/findpos/', findLocationPos);
  app.get('/members/', findMembers);
  app.get('/radiuses/', findRadiuses);
};

module.exports = appRouter;
