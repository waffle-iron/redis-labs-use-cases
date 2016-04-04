var search = require("./../modules/search.js");

var rootFunc = function(req, res) {
  res.send("Twitter Stream: Express API");
};

var findByHashTag = function(req, res, next) {
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

var findByTweet = function(req, res, next) {
  search.findById(req.params.tweet)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};


var appRouter = function(app) {
  app.get("/", rootFunc);
  app.get('/hashtag/:hashtag', findByHashTag);
  app.get('/tweet/:tweet', findByTweet);
};

module.exports = appRouter;
