var backend = require("./../modules/backend.js");

var rootFunc = function(req, res) {
  res.send("Geospatial: Express API");
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

var findRadiuses = function(req, res, next) {
  var radiuses = backend.findRadiuses();
  return res.json({"status" : "success", "result" : radiuses });
};

var appRouter = function(app) {
  app.get('/', rootFunc);
  app.use(customLogin);
  app.get('/radiuses/', findRadiuses);
};

module.exports = appRouter;
