angular.module('gui')
.directive('graph', ['data', function(data){
  return {
    restrict: 'E',
    template: '<svg class="graph"></svg>',
    controller: function($scope){
      $scope.$on("dataLoaded", function(){


        })
    },
    controllerAs: 'graphCtrl'
};
}]);
