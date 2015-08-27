angular.module('gui')
.directive('tree', ['data', function(data){
  return {
    restrict: 'E',
    template: '<svg class="tree"></svg>',
    controller: function($scope){
      $scope.$on("visDataLoaded", function(){

        // determine parameter
        var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 800 - margin.right - margin.left,
        height = 734 - margin.top - margin.bottom;

        var i = 0;
        var duration = 750; // determines the duration of opening a node when it is clicked

        // create d3 tree
        var tree = d3.layout.tree()
          .size([height, width]);

        var diagonal = d3.svg.diagonal()
          .projection(function(d) { return [d.y, d.x]; });

        // create svg that holds the tree layout
        var svg = d3.select(".tree")
          .attr("width", width + margin.right + margin.left)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // bind data to tree
        var root = data.visdata;
        // set position of root node (is hidden later on)
        root.x0 = height / 2;
        root.y0 = 0;

        function collapse(d) {
          if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
          }
        }

        // close all nodes
        root.children.forEach(collapse);
        root.children.forEach(function(d){ hidden = false; });
        // hide root node
        root.hidden = true;
        // render tree layout
        update(root);

        d3.select(self.frameElement).style("height", "500px");

        function update(source) {

          // get nodes and their connections
          var nodes = tree.nodes(root).filter(function(d){ return !d.hidden; }).reverse();
          var links = tree.links(nodes);

          // this determines the horizontal distance between nodes and their child nodes
          nodes.forEach(function(d) { d.y = d.depth * 200; });

          // bind data to the nodes
          var node = svg.selectAll("g.node")
              .data(nodes, function(d) { return d.id || (d.id = ++i); });

          // declare nodes as inner and leaf nodes for future differentiation when adding small multiples
          // transform them to the right position
          var nodeEnter = node.enter().append("g")
              .attr("class", function(n){
                if(n._children)
                  return "inner node";
                else {
                  return "leaf node";
                }
              })
              .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
              .on("click", click);

          // create the circles representing the nodes
          svg.selectAll("g.node")
            .append("circle")
              .attr("r", 1e-6)
              .style("fill", function(d){ return d._children ? "lightsteelblue" : "#fff"; });

          // append corresponding attribute names to circles
          svg.selectAll('g.node')
            .append("text")
              .attr("x", function(d) { return d.children || d._children ? -10 : 80; })
              .attr("dy", ".35em")
              .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
              .text(function(d) { return d.name; })
              .style("fill-opacity", 1e-6);


          // parameter for small multiples
          var chartWidth = 60;
          var chartHeight = 20;

          // append small multiples to leaf nodes depending on type and distribution of bound attribute
          var leafnodes = svg.selectAll('g.leaf.node');
          leafnodes[0].forEach(function(leafnode){
            var name = leafnode.__data__.name;
            var type = data.attributes[name].type;
            var distribution = data.attributes[name].distribution;
            // if node represents a numerical attribute append a graph displaying the distribution of this attribute
            if(type == "numerical"){

              // sort distribution
              distribution.sort(function(a,b){
                return a.attributeValue - b.attributeValue;
              });

              // create graph
              var scaleX = d3.scale.linear()
                .domain([0, d3.max(distribution, function(d){ return d.attributeValue; })])
                .range([0, chartWidth]);

              var scaleY = d3.scale.linear()
                .domain([0, d3.max(distribution, function(d){ return d.value; })])
                .range([chartHeight, 0]);

              var valueline = d3.svg.line()
                .x(function(d) { return scaleX(d.attributeValue); })
                .y(function(d) { return scaleY(d.value); })
                .interpolate('linear');

              // append graph to node representing the processed attribute
              leafnodes.filter(function(d){ return d.name == name }).append("svg") //TODO: kann ich irgendwie direkt an den leafnode appenden, ohne zu filtern?
                .attr("width", chartWidth)
                .attr("height", chartHeight)
                .attr("x", 10)
                .attr("y", -7)
                  .append("g")
                  .append("path")
                    .style("stroke-width", 1)
                    .attr("class", "line")
                    .attr("d", valueline(distribution));
            // if attribute is nominal or ordinal append a barchart
            }else{
              // create barchart
              var barWidth = chartWidth / distribution.length;

              var scaleX = d3.scale.ordinal()
                .domain(distribution.map(function (d){ return d.attributeValue; }))
                .rangeRoundBands([0, chartWidth], .1);

              var scaleY = d3.scale.linear()
                .domain([0, d3.max(distribution, function(d){ return +d.value; })])
                .range([chartHeight, 0]);

              // get corresponding node and initialize chart
              var chart = leafnodes.filter(function(d){ return d.name == name }).append("svg") //TODO: direktes Appenden an leafnode, siehe todo oben
                  .attr("width", chartWidth)
                  .attr("height", chartHeight)
                  .attr("x", 10)
                  .attr("y", -7)
                    .append("g");

              // append bars
              chart.selectAll(".smallMultipleBar")
                  .data(distribution)
                .enter().append("rect")
                  .attr("class", "smallMultipleBar")
                  .attr("x", function(d){ return scaleX(d.attributeValue); })
                  .attr("y", function(d){ return scaleY(+d.value); })
                  .attr("width", scaleX.rangeBand())
                  .attr("height", function(d){ return chartHeight - scaleY(+d.value); });
            }
          });

          // enhance corresponding link and circle when the mouse is moved over a node
          node.on("mouseover", function(d){
              link.style("stroke-width", function(l) {
                if(d == l.target)
                  return "4px";
                else
                  return "1.5px";
              })
              link.style("stroke", function(l){
                if(d == l.source || d == l.target)
                  return "#057D9F";
                else
                  return "#CCC";
              })
              if(d.depth == 2){
                d3.select(this).select('circle')
                  .attr("r", 8)
                  .style("stroke-width", "4px");
                d3.select(this).select('text')
                  .style("font-size", "14px");
              }
          })

          // reset link and circle styles when mouse is moved out of node
          node.on("mouseout", function(d){
              d3.select(this).select('circle')
                .attr("r", 5)
                .style("stroke-width", "1.5px");
              d3.select(this).select('text')
                .style("font-size", "10px");
              link.style("stroke-width", "1.5px");
              link.style("stroke", "#ccc");
          })

          // translate child nodes to their new position if parent node was opened
          var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

          nodeUpdate.select("circle")
              .attr("r", 4.5)
              .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

          nodeUpdate.select("text")
              .style("fill-opacity", 1);

          // transform child nodes back to the parent's position if parent node was closed
          var nodeExit = node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
              .remove();

          nodeExit.select("circle")
              .attr("r", 1e-6);

          nodeExit.select("text")
              .style("fill-opacity", 1e-6);

          // declare the links
          var link = svg.selectAll("path.link")
              .data(links, function(d) { return d.target.id; });

          // create new links for child nodes if a node was opened
          link.enter().insert("path", "g")
              .attr("class", "link")
              .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
              })

          // transition links from a parent node to its child nodes if parent node was opened
          link.transition()
              .duration(duration)
              .attr("d", diagonal);

          // transition links of child nodes back into the parent's position if parent node was closed
          link.exit().transition()
              .duration(duration)
              .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
              })
              .remove();

          // stash the old positions for transition.
          nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
          });
        }

        // toggle nodes on click
        function click(d) {
          // if leaf node was clicked, set the corresponding attribute and open detailed information
          if(d.depth == 2)
            data.setCurrentAttribute(d.name);
          // else adjust variables
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          // update tree layout
          update(d);
        }

      })
    },
    controllerAs: 'treeCtrl'
};
}]);
