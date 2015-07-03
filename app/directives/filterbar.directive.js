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

      // initial "all" filter element
      /*filterbar.append("rect")
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
          .text("all"); */

      $scope.$on('filtered', function(event, arg){
        // visualize/update subgroup matrix
        var dataset = data.subgroups;

        //TODO: handle initial element
        //TODO: implement shrinking of elements
        //TODO: set last filtered element selected (-> TODO in setActive)
        //TODO: change use of row and column attributes to indices in subgroup matrix so that row and column attributes get useless and can be removed
        //TODO: when filtered three times then third row is mapped on second row -> third row not visible
        var filterelement = filterbar.selectAll("g")
          .data(dataset)
          .enter()
          .append("g");
        filterelement.selectAll("rect")
          .data(function(d,i,j) { return d; })
          .enter()
          .append("rect")
            .attr("class", "filterelement")
            .attr("x", function(d,i,j) { return (d == null) ? 0 : (30 + d.column*(elementWidth+margin)); })
            .attr("y", function(d,i,j) { return (d == null) ? 0 : (10 + d.row*(elementHeight+5)); })
            .attr("width", elementWidth)
            .attr("height", elementHeight)
            .style("display", function(d,i,j) { return (d == null) ? "none" : "inline"; })
            //TODO: disable click for hidden elements
            .on("click", click);

        filterelement.selectAll("text")
          .data(function(d,i,j) { return d; })
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

        // set filter element selected
        //setActive(filterelement, arg.subgroup.column);
      })

      function click(d) {
        var element = d3.select(this);
        // get id of clicked element
        var id = Number(element[0][0].id);
        // set clicked filter element selected
        setActive(element, id);
        //TODO: set selected = true in corresponding subgroup object
      }

      function save(){
        data.saveSubgroup();
      }

      function setActive(element, id){
        // select element in filterbar, only one selected element at a time
        d3.select('.filterelement.selected').classed('selected', false);
        element.classed('selected', true);
      }
    },
    controllerAs: 'filterbarCtrl'
};
}]);
