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

        var myObject = data.attributes[data.currentAttribute].distribution;

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
        var svg = barchart.append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

        var chart = svg.append("g")
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
            .attr("height", function(d){ return height - scaleY(+d.value); })
            .on("click", click);

        /* selection frame */
        svg.on("mousedown", function(){
          var p = d3.mouse(this);

          svg.append("rect")
          .attr({
            rx: 6,
            ry: 6,
            class: "selection",
            x: p[0],
            y: p[1],
            width: 0,
            height: 0
          })
        })
        .on("mousemove", function(){
          var s = svg.select("rect.selection");

          if(!s.empty()){
            var p = d3.mouse(this),
                d = {
                    x: parseInt(s.attr("x"), 10),
                    y: parseInt(s.attr("y"), 10),
                    width: parseInt(s.attr("width"), 10),
                    height: parseInt(s.attr("height"), 10)
                },
                move = {
                    x: p[0] - d.x,
                    y: p[1] - d.y
                };
            if( move.x < 1 || (move.x*2<d.width)) {
                d.x = p[0];
                d.width -= move.x;
            } else {
                d.width = move.x;
            }

            if( move.y < 1 || (move.y*2<d.height)) {
                d.y = p[1];
                d.height -= move.y;
            } else {
                d.height = move.y;
            }

            s.attr( d);
          }
        })
        .on("mouseup", function(){
          // remove selection frame
          svg.selectAll( "rect.selection").remove();

          // remove temporary selection marker class
          //d3.selectAll( 'g.state.selection').classed( "selection", false);
        });

        barchart.append("button")
          .attr("class", "btn btn-default")
          .attr("type", "button")
          .style("width", "100%")
          .on("click", buttonClick)
          .append("text")
            .text("Apply filter");


        function click(d) {
          //console.log(d3.select(this)); //rect.bar.selected
          if(d3.select(this).classed("selected"))
            d3.select(this).classed("selected", false);
          else
            d3.select(this).classed("selected", true);
        }

        function buttonClick(d){
          // TODO: collect chosen attribute values for filtering
          // TODO: start filtering
        }

      })
    },
    controllerAs: 'barchartCtrl'
};
}]);
