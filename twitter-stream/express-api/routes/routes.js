var backend = require("./../modules/backend.js");

var rootFunc = function(req, res) {
  res.send("Twitter Stream: Express API");
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

var getChannels = function(req, res, next) {
  var result = backend.getChannels();
  res.json({"status" : "success", "result" : result });
};

var appRouter = function(app) {
  app.use(customLogin);
  app.get('/', rootFunc);
  app.get('/channels/', getChannels);
};

module.exports = appRouter;
