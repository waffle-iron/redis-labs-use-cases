var backend = require("./../modules/backend.js");

var rootFunc = function(req, res) {
  res.send("Twitter Stream: Express API");
};

var findRecommendations = function(req, res, next) {
  backend.findRecommendations(req.params.tweet, req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findLikes = function(req, res, next) {
  backend.findLikes(req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};


var findToSwipe = function(req, res, next) {
  backend.findToSwipe(req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findViewed = function(req, res, next) {
  backend.findViewed(req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
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

  console.log("Searching", req.params.hashtag, offset, qty_per_page);
  backend.findByHashtag(req.params.hashtag, offset, qty_per_page, req.user)
    .then(function(result){
      res.json({"status" : "success", "result" : result });
    })
    .fail(function(err){
      console.error("Error", err);
      res.json({"status" : "error", "message" : err});
    });
};

var findById = function(req, res, next) {
  backend.findById(req.params.tweet, req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};


var nopeTweet = function(req, res, next) {
  backend.nopeTweet(req.params.tweet, req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var likeTweet = function(req, res, next) {
  backend.voteTweet(req.params.tweet, req.user)
    .then(function(result) {
      backend.likeTweet(req.params.tweet, req.user)
      .then( function(result) { res.json({"status" : "success", "result" : result }); })
      .fail( function(err) { res.json({"status" : "error", "message" : err}); });
    })
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
  app.use(customLogin);
  app.get('/', rootFunc);
  app.get('/hashtag/:hashtag', findByHashtag);
  app.get('/viewed/', findViewed);
  app.get('/tweet/:tweet', findById);
  app.get('/like/:tweet', likeTweet);
  app.get('/likes/', findLikes);
  app.get('/swipes/', findToSwipe);
  app.get('/nope/:tweet', nopeTweet);
  app.get('/recommendations/', findRecommendations);
};

module.exports = appRouter;
