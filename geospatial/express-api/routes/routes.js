var backend = require("./../modules/backend.js");

var rootFunc = function(req, res) {
  res.send("Geospatial: Express API");
};

var findRadiuses = function(req, res, next) {
  var radiuses = backend.findRadiuses();
  return res.json({"status" : "success", "result" : radiuses });
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
  app.get('/radiuses/', findRadiuses);
  app.get('/add/', addLocation);
};

module.exports = appRouter;
