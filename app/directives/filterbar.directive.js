angular.module('gui')
.directive('filterbar', function(){
  return {
    restrict: 'E',
    template: '<div id="filterbar"></div>',
    controller: function($scope){

      var width = parseInt(d3.select('#filterbar').style('width'));
      var elementWidth = Math.floor((width-175)/5);
      var elementHeight = 30;
      var margin = 15;

      var filterbar = d3.select("#filterbar")
        .append("svg")
          .attr("width", width)
          .attr("height", 45)
        .append("g");

      // initial "all" subgroup element
      filterbar.append("rect")
        .attr("class", "filterelement")
        .attr("id", 0)
        .attr("x", 30)
        .attr("y", 10)
        .attr("width", 40)
        .attr("height", elementHeight)
        .on("click", click);

      filterbar.append("text")
        .attr("y", 10)
        .append("tspan")
          .attr("x", 43)
          .attr("dy", "1.2em")
          .text("all");

      $scope.$on('filtered', function(event, arg){
        var attributeText = arg.attribute + ":";
        var elementText = "";
        for(i=0; i < arg.values.length-1; i++){
          elementText += arg.values[i] + ", ";
        }
        elementText += arg.values[arg.values.length-1];

        filterbar.append("rect")
          .attr("class", "filterelement")
          .attr("id", arg.index)
          .attr("x", 85 + ((arg.index-1)%5)*(elementWidth+margin))
          .attr("y", 10)
          .attr("width", elementWidth)
          .attr("height", elementHeight)
          .on("click", click);

        filterbar.append("text")
          .attr("y", 10)
          .append("tspan")
            .attr("x", 90 + ((arg.index-1)%5)*(elementWidth+margin))
            .attr("dy", "1.2em")
            .text(attributeText)
          .append("tspan")
            .attr("x", 90 + ((arg.index-1)%5)*(elementWidth+margin))
            .attr("dy", "1.2em")
            .text(elementText);
      })

      function click(d) {
        console.log(d3.select(this));
      }

    },
    controllerAs: 'filterbarCtrl'
};
});
