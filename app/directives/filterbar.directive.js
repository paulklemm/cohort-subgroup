angular.module('gui')
.directive('filterbar', ['data', function(data){
  return {
    restrict: 'E',
    template: '<div id="filterbar"></div>',
    controller: function($scope){

      var width = 0.9*parseInt(d3.select('#filterbar').style('width'));
      var elementWidth = Math.floor((width-175)/10);
      var elementHeight = 30;
      var margin = 15;

      var bar = d3.select("#filterbar");
      var filterbar  = bar.append("svg")
          .attr("width", width)
          .attr("height", 80);

      // add save button
      bar.append("button")
        .attr("class", "btn btn-default")
        .attr("type", "button")
        //.attr("x", 100)
        .style("width", 50)
        .on("click", save)
        .append("text")
          .text("Save");

      $scope.$on('update', function(event, arg){
        // visualize/update subgroup matrix
        var dataset = data.subgroups;
        // 2) TODO: implement shrinking of elements
        // 3) TODO: set last filtered element selected (corresponding subgroup is already selected) -> use enter

        var enter = filterbar.selectAll("rect")
          .data(dataset)
          .enter();
        enter.append("rect")
            .attr("class", "filterelement")
            //.attr("class", function(d,i,j) { return (d.row == data.selectedSub.row && d.column == data.selectedSub.column) ? "selected" : ""; })
            .attr("x", function(d,i,j) { return (d == null) ? 0 : (30 + d.column*(elementWidth+margin)); })
            .attr("y", function(d,i,j) { return (d == null) ? 0 : (10 + d.row*(elementHeight+5)); })
            .attr("width", elementWidth)
            .attr("height", elementHeight)
            .style("display", function(d,i,j) { return (d == null) ? "none" : "inline"; })
            .on("click", click);

        filterbar.selectAll("text")
          .data(dataset)
          .enter()
          .append("text")
            .attr("y", function(d,i,j) { return (d == null) ? 0 : (10 + d.row*(elementHeight+5)); })
            .style("display", function(d,i,j) { return (d == null) ? "none" : "inline"; })
            .append("tspan")
              .attr("x", function(d,i,j) { return (d == null) ? 0 : (35 + d.column*(elementWidth+margin)); })
              .attr("dy", "1.2em")
              .text(function(d,i,j){ return (d == null) ? "" : (d.attribute + ":"); })
            .append("tspan")
              .attr("x", function(d,i,j) { return (d == null) ? 0 : (35 + d.column*(elementWidth+margin)); })
              .attr("dy", "1.2em")
              .text(function(d,i,j){
                var elementText = "";
                if(d != null && d.filterValues){
                  for(i=0; i < d.filterValues.length-1; i++){
                    elementText += d.filterValues[i] + ", ";
                  }
                  elementText += d.filterValues[d.filterValues.length-1];
                }
                return elementText;
              });
      })

      function click(d) {
        var element = d3.select(this);
        // set clicked filter element selected
        setActive(element);
      }

      function save(){
        data.saveSubgroup();
      }

      function setActive(element){
        // select element in filterbar, only one selected element at a time
        d3.select('.filterelement.selected').classed('selected', false);
        element.classed('selected', true);
        // set current selected subgroup
        data.selectedSub = element[0][0].__data__;
      }
    },
    controllerAs: 'filterbarCtrl'
};
}]);
