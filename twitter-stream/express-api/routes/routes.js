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
  var offset = 0;
  var qty_per_page = 10;

  if(req.query.page) {
    offset = (parseInt(req.query.page)-1) * qty_per_page;
  }

  if(offset <= 0) {
    offset = 0;
  }

  console.log("Searching", req.params.hashtag, offset, qty_per_page);
  search.findByHashtag(req.params.hashtag, offset, qty_per_page)
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
