angular.module('gui')
.directive('barchart', ['data', function(data){
  return {
    restrict: 'E', //directive can be invoked on the page via <searchbar></searchbar>
    template: '<div class="barchart"></div>',
    controller: function($scope){
      $scope.$on("dataLoaded", function(){
        ages = [];
        for(var i=0; i <= 9; i++){
          ages[i] = +data.dataset[i].Age;
        }
        d3.select(".barchart")
        .selectAll("div")
        .data(ages)
        .enter().append("div")
        .style("width", function(d) { return d + "%"; })
        .text(function(d) { return d; });
        /*var width = 300;
        var height = 150;
        var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
        var y = d3.scale.linear().rangeRound([height,0]);
        d3.select(".barchart").append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g");
        x.domain(ages.map(function(d){
          return d;
        }));
        y.domain([0, d3.max(ages, function (d){
          return d;
        })]);
        var age = svg.selectAll(".age")
        .data(ages)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function (d) {
        return "translate(" + x(d) + ",0)";
      });*/

      })
    },
    controllerAs: 'barchartCtrl'
};
}]);
