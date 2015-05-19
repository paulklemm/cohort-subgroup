angular.module('gui')
.directive('graph', ['data', function(data){
  return {
    restrict: 'E',
    template: '<svg class="graph"></svg>',
    controller: function($scope){
      $scope.$on("attributeSet", function(){

        var margin = {top: 20, right: 30, bottom: 30, left: 40};

        var width = 168;
        var height = 150;

        //var myObject = [{ x: 1, y: 5 }, { x: 20, y: 20 }, { x: 40, y: 10 }, { x: 60, y: 40 }, { x: 80, y: 5 }, { x: 100, y: 60 }];
        var myObject = data.currentAttribute.distribution;

        var graph = d3.select(".graph")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var scaleX = d3.scale.linear()
          .domain([0, d3.max(myObject, function(d){ return d.x; })])
          .range([0, width]);

        var scaleY = d3.scale.linear()
          .domain([0, d3.max(myObject, function(d){ return d.y; })])
          .range([height, 0]);

        var xAxis = d3.svg.axis()
          .scale(scaleX)
          .orient("bottom");

        var yAxis = d3.svg.axis()
          .scale(scaleY)
          .orient("left");

        graph.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        graph.append("g")
          .attr("class", "y axis")
          .call(yAxis);

        var valueline = d3.svg.line()
          .x(function(d) { return scaleX(d.x); })
          .y(function(d) { return scaleY(d.y); })
          .interpolate('linear');

        graph.append("path")
          .attr("class", "line")
          .attr("d", valueline(myObject));

      })
    },
    controllerAs: 'graphCtrl'
};
}]);
