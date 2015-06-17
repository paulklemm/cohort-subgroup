angular.module('gui')
.directive('filterbar', function(){
  return {
    restrict: 'E',
    template: '<div id="filterbar"></div>',
    controller: function($scope){

      var width = parseInt(d3.select('#filterbar').style('width'));
      var elementWidth = Math.floor((width-120)/5);
      var elementHeight = 30;
      var margin = 15;

      var filterbar = d3.select("#filterbar")
        .append("svg")
          .attr("width", width)
          .attr("height", 50)
        .append("g");

      $scope.$on('filtered', function(event, index){
        filterbar.append("rect")
          .attr("class", "filterelement")
          .attr("x", 30 + (index%5)*(elementWidth+margin))
          .attr("y", 15)
          .attr("width", elementWidth)
          .attr("height", elementHeight);
      })
    },
    controllerAs: 'filterbarCtrl'
};
});
