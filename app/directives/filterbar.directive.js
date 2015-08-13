angular.module('gui')
.directive('filterbar', ['data', '$rootScope', function(data, $rootScope){
  return {
    restrict: 'E',
    template: '<div id="filterbar"></div>',
    controller: function($scope){

      var width = 0.9*parseInt(d3.select('#filterbar').style('width'));
      var height = 80;
      var elementWidth = Math.floor((width-175)/10);
      var elementHeightSmall = 10;
      var margin = 15;

      var bar = d3.select("#filterbar")
          .append("div")
            .attr("class", "row")
            .style("margin", 0);
      filtbar = bar.append("div")
          .attr("class", "col-md-11");
      var save = bar.append("div")
          .attr("class", "col-md-1");
      var filterbar  = filtbar.append("svg")
          .attr("width", width)
          .attr("height", height);

      // add save button
      save.append("button")
        .attr("class", "btn btn-default")
        .attr("type", "button")
        .style("margin-top", "10px")
        .style("margin-right", "-10px")
        .on("click", save)
        .append("span")
          .attr("class", "glyphicon glyphicon-floppy-disk")
          .style("font-size", "20px");

      // build initial subgroup matrix
      $scope.$on('update', function(){
        var dataset = data.subgroups;

        // 3) TODO: adjust tooltips

        var tip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([-15, 0])
                    .html(function(d){
                      var elementText = "";
                      if(d != null && d.filterValues){
                        for(i=0; i < d.filterValues.length-1; i++){
                          elementText += d.filterValues[i] + ", ";
                        }
                        elementText += d.filterValues[d.filterValues.length-1];
                      }
                      if(elementText != "")
                        return d.attribute + ": " + elementText;
                      else
                        return d.attribute;
                    });

        filterbar.call(tip);

        var enter = filterbar.selectAll("rect")
          .data(dataset)
          .enter();

        var entered = enter.append("rect")
            .attr("class", "filterelement")
            .attr("x", function(d,i,j) { return 10 + d.column*(elementWidth+margin); })
            .attr("y", function(d,i,j) { return 10 + d.row*(35); })
            .attr("width", elementWidth)
            .attr("height", 30)
            .on("click", click)
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);

        var enteredElement = null;
        entered[0].forEach(function(element){
            if(element != null)
              enteredElement = element;
        });

        // set last filtered element selected
        setActive(d3.select(enteredElement));

        filterbar.selectAll("text")
          .data(dataset)
          .enter()
          .append("text")
            .attr("y", function(d,i,j) { return 10 + d.row*(35); })
            .style("pointer-events", "none")
            .append("tspan")
              .attr("x", function(d,i,j) { return 15 + d.column*(elementWidth+margin); })
              .attr("dy", "1.2em")
              .text(function(d,i,j){ return d.attribute + ":"; })
            .append("tspan")
              .attr("x", function(d,i,j) { return 15 + d.column*(elementWidth+margin); })
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

          //add lines
          filterbar.selectAll("line")
            .data(dataset)
            .enter()
            .append("line")
              .attr("x1", 0)
              .attr("y1", 5)
              .attr("x2", 150)
              .attr("y2", 5)
              .attr("stroke-width", 1)
              .attr("stroke", "grey");

          // shrinking
          update(enteredElement);
      })

      function update(element){
        var elementdata = element.__data__;
        // get elements on filter path
        var path = [];
        path.push(elementdata);
        var idx = elementdata.pred;
        while(idx > -1){
          path.push(data.subgroups[idx]);
          idx = data.subgroups[idx].pred;
        }
        // sort path elements by column (ascending)
        path.sort(function(a,b){
          return a.column - b.column;
        });
        path[0]["height"] = height-margin;

        var row = elementdata.row;
        var column = elementdata.column;
        var selection = filterbar.selectAll("rect").data(data.subgroups);
        selection
          // adjust height by means of path
          .attr("height", function(d){
            if(path.indexOf(d) != -1 && d.column == 0) // element is first element on path
              return height-margin;
            else if(path.indexOf(d) != -1 && d.column != 0){ // element is on path
              // get height of big element in column before
              var elementHeightBefore = path[d.column-1].height;
              // get number of successors of parent element (inclusive this big element) -> these elements share the height of the element before
              var num = path[d.column-1].succ.length;
              var h = elementHeightBefore-(num-1)*(elementHeightSmall+5);
              // save height in path array
              path[d.column]["height"] = h;
              return h;
            }
            else
              return elementHeightSmall;
          })
          // adjust y-position
          .attr("y", function(d){
            var y = computeYPosition(path, d);
            return y;
          });

          //update text
          var text = filterbar.selectAll("text").data(data.subgroups);
          text
            .style("display", function(d){
              if(path.indexOf(d) != -1) // element is on path
                return "inline";
              else
                return "none";
            })
            .attr("y", function(d){
                return 10+d.row*(elementHeightSmall+5);
            });

          //draw lines to visualize connections
          var lines = filterbar.selectAll("line").data(data.subgroups);
          lines
            .attr("x1", function(d){
              return 10 + d.column*(elementWidth+margin)-margin;
            })
            .attr("y1", function(d){
              if(d.pred != -1){
                var pred = data.subgroups[d.pred];
                var predHeight = computeHeight(path, pred);
                // compute y-position
                var predY = computeYPosition(path, pred);
                return predY + predHeight/2;
              }
              else{
                return 0;
              }
            })
            .attr("x2", function(d){
              return 10 + d.column*(elementWidth+margin);
            })
            .attr("y2", function(d){
              var thisHeight = computeHeight(path, d);
              // compute y-position
              var thisY = computeYPosition(path, d);
              return thisY + thisHeight/2;
            })
            .attr("stroke-width", 1)
            .attr("stroke", "#D3D3D3")
            //do not display line for first element
            .attr("display", function(d){
              if(d.pred == -1){
                return "none";
              }
              else{
                return "inline";
              }
            });
      }

      function click(d) {
        var element = d3.select(this);
        // if element is small update filterbar
        if(element[0][0].height.baseVal.value == elementHeightSmall)
          update(element[0][0]);
        // set clicked filter element selected
        setActive(element);
        // update progress bar
        $rootScope.$broadcast('updateProgress', {progress: element[0][0].__data__.percentage});
        // update barchart subdivisions
        $rootScope.$broadcast('updateSubdivisions', {name: element[0][0].__data__.attribute, subgroup: element[0][0].__data__.data});
      }

      function save(){
        data.saveSubgroup();
      }

      function setActive(element){
        // select element in filterbar, only one selected element at a time
        d3.select('.filterelement.selected').classed('selected', false);
        element.classed('selected', true);
        // set current selected subgroup
        data.selectedSub = element[0][0].__data__;
      }

      function computeYPosition(path, d){
        var bigRow = -1;
        if(path.length-1 >= d.column)
          bigRow = path[d.column].row;
        if(bigRow < d.row && bigRow >= 0){
          var bigHeight = path[d.column].height;
          return 10+bigHeight+5+(d.row-1)*(elementHeightSmall+5);
        }
        else
          return 10+d.row*(elementHeightSmall+5);
      }

      function computeHeight(path, d){
        // if element is on path -> look up height there
        if(path.indexOf(d) != -1)
          return path[d.column].height;
        // else -> elementHeightSmall
        else
          return elementHeightSmall;
      }
    },
    controllerAs: 'filterbarCtrl'
};
}]);
