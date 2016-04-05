angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('TweetListCtrl', function($scope, $rootScope, tweet, $q) {

  $scope.tweets = [];

  var getDefaultCriteria = function() {
    return $rootScope.defaultHashtag;
  };

  var loadData = function() {
    if($scope.searchKey) {
      tweet.findByHashtag($scope.searchKey)
        .then(function(r) {
          $scope.tweets = r.data.result;
        });
    }
  };

  var clearCriteria = function() {
    $scope.searchKey = getDefaultCriteria();
    $scope.loadData();
  };

  $scope.searchKey = getDefaultCriteria();
  $scope.loadData = loadData;
  $scope.clearCriteria = clearCriteria;
  $scope.loadData();

})

.controller('TweetDetailCtrl', function($scope, $stateParams, tweetDetail) {
  $scope.tweet = tweetDetail;
});
