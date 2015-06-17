angular.module('gui')
.directive('graph', ['data', function(data){
  return {
    restrict: 'E',
    template: '<div class="graph"></div>',
    controller: function($scope){
      $scope.$on("attributeSet", function(){

        var margin = {top: 20, right: 30, bottom: 30, left: 40};

        var width = parseInt(d3.select('.graph').style('width'))-margin.left-margin.right;
        var height = 150;

        // sort distribution for valueline
        var myObject = data.attributes[data.currentAttribute].distribution;
        myObject.sort(function(a,b){
          return a.attributeValue - b.attributeValue;
        });

        var graph = d3.select(".graph")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var scaleX = d3.scale.linear()
          .domain([0, d3.max(myObject, function(d){ return d.attributeValue; })])
          .range([0, width]);

        var scaleY = d3.scale.linear()
          .domain([0, d3.max(myObject, function(d){ return d.value; })])
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
          .x(function(d) { return scaleX(d.attributeValue); })
          .y(function(d) { return scaleY(d.value); })
          .interpolate('linear');

        graph.append("path")
          .attr("class", "line")
          .attr("d", valueline(myObject));

      })
    },
    controllerAs: 'graphCtrl'
};
}]);
