angular.module('starter.services', [])

.factory('location', function ($http, $rootScope) {
  var _location = [];

  _location.findRadiuses = function() {
    return $http.get($rootScope.apiBase + '/radiuses/');
  };

  _location.findMembers = function() {
    return $http.get($rootScope.apiBase + '/members/');
  };

  _location.findByCoords = function(queryString) {
    return $http.get($rootScope.apiBase + '/findbycoords/', { params: queryString });
  };

  _location.findPos = function(queryString) {
    return $http.get($rootScope.apiBase + '/findpos/', { params: queryString });
  };

  _location.addLocation = function(queryString) {
    return $http.get($rootScope.apiBase + '/add/', { params: queryString });
  };

  return _location;
});
