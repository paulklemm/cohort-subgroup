angular.module('gui')
.directive('barchart', ['data', '$rootScope', function(data, $rootScope){
  return {
    restrict: 'E',
    template: '<div class="barchart"></div>',
    controller: function($scope){
      $scope.$on("attributeSet", function(){

        //TODO: set color of big bars back to blue after filtering

        // if chart already exists, remove its content
        d3.selectAll(".barchart").select("svg").remove();
        d3.selectAll(".graph").select("svg").remove();
        d3.selectAll(".barchart").select("button").remove();

        // determine parameter
        var margin = {top: 20, right: 30, bottom: 60, left: 40};
        var width = parseInt(d3.select('.barchart').style('width'))-margin.left-margin.right;
        var height = 180;
        //distribution of selected attribute
        var myObject = data.attributes[data.currentAttribute].distribution;
        var barWidth = width / myObject.length;

        // determine the range of coordinate system in x- and y-direction
        var scaleX = d3.scale.ordinal()
          .domain(myObject.map(function (d){ return d.attributeValue; }))
          .rangeRoundBands([0, width], .1);

        var scaleY = d3.scale.linear()
          .domain([0, d3.max(myObject, function(d){ return +d.value; })+50])
          .range([height, 0]);

        // create axes of the coordinate system
        var xAxis = d3.svg.axis()
          .scale(scaleX)
          .orient("bottom");

        var yAxis = d3.svg.axis()
          .scale(scaleY)
          .orient("left");

        // create svg for barchart
        var barchart = d3.select(".barchart");
        var svg = barchart.append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

        var chart = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // append x- and y-axes with titles
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

        // create bars according to distribution
        chart.selectAll(".bar")
            .data(myObject)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d){ return scaleX(d.attributeValue); })
            .attr("y", function(d){ return scaleY(+d.value); })
            .attr("width", scaleX.rangeBand())
            .attr("height", function(d){ return height - scaleY(+d.value); })
            .on("click", click);

        // subdivided bars
        if(data.selectedSub.attribute != "all"){
            // get distribution for this attribute based on subgroup probands
            var datas = data.calcDistribution(data.currentAttribute, data.selectedSub.data);
            chart.selectAll(".sub")
                .data(datas)
              .enter().append("rect")
                .attr("class", "sub")
                .attr("x", function(d){ return scaleX(d.attributeValue); })
                .attr("y", function(d){ return scaleY(+d.value); })
                .attr("width", scaleX.rangeBand())
                .attr("height", function(d){ return height - scaleY(+d.value); })
                .on("click", click);
        }

        // selection frame
        svg.on("mousedown", function(){
          var p = d3.mouse(this);

          svg.append("rect")
          .attr({
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

            var selectionWidth = d.width;

            d3.select('.barchart').selectAll('rect.bar').each(function(bar, i){
              var barX = d3.select(this)[0][0].x.baseVal.value;
              if( !d3.select(this).classed('selected')  && barX >= d.x-margin.left && barX+barWidth <= d.x-margin.left+selectionWidth ){
                d3.select(this)
                .classed('selected', true);
              }
            });
          }
        })
        .on("mouseup", function(){
          // remove selection frame
          svg.selectAll( "rect.selection").remove();
        });

        // append button for filtering
        barchart.append("button")
          .attr("class", "btn btn-default")
          .attr("type", "button")
          .style("width", "100%")
          .style("margin-top", "30px")
          .on("click", buttonClick)
          .append("text")
            .text("Apply filter");

        // click on bar
        function click(d) {
          var attributeValue = d3.select(this)[0][0].__data__.attributeValue;
          var other;
          // sub bar clicked -> also select corresponding big bar
          if(d3.select(this).classed("sub"))
            other = d3.selectAll(".bar").filter(function(d){ return d3.select(this)[0][0].__data__.attributeValue == attributeValue; });
          // big bar clicked -> also select corresponding sub bar
          else
            other = d3.selectAll(".sub").filter(function(d){ return d3.select(this)[0][0].__data__.attributeValue == attributeValue; });

          // set selection status
          if(d3.select(this).classed("selected")){
            d3.select(this).classed("selected", false);
            other.classed("selected", false);
          }else{
            d3.select(this).classed("selected", true);
            other.classed("selected", true);
          }
        }

        // collect selected filter values and "auslösen" filtering process
        function buttonClick(d){
          var chosenBars = d3.selectAll(".bar").filter(function(d){ return (d3.select(this).style("fill") == "rgb(202, 4, 32)"); });
          if(chosenBars[0].length == 0)
            alert("No bars chosen!");
          else{
            var filterValues = [];
            chosenBars[0].forEach(function(bar){
              value = bar.__data__.attributeValue;
              filterValues.push(value);
            });
            data.filterToCSV(filterValues);
          }
        }

        // update subdivisions if another subgroup was selected in filterbar
        $scope.$on("updateSubdivisions", function(event, args){
          chart.selectAll("rect.sub").remove();
          if(args.name != "all"){
            var distribution = data.calcDistribution(data.currentAttribute, args.subgroup);
            chart.selectAll(".sub")
                .data(distribution)
              .enter().append("rect")
                .attr("class", "sub")
                .attr("x", function(d){ return scaleX(d.attributeValue); })
                .attr("y", function(d){ return scaleY(+d.value); })
                .attr("width", scaleX.rangeBand())
                .attr("height", function(d){ return height - scaleY(+d.value); })
                .on("click", click);
          }else{
            chart.selectAll("rect.bar").classed('selected', false);
          }
        })

      })

    },
    controllerAs: 'barchartCtrl'
};
}]);
