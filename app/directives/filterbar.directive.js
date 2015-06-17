angular.module('gui')
.directive('filterbar', function(){
  return {
    restrict: 'E',
    template: '<div id="filterbar"></div>',
    controller: function($scope){

      var width = parseInt(d3.select('#filterbar').style('width'));

      var filterbar = d3.select("#filterbar")
        .append("svg")
          .attr("width", width)
          .attr("height", 50)
        .append("g");

      $scope.$on('filtered', function(){
        filterbar.append("rect")
          .attr("class", "filterelement")
          .attr("x", 30)
          .attr("y", 15)
          .attr("width", 74)
          .attr("height", 30);
      })
    },
    controllerAs: 'filterbarCtrl'
};
});
