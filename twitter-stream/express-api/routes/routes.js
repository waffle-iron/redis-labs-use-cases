var search = require("./../modules/search.js");

var appRouter = function(app) {

  app.get("/", function(req, res) {
    res.send("Twitter Stream: Express API");
  });

  app.get('/hashtag/:hashtag', function(req, res, next) {
    console.log("Searching", req.params.hashtag);
    search.searchHashtag(req.params.hashtag)
      .then(function(result){
        res.json({"status" : "success", "result" : result });
      })
      .fail(function(err){
        console.error("Error", err);
        res.json({"status" : "error", "message" : err});
      });
  });

  app.get('/tweet/:tweet', function(req, res, next) {
    search.findById(req.params.tweet)
      .then( function(result) { res.json({"status" : "success", "result" : result }); })
      .fail( function(result) { res.json({"status" : "error", "message" : err}); });
  });

};

module.exports = appRouter;
