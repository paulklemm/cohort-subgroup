angular.module('gui')
.directive('barchart', ['data', function(data){
  return {
    restrict: 'E',
    template: '<div class="barchart"></div>',
    controller: function($scope){
      $scope.$on("attributeSet", function(){

        // if chart already exists, remove its content
        d3.selectAll(".barchart").select("svg").remove();
        d3.selectAll(".graph").select("svg").remove();
        d3.selectAll(".barchart").select("button").remove();

        var margin = {top: 20, right: 30, bottom: 30, left: 40};

        //TODO: make width of barchart dependent from width of parent element
        //var width = parseInt(d3.select('#barchartContainer').style('width')) - margin.left - margin.right;
        var width = 168;
        //var width = parseInt(window.getComputedStyle(document.getElementById('barchartContainer')).width); TODO: get this working with multiple divs having percentage width
        //var height = parseInt(d3.select('#barchartContainer').style('height')) - margin.top - margin.bottom;
        var height = 150;

        var myObject = data.currentAttribute.distribution;

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

        var barchart = d3.select(".barchart");
        var chart = barchart.append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        chart.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)"); //TODO: fix long texts that go out of the svg element

        chart.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Probands");

        chart.selectAll(".bar")
            .data(myObject)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d){ return scaleX(d.attributeValue); })
            .attr("y", function(d){ return scaleY(+d.value); })
            .attr("width", scaleX.rangeBand())
            .attr("height", function(d){ return height - scaleY(+d.value); })
            .on("click", click);

        barchart.append("button")
          .attr("class", "btn btn-default")
          .attr("type", "button")
          .style("width", "100%")
          .on("click", buttonClick)
          .append("text")
            .text("Apply filter");


        function click(d) {
          var filterValue = (d.attributeValue);
          d3.select(this)
            .style("fill", function(d){ return (d3.select(this).style("fill") == "rgb(202, 4, 32)") ? "#31B404" : "#CA0420"; });
        }

        function buttonClick(d){
          var chosenBars = d3.selectAll(".bar").filter(function(d){ return (d3.select(this).style("fill") == "rgb(202, 4, 32)"); });
          var filterValues = [];
          chosenBars[0].forEach(function(bar){
            value = bar.__data__.attributeValue;
            filterValues.push(value);
          });
          console.log(filterValues);
          // TODO: start filtering
        }

      })
    },
    controllerAs: 'barchartCtrl'
};
}]);
