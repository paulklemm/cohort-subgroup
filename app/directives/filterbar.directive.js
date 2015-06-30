angular.module('gui')
.directive('filterbar', function(){
  return {
    restrict: 'E',
    template: '<div id="filterbar"></div>',
    controller: function($scope){

      var width = parseInt(d3.select('#filterbar').style('width'));
      var elementWidth = Math.floor((width-175)/10);
      var elementHeight = 40;
      var margin = 15;

      var filterbar = d3.select("#filterbar")
        .append("svg")
          .attr("width", width)
          .attr("height", 55)
        .append("g");

      // initial "all" filter element
      filterbar.append("rect")
        .attr("class", "filterelement")
        .attr("id", 0)
        .attr("x", 30)
        .attr("y", 10)
        .attr("width", elementWidth)
        .attr("height", elementHeight)
        .on("click", click);

      filterbar.append("text")
        .attr("y", 10)
        .append("tspan")
          .attr("x", 43)
          .attr("dy", "1.2em")
          .text("all");

      $scope.$on('filtered', function(event, arg){
        var attributeText = arg.subgroup.attribute + ":";
        var elementText = "";
        for(i=0; i < arg.subgroup.filterValues.length-1; i++){
          elementText += arg.subgroup.filterValues[i] + ", ";
        }
        elementText += arg.subgroup.filterValues[arg.subgroup.filterValues.length-1];

        var filterelement = filterbar.append("rect");
        filterelement
          .attr("class", "filterelement")
          .attr("x", 30 + ((arg.subgroup.column)%5)*(elementWidth+margin))
          .attr("y", 10)
          .attr("width", elementWidth)
          .attr("height", elementHeight)
          .on("click", click);

        filterbar.append("text")
          .attr("y", 10)
          .append("tspan")
            .attr("x", 35 + ((arg.subgroup.column)%5)*(elementWidth+margin))
            .attr("dy", "1.2em")
            .text(attributeText)
          .append("tspan")
            .attr("x", 35 + ((arg.subgroup.column)%5)*(elementWidth+margin))
            .attr("dy", "1.2em")
            .text(elementText);

        // set filter element selected
        setActive(filterelement, arg.subgroup.column, false);
      })

      function click(d) {
        var element = d3.select(this);
        // get id of clicked element
        var id = Number(element[0][0].id);
        // set clicked filter element selected
        setActive(element, id, false);
      }

      function setActive(element, id, list){
        // select element in filterbar, only one selected element at a time
        d3.select('.filterelement.selected').classed('selected', false);
        element.classed('selected', true);
      }
    },
    controllerAs: 'filterbarCtrl'
};
});
