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
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
};

module.exports = config;
