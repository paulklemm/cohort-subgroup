angular.module('gui')
.directive('filterbar', ['data', function(data){
  return {
    restrict: 'E',
    template: '<div id="filterbar"></div>',
    controller: function($scope){

      var width = 0.9*parseInt(d3.select('#filterbar').style('width'));
      var height = 80;
      var elementWidth = Math.floor((width-175)/10);
      var elementHeight = 30;
      var elementHeightSmall = 10;
      var margin = 15;

      var bar = d3.select("#filterbar");
      var filterbar  = bar.append("svg")
          .attr("width", width)
          .attr("height", height);

      // add save button
      bar.append("button")
        .attr("class", "btn btn-default")
        .attr("type", "button")
        .style("width", 0.1*width)
        //.style("float", "right")
        //.style("margin-right", "10px")
        .on("click", save)
        .append("text")
          .text("Save");
      // update subgroup matrix
      $scope.$on('update', function(event, arg){
        var dataset = data.subgroups;

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

          var row = elementdata.row;
          var column = elementdata.column;
          var selection = filterbar.selectAll("rect").data(dataset);
          selection
            // adjust height by means of path
            .attr("height", function(d){
              //how many small elements are in this column?
              var subgroupsColumn = data.subgroups.filter(function(subgroup){
                if(subgroup.column == d.column)
                  return true;
                return false;
              });
              if(path.indexOf(d) != -1) //element is on path
                return height-margin-(subgroupsColumn.length-1)*(elementHeightSmall+5);
              else
                return elementHeightSmall;
            })
            // adjust y-position
            .attr("y", function(d){
              var bigRow = -1;
              if(path.length-1 >= d.column)
                bigRow = path[d.column].row;
              //how many small elements are in this column?
              var subgroupsColumn = data.subgroups.filter(function(subgroup){
                if(subgroup.column == d.column)
                  return true;
                return false;
              });
              var bigHeight = height-margin-(subgroupsColumn.length-1)*(elementHeightSmall+5);
              if(bigRow < d.row && bigRow >= 0)
                return 10+bigHeight+5+(d.row-1)*(elementHeightSmall+5);
              else
                return 10+d.row*(elementHeightSmall+5);
            });

            var text = filterbar.selectAll("text").data(dataset);
            text
              .style("display", function(d){
                if(path.indexOf(d) != -1) //element is on path
                  return "inline";
                else
                  return "none";
              })
              .attr("y", function(d){
                  return 10+d.row*(elementHeightSmall+5);
              });
        }

        // 2) TODO: make text in filterelement clickable
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
            .attr("y", function(d,i,j) { return 10 + d.row*(elementHeight+5); })
            .attr("width", elementWidth)
            .attr("height", elementHeight)
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
            .attr("y", function(d,i,j) { return 10 + d.row*(elementHeight+5); })
            .on("click", textClick)
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

          // shrinking
          update(enteredElement);
      })

      function click(d) {
        var element = d3.select(this);
        // set clicked filter element selected
        setActive(element);
      }

      function textClick(d) {
        //console.log(d);
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
    },
    controllerAs: 'filterbarCtrl'
};
}]);
