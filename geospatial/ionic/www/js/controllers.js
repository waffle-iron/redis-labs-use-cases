angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('LocationListCtrl', function($scope, $rootScope, $q, $ionicPopup, $cordovaGeolocation, $timeout, $log, lodash, locations, radiuses, uiGmapGoogleMapApi, location) {

  var radiusToZoomLevel = function(radius){
    return Math.round(16-Math.log(radius)/Math.log(2));
  };

  var makeCheckbox = function(val, defaultVal) {
    var checked = ( defaultVal === val) ? true : false;
    return { name: val, checked: checked };
  };

  var findMarkers = function(lat, long) {
    var q = { radius: $scope.selectedRadius, lat: lat, long: long};
    location.findByCoords(q).then(function(r) {
      var markers = _.map(r.data.result, function(v) {
        return {
          id: Math.random().toString(36).substring(7),
          coords: {
            latitude: v.lat,
            longitude: v.long
          },
          options: {
            label: v.name,
            visible: true
          }
        };
      });
      $scope.markers = markers;
      $scope.map.control.refresh({ latitude: lat, longitude: long});
      $scope.map.control.getGMap().setZoom($scope.currentZoom);
    });
 };

  var defaultRadius = '100 mi';
  var defaultPosition = { coords: { latitude: 37.767, longitude: -122.417 }};

  $scope.locations = _.map(locations, makeCheckbox);
  $scope.radiuses = _.map(radiuses, _.bind(makeCheckbox, {}, _, defaultRadius) );
  $scope.markers = [];
  $scope.selectedRadius = defaultRadius;
  $scope.selectedLocation = '';
  $scope.currentZoom = radiusToZoomLevel(defaultRadius.split(' ')[0]);

  var renderMap = function(position) {
    $log.info(position);

    if (!position) {
      position = defaultPosition;
    }

    var options = {
      scrollwheel: false,
      zoomControl: false,
      draggable: true,
      navigationControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      disableDoubleClickZoom: false,
      keyboardShortcuts: true
    };
    $scope.map = {
      center: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      zoom: $scope.currentZoom,
      control: {},
      options: options
    };
  };

  uiGmapGoogleMapApi.then(function(maps) {
    var posOptions = { timeout: 10000, enableHighAccuracy: false };
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
        .then(
          function (position) {
            $scope.position = position;
            renderMap(position);
          },
          function(err) {
            $log.error(err);
            renderMap();
          }
        );
    }
  );

  $scope.updateSelection = function(position, items, title, selected) {
    var found = false;
    angular.forEach(items, function(subscription, index) {
      if (position != index) {
        subscription.checked = false;
        $scope[selected] = title;
      }
      if(subscription.checked === true) {
        found = true;
      }
    });
    if(!found) {
      $scope[selected] = '';
    }
  };

  $scope.showPopupLocations = function() {
    var myPopup = $ionicPopup.show({
      template: '<ion-checkbox ng-repeat="location in locations" ng-model="location.checked" ng-click="updateSelection($index, locations, location.name, \'selectedLocation\')">{{ location.name }}</ion-checkbox>',
      title: 'Select Location',
      cssClass: 'checkboxes-popup checkbox-assertive',
      scope: $scope,
      buttons: [
        {
          text: '<b>Ok</b>',
          type: 'button-assertive'
        }
      ]
    });

    myPopup.then(function(res) {
      $log.debug('Change location', $scope.selectedLocation);
      location.findPos({ member: $scope.selectedLocation })
        .then(function(r) {
          findMarkers(r.data.result.lat, r.data.result.long);
        });
    });
  };

  $scope.showPopupRadiuses = function() {
    var myPopup = $ionicPopup.show({
      template: '<ion-checkbox ng-repeat="radius in radiuses" ng-model="radius.checked" ng-click="updateSelection($index, radiuses, radius.name, \'selectedRadius\')">{{ radius.name }}</ion-checkbox>',
      title: 'Select Radius',
      cssClass: 'checkboxes-popup checkbox-assertive',
      scope: $scope,
      buttons: [
        {
          text: '<b>Ok</b>',
          type: 'button-assertive'
        }
      ]
    });

    myPopup.then(function(res) {
      $log.debug('Change radius', $scope.selectedRadius);
      var mi = $scope.selectedRadius.split(' ');
      $scope.currentZoom = radiusToZoomLevel(mi[0]);
      location.findPos({ member: $scope.selectedLocation })
        .then(function(r) {
          findMarkers(r.data.result.lat, r.data.result.long);
        });
    });
  };

})
;
