angular.module('gui')
.directive('barchart', ['data', function(data){
  return {
    restrict: 'E',
    template: '<svg class="barchart"></svg>',
    controller: function($scope){
      $scope.$on("dataLoaded", function(){

        var margin = {top: 20, right: 30, bottom: 30, left: 40};

        //TODO: make width of barchart dependent from width of parent element
        //var width = parseInt(d3.select('#barchartContainer').style('width')) - margin.left - margin.right;
        var width = 168;
        //var width = parseInt(window.getComputedStyle(document.getElementById('barchartContainer')).width); TODO: get this working with multiple divs having percentage width
        //var height = parseInt(d3.select('#barchartContainer').style('height')) - margin.top - margin.bottom;
        var height = 150;

        var myObject = [{attributeValue: "SHIP2", value: 200}, {attributeValue: "TREND0", value: 300}];

        var barWidth = width / myObject.length;

        var scaleX = d3.scale.ordinal()
          .domain(myObject.map(function (d){ return d.attributeValue; }))
          .rangeRoundBands([0, width], .1);

        var scaleY = d3.scale.linear()
          .domain([0, d3.max(myObject, function(d){ return +d.value; })+50])
          .range([height, 0]);

        var xAxis = d3.svg.axis()
          .scale(scaleX)
          .orient("bottom");

        var yAxis = d3.svg.axis()
          .scale(scaleY)
          .orient("left");

        var chart = d3.select(".barchart")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        chart.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        chart.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          /*.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 10)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Probands");*/

        chart.selectAll(".bar")
            .data(myObject)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d){ return scaleX(d.attributeValue); })
            .attr("y", function(d){ return scaleY(+d.value); })
            .attr("width", scaleX.rangeBand())
            .attr("height", function(d){ return height - scaleY(+d.value); });
        })
    },
    controllerAs: 'barchartCtrl'
};
}]);
