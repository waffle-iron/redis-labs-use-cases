angular.module('starter.services', [])

.factory('tweet', function ($http, $rootScope) {
  var _tweet = {};
  var _favorites = [];
  var _swiped = [];

  _tweet.findByHashtag = function(hashtag) {
    return $http.get($rootScope.apiBase + '/hashtag/' + hashtag);
  };

  _tweet.findById = function(id) {
    return $http.get($rootScope.apiBase + '/tweet/' + id);
  };

  _tweet.getFavorites = function() {
    return _favorites;
  };

  _tweet.favorite = function(tweet) {
    var exists = false;
    for (var i = 0; i < _favorites.length; i++) {
      if (_favorites[i].id === tweet.id) {
        exists = true;
        break;
      }
    }
    if (!exists) _favorites.push(tweet);
  };

  _tweet.unfavorite = function(tweet) {
    for (var i = 0; i < _favorites.length; i++) {
      if (_favorites[i].id === tweet.id) {
        _favorites.splice(i, 1);
        break;
      }
    }
  };

  _tweet.isFavorite = function(tweet) {
    var exists = false;
    for (var i = 0; i < _favorites.length; i++) {
      if (_favorites[i].id === tweet.id) {
        exists = true;
        break;
      }
    }
    return exists;
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
