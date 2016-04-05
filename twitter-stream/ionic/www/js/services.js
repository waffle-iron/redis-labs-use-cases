angular.module('starter.services', [])

.factory('tweet', function ($http, $rootScope) {
  var _tweet = {};

  _tweet.findByHashtag = function(hashtag) {
    return $http.get($rootScope.apiBase + '/hashtag/' + hashtag);
  };

  _tweet.findById = function(id) {
    return $http.get($rootScope.apiBase + '/tweet/' + id);
  };

  return _tweet;
});
