angular.module('gui')
.directive('progressbar', function(){
  return {
    restrict: 'E',
    template: '<div id="progressbar"></div>',
    controller: function($scope){

      var width = parseInt(d3.select('#progressbar').style('width'))-60;
      var height = 15;
      var margin = 15;

      var progressbar = d3.select("#progressbar")
        .append("svg")
          .attr("width", width)
          .attr("height", 15)
        .append("g");

      progressbar.append("rect")
        .attr("class", "border")
        .attr("width", width)
        .attr("height", 15);

      progressbar.append("rect")
        .attr("class", "progress")
        .attr("width", width-2)
        .attr("height", 13)
        .attr("x", 1)
        .attr("y", 1);

      $scope.$on('filtered', function(event, arg){
        var progress = d3.select(".progress").attr("width", width-100);
      })
    },
    controllerAs: 'progressbarCtrl'
};
});
