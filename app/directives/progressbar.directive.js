angular.module('gui')
.directive('progressbar', function(){
  return {
    restrict: 'E',
    template: '<div id="progressbar"></div>',
    controller: function($scope){

      var width = parseInt(d3.select('#progressbar').style('width'))-40;
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
        .attr("y", 1)
        .attr("stroke", "darkgrey");

      progressbar.append("text")
        .attr("y", 12)
        .attr("x", width/2-13) // 13 is half of the text length of "100%"
        .style("font-size", "11px")
        .text("100%");

      // update progress bar
      $scope.$on('updateProgress', function(event, arg){
        var percent = Math.round(arg.progress*100);
        d3.select(".progress").attr("width", arg.progress*width);
        progressbar.select("text").text(percent + "%");
      })
    },
    controllerAs: 'progressbarCtrl'
};
});
