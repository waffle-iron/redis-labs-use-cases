/*jslint node: true */
'use strict';
var config = require('./config');

// Get dependencies
var Twitter = require('twitter');
var twitterText = require('twitter-text');
var async = require('async');
var stringHash = require('string-hash');

// Set up Twitter client
var client = new Twitter(config.twitter);

// Set up connection to Redis
var redis_conn = require("redis");
var redis = redis_conn.createClient(config.redis.url, {detect_buffers: true, no_ready_check: true});

/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/
console.log("Initiating Streaming");
client.stream('statuses/filter', {track: config.app.keyword, lang: 'en'},  function(stream) {
    stream.on('data', function(tweet) {
        console.log(JSON.stringify(tweet.text, null, 4));

        //Hash with tweet text
        redis.hset(config.store.tweetHash, tweet.id_str, tweet.text);

        //Preparing zset vote idnex
        var tVote = [ config.store.voteZset, 0, tweet.id_str ];
        redis.zadd(tVote);

        // Add to set and list
        // redis.sadd("tweetSet", tweet.text);
        // redis.rpush('tweetList', tweet.text);

        var args = [ config.store.hashtagZset ];
        async.forEach(twitterText.extractHashtags(tweet.text), function (hashtag, callback) {
            console.log("Found hashtag ", hashtag);
            args.push(stringHash(hashtag)); // djb2 string to int hash http://www.cse.yorku.ca/~oz/hash.html
            args.push(tweet.id_str);
            callback();
        }, function (err) {
            console.log(JSON.stringify(args, null, 4));
            redis.zadd(args, function (err, response) {
              if (err) {
                console.error("ZADD error ", err);
                return;
              }
            });
        });
    });

    stream.on('error', function(error) {
        console.log(error);
    });
});
