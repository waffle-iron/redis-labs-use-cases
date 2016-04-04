var search = require("./../modules/search.js");

var appRouter = function(app) {

  app.get("/", function(req, res) {
    res.send("Twitter Stream API");
  });

  app.get('/tweet/hashtag/:hashtag', function(req, res, next) {
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

  app.get('/tweet/list', function(req, res, next) {
  });

  app.get('/tweet/:tweet', function(req, res, next) {
  });


};

module.exports = appRouter;
