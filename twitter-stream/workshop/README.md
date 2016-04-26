# Twitter Stream: Workshop

 * Lets create an app backed on Redis.
 * We will focus on Redis code and deliver a initial app.
 * There are three apps: redis worker, backend api and frontend mobile ionic.
 * Frontend App features:
    * List tweets
    * Swipe tweets (like or not)
    * List your favs
    * Show recommendations
    * Change Hastag Channel

## Dependencies
 1. Install node and npm: `sudo apt-get install nodejs`
 1. Install redis: `sudo apt-get install redis-server`
 1. Frontend deps: **[Follow instructions](../ionic/README.md)**

## Libraries used

### Redis
 * Using a complete and feature rich Redis client for node.js. [node-redis](http://redis.js.org/)

### Twitter
 * [Twitter](https://github.com/desmondmorris/node-twitter): An asynchronous client library for the Twitter REST and Streaming API's.
 * [Twitter-text](https://github.com/twitter/twitter-text/tree/master/js): Text processing routines for Tweets.

### Managing Async
 * [Async](https://github.com/caolan/async): Async utilities for node and the browser
 * [Kriskowal Q](https://github.com/kriskowal/q) as promise handler, docs [Here](http://documentup.com/kriskowal/q/)

### API
 * [Express](http://expressjs.com/): Fast, unopinionated, minimalist web framework for Node.js

### Utilities
 * [Lodash](https://lodash.com/): Library delivering modularity and performance.
 * [String-hash](https://github.com/darkskyapp/string-hash): Fast string hashing function for Node.JS

## Intro
 1. Clone repo `git clone https://github.com/Altoros/redis-labs-use-cases.git`
 1. Go to Step 0 **twitter_workshop_base** branch `git checkout twitter_workshop_base`
 1. Config [config.js](../express-api/config.js)
    * Channels (hashatags to be subscribed)
    * Twitter credentials [More info](https://dev.twitter.com/oauth/overview/application-owner-access-tokens)
    * Redis credentials
    * Structure store names

## Steps - git branches
For each step we have a git branch with that code, if there is any problem.
 1. **Step 0 Code Base** - twitter_workshop_base :  `git checkout twitter_workshop_base`
 1. **Step 1 Worker** - twitter_workshop_worker: `git checkout twitter_workshop_worker`
 1. **Step 2 FindByHashtag** - twitter_workshop_hashtag: `git checkout twitter_workshop_hashtag`
 1. **Step 3 Votes** - twitter_workshop_vote: `git checkout twitter_workshop_vote`
 1. **Step 4 Multiple Finds** - twitter_workshop_multiple: `git checkout twitter_workshop_multiple`


## Step 1 - Worker (**[HSET](http://redis.io/commands/hset), [SADD](http://redis.io/commands/sadd), [ZADD](http://redis.io/commands/zadd)** )

We are subscribing to twitter thru twitter stream api with differente hashtags.

When we recieve a stream we use:
 * HSET: Set tweet content and its id on HASH
 * SADD: Add tweet id on SET
 * ZADD: Add tweet id with 0 votes on zset

After that We extract all hashtag from tweet content and add it to a Zset.
So we can access any tweet by any hashtag on it.

On [worker.js](../express-api/worker.js) add:

```javascript
/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/
var twitterSubscribe  = function(channel) {
  client.stream('statuses/filter', {track: channel, lang: 'en'},  function(stream) {
    stream.on('data', function(tweet) {
      var tweetHashChannel = config.store.tweetHash + ':' + channel;
      var tweetSetChannel = config.store.tweetSet + ':' + channel;
      var voteZsetChannel = config.store.voteZset + ':' + channel;
      var hashtagZsetChannel = config.store.hashtagZset + ':' + channel;

      console.log(JSON.stringify(channel, tweet.text, null, 4));

      //Hash with tweet text
      redis.hset(tweetHashChannel, tweet.id_str, tweet.text);

      //Set with tweets id
      redis.sadd(tweetSetChannel, tweet.id_str);

      //Preparing zset vote index
      var tVote = [ voteZsetChannel, 0, tweet.id_str ];
      redis.zadd(tVote);

      var args = [ hashtagZsetChannel ];
      async.forEach(twitterText.extractHashtags(tweet.text),
        function (hashtag, callback) {
          console.log("Found hashtag ", hashtag);
          args.push(stringHash(hashtag));
          args.push(tweet.id_str);
          callback();
        },
        function (err) {
          console.log(JSON.stringify(args, null, 4));
          redis.zadd(args, function (err, response) {
            if (err) {
              console.error("ZADD error ", err);
              return;
            }
          });
        }
      );
    });

    stream.on('error', function(error) {
        console.log(error);
    });
  });
};

_.mapKeys(config.app.channels, twitterSubscribe);
```

## Step 2 - findByHashtag (**[ZRANGEBYSCORE](http://redis.io/commands/ZRANGEBYSCORE), [HGET](http://redis.io/commands/HGET)** )

### Redis backend

Find tweets by hasthtag with pagination.
Using zrangebyscore you can get data order by score between min and max from a zset.
In this case min and max are the same hashtag string hash.
Also We use HGET to get tweet content from hash.

On [backend.js](../express-api/modules/backend.js) add:

```javascript
exports.findByHashtag = function(hashtag, offset, count, userId, channel) {
  var deferred = Q.defer();
  var score = stringHash(hashtag);
  var default_offset = 0;
  var default_count = 10;

  offset = (offset === undefined) ? default_offset : offset;
  count = (count === undefined) ? default_count : count;

  var tweetHashChannel = config.store.tweetHash + ':' + channel;
  var hashtagZsetChannel = config.store.hashtagZset + ':' + channel;
  var args1 = [ hashtagZsetChannel, score, score, 'LIMIT', offset, count ];

  redis.zrangebyscore(args1, function (err, response) {
    var result = [];
    if(err) {
      deferred.reject(err);
    } else {
      if (response.length === 0) {
        // No result
        deferred.resolve([]);
      } else {
        //console.log('Result', response);
        async.forEach(response, function (tweetId, callback) {
          redis.hget(tweetHashChannel, tweetId, function (err, reply) {
            // console.log(">>",reply);
            result.push({ id: tweetId, content: reply});
            callback();
          });
        }, function (err) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(result);
        });
      }
    }
  });

  return deferred.promise;
};
```

### Add feature and route on API

On [routes.js](../express-api/routes/routes.js) add:

```javascript
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
```

```javascript
var appRouter = function(app) {
  ...
  app.get('/hashtag/hashtag/:channel', findByHashtag);
};
```

## Step 3 - Votes (**[ZREVRANGE](http://redis.io/commands/ZREVRANGE), [HGET](http://redis.io/commands/HGET), [SADD](http://redis.io/commands/SADD),  [ZINCRBY](http://redis.io/commands/ZINCRBY)**)

### Redis backend

On [backend.js](../express-api/modules/backend.js) add:


*When you Vote a tweet we increment in one tweets scores.*

```javascript
exports.voteTweet = function(tweetId, userId, channel) {
  var voteZsetChannel = config.store.voteZset + ':' + channel;
  var dfd = Q.defer();
  redis.zincrby(voteZsetChannel, 1, tweetId, function (err, reply) {
    if(err) {
      dfd.reject(err);
      return;
    }
    return dfd.resolve(reply);
  });

  return dfd.promise;
};
```

*When you like a tweet  we add it to your likes set*

```javascript
exports.likeTweet = function(tweetId, userId, channel) {
  var dfd = Q.defer();
  var userLikeSet = config.store.likeSet + ':' + userId + ':' + channel;

  redis.sadd(userLikeSet, tweetId, function (err, reply) {
    if(err) {
      dfd.reject(err);
      return;
    }
    return dfd.resolve(reply);
  });

  return dfd.promise;
};
```

*When you mark as nope a tweet we add it to your nopes set*

```javascript
exports.nopeTweet = function(tweetId, userId, channel) {
  var dfd = Q.defer();
  var userNopeSet = config.store.nopeSet + ':' + userId + ':' + channel;

  redis.sadd(userNopeSet, tweetId, function (err, reply) {
    if(err) {
      dfd.reject(err);
      return;
    }
    return dfd.resolve(reply);
  });

  return dfd.promise;
};
```

*Find top ten recommendatins based on user votes*

```javascript
exports.findRecommendations = function(userId, channel) {
  var deferred = Q.defer();
  var tweetHashChannel = config.store.tweetHash + ':' + channel;
  var voteZsetChannel = config.store.voteZset + ':' + channel;
  var rangeArgs = [ voteZsetChannel, 0, 9 ];

  redis.zrevrange(rangeArgs, function (err, response) {
    var result = [];
    if(err) {
      deferred.reject(err);
    } else {
      if (response.length === 0) {
        // No result
        deferred.resolve([]);
      } else {
        async.forEach(response, function (tweetId, callback) {
          redis.hget(tweetHashChannel, tweetId, function (err, reply) {
            // console.log(">>",reply);
            result.push({ id: tweetId, content: reply });
            callback();
          });
        }, function (err) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(result);
        });
      }
    }
  });

  return deferred.promise;
};
```

### Add feature and route on API

On [routes.js](../express-api/routes/routes.js) add:

```javascript
var findRecommendations = function(req, res, next) {
  backend.findRecommendations(req.user, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var nopeTweet = function(req, res, next) {
  backend.nopeTweet(req.params.tweet, req.user, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var likeTweet = function(req, res, next) {
  backend.voteTweet(req.params.tweet, req.user, req.params.channel)
    .then(function(result) {
      backend.likeTweet(req.params.tweet, req.user, req.params.channel)
      .then( function(result) { res.json({"status" : "success", "result" : result }); })
      .fail( function(err) { res.json({"status" : "error", "message" : err}); });
    })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

```

```javascript
var appRouter = function(app) {
  ...
  app.get('/like/:tweet/:channel', likeTweet);
  app.get('/nope/:tweet/:channel', nopeTweet);
  app.get('/recommendations/:channel', findRecommendations);
};
```

## Step 4 - Multiple finds (**[SMEMBERS](http://redis.io/commands/SMEMBERS), [HGET](http://redis.io/commands/HGET), [SUNIONSTORE](http://redis.io/commands/SUNIONSTORE),  [SDIFF](http://redis.io/commands/SDIFF)**)

### Redis backend
On [backend.js](../express-api/modules/backend.js) add:

*Find liked tweets from user and channel. Using smembers and getting all the members (tweet ids) from user liked set.*

```javascript
exports.findLikes = function(userId, channel) {
  var deferred = Q.defer();
  var userLikeSet = config.store.likeSet + ':' + userId + ':' + channel;
  var tweetHashChannel = config.store.tweetHash + ':' + channel;

  redis.smembers(userLikeSet, function (err, response) {
    var result = [];
    if(err) {
      deferred.reject(err);
    } else {
      if (response.length === 0) {
        // No result
        deferred.resolve([]);
      } else {
        async.forEach(response, function (tweetId, callback) {
          redis.hget(tweetHashChannel, tweetId, function (err, reply) {
            // console.log(">>",reply);
            result.push({ id: tweetId, content: reply });
            callback();
          });
        }, function (err) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(result);
        });
      }
    }
  });

  return deferred.promise;
};
```
*Get tweet content from a tweet ID*

```javascript
exports.findById = function(tweetId, userId, channel) {
  var res = null;
  var tweetHashChannel = config.store.tweetHash + ':' + channel;
  var dfd = Q.defer();
  redis.hget(tweetHashChannel, tweetId, function (err, reply) {
    if(err) {
      dfd.reject(err);
      return;
    }
    res = (reply) ? { id: tweetId, content: reply } : reply;
    return dfd.resolve(res);
  });

  return dfd.promise;
};
```
*Get all the tweets that user can swipe.*
*First we use SUNIONSTORE: join tweet ids from user likes and nopes, and then use SDIFF to do a difference from All the tweets*

```javascript
exports.findToSwipe = function(userId, channel) {
  var tweetHashChannel = config.store.tweetHash + ':' + channel;
  var tweetSetChannel = config.store.tweetSet + ':' + channel;
  var likeUserSet = config.store.likeSet + ':' + userId + ':' + channel;
  var nopeUserSet = config.store.nopeSet + ':' + userId + ':' + channel;
  var swipedUserSet = config.store.swipedSet + ':' + userId + ':' + channel;
  var unionArgs =  [ swipedUserSet, likeUserSet, nopeUserSet ];
  var default_offset = 0;
  var default_count = 10;
  var deferred = Q.defer();

  redis.sunionstore(unionArgs, function(err, result) {
    if(err) {
      deferred.reject(err);
      return;
    }
    var diffArgs = [ tweetSetChannel, swipedUserSet ];
    redis.sdiff(diffArgs, function(err, response) {

      var result = [];
      if(err) {
        deferred.reject(err);
      } else {
        if (response.length === 0) {
          deferred.resolve([]);
        } else {
          response = response.slice(default_offset, default_count);
          async.forEach(response, function (tweetId, callback) {
            redis.hget(tweetHashChannel, tweetId, function (err, reply) {
              result.push({ id: tweetId, content: reply});
              callback();
            });
          }, function (err) {
            if(err) {
              deferred.reject(err);
              return;
            }
            deferred.resolve(result);
          });
        }
      }
    });
  });

  return deferred.promise;
};
```

*Get paginated viewed tweets*
*SDIFF to make a difference: All tweet less user nopes set*

```javascript
exports.findViewed = function(userId, offset, count, channel) {
  var default_offset = 0;
  var default_count = 10;
  offset = (offset === undefined) ? default_offset : offset;
  count = (count === undefined) ? default_count : count;

  var tweetHashChannel = config.store.tweetHash + ':' + channel;
  var tweetSetChannel = config.store.tweetSet + ':' + channel;
  var nopeUserSet = config.store.nopeSet + ':' + userId + ':' + channel;
  var diffArgs = [ tweetSetChannel, nopeUserSet ];

  var deferred = Q.defer();

  redis.sdiff(diffArgs, function(err, response) {
    var result = [];
    if(err) {
      deferred.reject(err);
    } else {
      if (response.length === 0) {
        deferred.resolve([]);
      } else {
        response = response.slice(offset, (offset+count));
        async.forEach(response, function (tweetId, callback) {
          redis.hget(tweetHashChannel, tweetId, function (err, reply) {
            result.push({ id: tweetId, content: reply});
            callback();
          });
        }, function (err) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(result);
        });
      }
    }
  });

  return deferred.promise;
};
```

### Add feature and route on API

On [routes.js](../express-api/routes/routes.js) add:

```javascript
var findLikes = function(req, res, next) {
  backend.findLikes(req.user, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};


var findToSwipe = function(req, res, next) {
  backend.findToSwipe(req.user, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findViewed = function(req, res, next) {
  var offset = 0;
  var qty_per_page = 10;

  if(req.query.page) {
    offset = (parseInt(req.query.page)-1) * qty_per_page;
  }

  if(offset <= 0) {
    offset = 0;
  }

  backend.findViewed(req.user, offset, qty_per_page, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findById = function(req, res, next) {
  backend.findById(req.params.tweet, req.user, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};
```

```javascript
var appRouter = function(app) {
  ...
  app.get('/viewed/:channel', findViewed);
  app.get('/tweet/:tweet/:channel', findById);
  app.get('/likes/:channel', findLikes);
  app.get('/swipes/:channel', findToSwipe);
};
```
