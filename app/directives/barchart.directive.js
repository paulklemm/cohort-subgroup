angular.module('gui')
.directive('barchart', ['data', function(data){
  return {
    restrict: 'E',
    template: '<div class="barchart"></div>',
    controller: function($scope){
      $scope.$on("dataLoaded", function(){
        ages = [];
        for(var i=0; i <= 9; i++){
          ages[i] = +data.dataset[i].Age;
        }

        // horizontal barchart
        /*d3.select(".barchart")
        .selectAll("div")
        .data(ages)
        .enter().append("div")
        .style("width", function(d) { return d + "%"; })
        .text(function(d) { return d; });*/

        // vertical barchart
        var width = 300;
        var height = 450;

        var datas = ages;

        var scaleX = d3.scale.ordinal()
          .domain(datas.map(function (d){ return d; }))
          .rangeRoundBands([0, width], .1);

        var scaleY = d3.scale.linear()
          .domain([0, d3.max(datas, function(d){ return d; })])
          .range([0, height]);

        var svg = d3.select(".barchart").append("svg")
          .attr("width", width)
          .attr("height", height);

        svg.selectAll("rect")
          .data(datas)
          .enter().append("rect")
          .attr("transform", function(d){ return "translate(" + scaleX(d) + ",0)"; })
          .attr("y", 0)
          .attr("width", 20)
          .attr("height", function(d){ return scaleY(d); });
        })
    },
    controllerAs: 'barchartCtrl'
};
}]);
