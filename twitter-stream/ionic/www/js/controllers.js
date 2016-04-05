angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('TweetListCtrl', function($scope, $rootScope, tweet) {
  $scope.tweets = tweet.findByHashtag($rootScope.defaultHashtag);
})

.controller('TweetDetailCtrl', function($scope, $stateParams) {
});
