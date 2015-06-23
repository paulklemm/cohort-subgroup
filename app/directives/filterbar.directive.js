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
          .attr("height", 45)
        .append("g");

      /*filterbar.append("rect")
        .attr("width", width)
        .attr("height", 15)
        .style("stroke", "black");*/

      $scope.$on('filtered', function(event, arg){
        var attributeText = arg.attribute + ":";
        var elementText = "";
        for(i=0; i < arg.values.length-1; i++){
          elementText += arg.values[i] + ", ";
        }
        elementText += arg.values[arg.values.length-1];

        filterbar.append("rect")
          .attr("class", "filterelement")
          .attr("x", 30 + (arg.index%5)*(elementWidth+margin))
          .attr("y", 10)
          .attr("width", elementWidth)
          .attr("height", elementHeight);

        filterbar.append("text")
          .attr("y", 10)
          .append("tspan")
            .attr("x", 35 + (arg.index%5)*(elementWidth+margin))
            .attr("dy", "1.2em")
            .text(attributeText)
          .append("tspan")
            .attr("x", 35 + (arg.index%5)*(elementWidth+margin))
            .attr("dy", "1.2em")
            .text(elementText);
      })
    },
    controllerAs: 'filterbarCtrl'
};
});
