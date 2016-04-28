/*jslint node: true */
'use strict';
var config = require('./config');

// Get dependencies
var Twitter = require('twitter');
var twitterText = require('twitter-text');
var async = require('async');
var stringHash = require('string-hash');
var _ = require('lodash');

// Set up Twitter client
var client = new Twitter(config.twitter);

// Set up connection to Redis
var redis_conn = require("redis");
var redis = redis_conn.createClient(config.redis.url, {detect_buffers: true, no_ready_check: true});

redis.on("error", function (err) {
    console.log("Error: " + err);
});


console.log("Initiating Streaming from", config.app.channels);
