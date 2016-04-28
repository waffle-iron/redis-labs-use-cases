var backend = require("./../modules/backend.js");

var rootFunc = function(req, res) {
  res.send("Twitter Stream: Express API");
};

var findByHashtag = function(req, res, next) {
  var offset = 0;
  var qty_per_page = 10;

  if(req.query.page) {
    offset = (parseInt(req.query.page)-1) * qty_per_page;
  }

  if(offset <= 0) {
    offset = 0;
  }

  console.log("Searching", req.params.hashtag, offset, qty_per_page, req.params.channel);
  backend.findByHashtag(req.params.hashtag, offset, qty_per_page, req.user, req.params.channel)
    .then(function(result){
      res.json({"status" : "success", "result" : result });
    })
    .fail(function(err){
      console.error("Error", err);
      res.json({"status" : "error", "message" : err});
    });
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
  app.get('/hashtag/hashtag/:channel', findByHashtag);
  app.get('/channels/', getChannels);
};

module.exports = appRouter;
