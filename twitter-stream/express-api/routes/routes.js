var search = require("./../modules/search.js");

var rootFunc = function(req, res) {
  res.send("Twitter Stream: Express API");
};

var findRecommendations = function(req, res, next) {
  search.findRecommendations(req.params.tweet)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findByHashtag = function(req, res, next) {
  console.log("Searching", req.params.hashtag);
  search.findByHashtag(req.params.hashtag)
    .then(function(result){
      res.json({"status" : "success", "result" : result });
    })
    .fail(function(err){
      console.error("Error", err);
      res.json({"status" : "error", "message" : err});
    });
};

var findById = function(req, res, next) {
  search.findById(req.params.tweet)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var voteTweet = function(req, res, next) {
  search.voteTweet(req.params.tweet)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};


var appRouter = function(app) {
  app.get("/", rootFunc);
  app.get('/hashtag/:hashtag', findByHashtag);
  app.get('/tweet/:tweet', findById);
  app.get('/vote/:tweet', voteTweet);
  app.get('/recommendations/', findRecommendations);
};

module.exports = appRouter;
