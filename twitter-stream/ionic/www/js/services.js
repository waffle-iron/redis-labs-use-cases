angular.module('starter.services', [])

.factory('tweet', function ($http, $rootScope) {
  var _tweet = {};
  var _favorites = [];
  var _swiped = [];

  _tweet.findByHashtag = function(hashtag, queryString) {
    return $http.get($rootScope.apiBase + '/hashtag/' + hashtag, { params: queryString });
  };

  _tweet.findById = function(id) {
    return $http.get($rootScope.apiBase + '/tweet/' + id);
  };

  _tweet.findRecommendations = function() {
    return $http.get($rootScope.apiBase + '/recommendations/');
  };

  _tweet.like = function(id) {
    return $http.get($rootScope.apiBase + '/like/' + id);
  };

  _tweet.nope = function(id) {
    return $http.get($rootScope.apiBase + '/nope/' + id);
  };

  _tweet.getFavorites = function() {
    return $http.get($rootScope.apiBase + '/likes/');
  };

  _tweet.swipe = function(tweet) {
    var exists = false;
    for (var i = 0; i < _swiped.length; i++) {
      if (_swiped[i].id === tweet.id) {
        exists = true;
        break;
      }
    }
    if (!exists) _swiped.push(tweet);
  };

  _tweet.getSwiped = function() {
    return _swiped;
  };

  return _tweet;
});
