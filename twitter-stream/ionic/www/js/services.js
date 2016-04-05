angular.module('starter.services', [])

.factory('tweet', function ($http, $rootScope) {
  var _tweet = {};

  _tweet.findByHashtag = function(queryString) {

    return  [
    { title: 'tweet1', id: 1 },
    { title: 'tweet2', id: 2 },
    { title: 'tweet3', id: 3 },
    { title: 'tweet4', id: 4 },
    { title: 'tweet5', id: 5 },
    { title: 'tweet6', id: 6 }
    ];
//    return $http.get($rootScope.server + '/hashtag', {params: queryString});
  };

  _tweet.findById = function(tweetId) {
    return $http.get($rootScope.apiBase + '/tweet', {params: tweetId});
  };

  return _tweet;
});
