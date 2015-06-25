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

      // add initial subgroup to subgroup list
      d3.select("#subgroupList").append("li")
        .attr("id", 0)
        .text("All");

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

        // add subgroup to subgroup list
        d3.select("#subgroupList").append("li")
          .attr("id", arg.index)
          .text("Subgroup" + arg.index);
      })

      function click(d) {
        // get id of clicked element
        var id = Number(d3.select(this)[0][0].id);
        // select element in filterbar, only one selected element at a time
        console.log(d3.select(this));
        d3.select('.filterelement.selected').classed('selected', false);
        d3.select(this).classed('selected', true);

        // select corresponding subgroup in list
        var listItems = d3.select("#subgroupList").selectAll("li");
        listItems.classed('selected', false);
        listItems.each(function(item){
          if(Number(d3.select(this)[0][0].id) == id)
            d3.select(this).classed('selected', true);
        });
      }
    },
    controllerAs: 'filterbarCtrl'
};
});
