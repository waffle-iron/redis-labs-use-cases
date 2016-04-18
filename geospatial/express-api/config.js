var config = {};

config.app = {
    name: "Geospatial API",
    description: "Geospatail redis with Express API",
    version: "0.0.1"
};

config.redis = {
  url: process.env.REDISCLOUD_URL || 'redis://localhost:6379',
};

config.addDefaultValues = process.env.ADD_DEFAULT_VALUES || 0;

config.store = {
  auths: 'auths',
  user_next_id: 'user_next_id',
  locationGeoSet: 'locationGeoSet'
};

module.exports = config;
