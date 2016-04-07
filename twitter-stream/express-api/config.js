var config = {};

config.app = {
    name: "Twitter Stream API",
    description: "Twitter Stream to Redis with Express API",
    version: "0.0.1",
    keyword: "#sxsw"
};

config.redis = {
    port: process.env.REDIS_PORT || '6379',
    host: process.env.REDIS_HOST || 'localhost',
    auth: process.env.REDIS_AUTH || ''
};

config.twitter =
{
    consumer_key: process.env.CONSUMER_KEY || '',
    consumer_secret: process.env.CONSUMER_SECRET || '',
    access_token_key: process.env.ACCESS_TOKEN_KEY || '',
    access_token_secret: process.env.ACCESS_TOKEN_SECRET || ''
};

config.store = {
  tweetHash: 'tweetIndex',
  voteZset: 'voteIndex',
  hashtagZset: 'hashtagIndex'
};

module.exports = config;
