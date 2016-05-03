// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.filters', 'ionic.contrib.ui.tinderCards', 'ngStorage', 'uuid4', 'ionic.service.core', 'btford.socket.io' ])

.run(function($ionicPlatform, $rootScope, $localStorage, uuid4) {

  $rootScope.apiBase = 'http://redis-twitter-stream.herokuapp.com';
  $rootScope.defaultHashtag = 'sxsw';
  $rootScope.channel = 'sxsw';
  $rootScope.channels = ['sxsw', 'RedisConf'];

  //Default uuid
  $rootScope.storage = $localStorage.$default({ 'uuid' : uuid4.generate() });

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      'request': function(config) {
        config.headers['x-access-token'] = $rootScope.storage.uuid;
        return config;
      }
    };
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })


  .state('app.recommendations', {
    url: '/recommendations',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/recommendations.html',
        controller: 'RecommendationCtrl',
        resolve: {
          tweetList: function(tweet, $stateParams, $rootScope) {
            return tweet.findRecommendations().then(function(r) {
              return r.data.result;
            });
          }
        }
      }
    }
  })

  .state('app.favorites', {
    url: '/favorites',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/favorites.html',
        controller: 'TweetFavoriteCtrl',
        resolve: {
          tweetFavorites: function(tweet) {
            return tweet.getFavorites().then(function(r) {
              return r.data.result;
            });
          }
        }
      }
    }
  })

  .state('app.tweets', {
    url: '/tweets',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/tweetlist.html',
        controller: 'TweetListCtrl'
      }
    }
  })

  .state('app.stream', {
    url: '/stream',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/stream.html',
        controller: 'StreamCtrl',
      }
    }
  })

  .state('app.tweet-detail', {
    url: '/tweets/:tweetId',
    views: {
      'menuContent': {
        templateUrl: 'templates/tweetdetail.html',
        controller: 'TweetDetailCtrl',
        resolve: {
          tweetDetail: function(tweet, $stateParams) {
            return tweet.findById($stateParams.tweetId).then(function(r) {
              return r.data.result;
            });
          }
        }
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/stream');
});
