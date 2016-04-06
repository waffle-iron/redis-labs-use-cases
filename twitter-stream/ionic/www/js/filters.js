angular.module('starter.filters', [])

.filter('matcher', function() {
  return function(arr1, arr2) {
    var array2Ids = [];
    angular.forEach(arr2, function(value, index) {
      array2Ids.push(value.id);
    });
    return arr1.filter(function(val) {
      return array2Ids.indexOf(val.id) === -1;
    });
  };
})

;
