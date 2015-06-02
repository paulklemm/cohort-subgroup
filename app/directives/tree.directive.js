angular.module('gui')
.directive('tree', ['data', function(data){
  return {
    restrict: 'E',
    template: '<svg class="tree"></svg>',
    controller: function($scope){
      $scope.$on("visDataLoaded", function(){

        // enhance links when hovering over node: http://stackoverflow.com/questions/19111581/d3js-force-directed-on-hover-to-node-highlight-colourup-linked-nodes-and-link
        // hide unrelated parent nodes: http://stackoverflow.com/questions/29873947/hide-unrelated-parent-nodes-but-child-node-in-d3-js
        // small multiples: http://bl.ocks.org/mbostock/1157787
        // TODO: add small multiples through graph directive with parameter small multiple yes/no
        // TODO: adjust size and positioning of small multiples

        var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 800 - margin.right - margin.left,
        height = 500 - margin.top - margin.bottom;

        var i = 0;
        var duration = 750;

        var tree = d3.layout.tree()
          .size([height, width]);

        var diagonal = d3.svg.diagonal()
          .projection(function(d) { return [d.y, d.x]; });

        var svg = d3.select(".tree")
          .attr("width", width + margin.right + margin.left)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var root = data.visdata;
        root.x0 = height / 2;
        root.y0 = 0;

        function collapse(d) {
          if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
          }
        }

        /*function collapseAll(d){
          if (d.children) {
            d._children = d.children;
            d._children.forEach(collapseAll);
            d.children = null;
          }
          else if(d._children) {
            d._children.forEach(collapseAll);
          }
        }*/

        root.children.forEach(collapse);
        root.children.forEach(function(d){ hidden = false; });
        //collapseAll(root);
        root.hidden = true;
        update(root);

        d3.select(self.frameElement).style("height", "500px");

        function update(source) {

          // Compute the new tree layout.
          var nodes = tree.nodes(root).filter(function(d){ return !d.hidden; }).reverse();
          var links = tree.links(nodes);

          // Normalize for fixed-depth.
          nodes.forEach(function(d) { d.y = d.depth * 200; });

          // Declare the nodes...
          var node = svg.selectAll("g.node")
              .data(nodes, function(d) { return d.id || (d.id = ++i); });

          // Enter any new nodes at the parent's previous position.
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

          svg.selectAll("g.node")
            .append("circle")
              .attr("r", 1e-6)
              //.attr("r", 10)
              .style("fill", function(d){ return d._children ? "lightsteelblue" : "#fff"; });

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

          // append small multiple dependent on type and distribution of attribute of node
          var leafnodes = svg.selectAll('g.leaf.node');
          leafnodes[0].forEach(function(leafnode){
            var name = leafnode.__data__.name;
            var type = data.attributes[name].type;
            var distribution = data.attributes[name].distribution;
            if(type == "numerical"){

              distribution.sort(function(a,b){
                return a.attributeValue - b.attributeValue;
              });

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

              leafnodes.filter(function(d){ return d.name == name }).append("svg") //TODO: kann ich irgendwie direkt an den leafnode appenden, ohne zu filtern?
                .attr("width", chartWidth)
                .attr("height", chartHeight)
                .attr("x", 10)
                .attr("y", -7)
                  .append("g")
                  .append("path")
                    .attr("class", "line")
                    .attr("d", valueline(distribution));
            }else{
              var barWidth = chartWidth / distribution.length;

              var scaleX = d3.scale.ordinal()
                .domain(distribution.map(function (d){ return d.attributeValue; }))
                .rangeRoundBands([0, chartWidth], .1);

              var scaleY = d3.scale.linear()
                .domain([0, d3.max(distribution, function(d){ return +d.value; })])
                .range([chartHeight, 0]);

              var chart = leafnodes.filter(function(d){ return d.name == name }).append("svg") //TODO: direktes Appenden an leafnode, siehe todo oben
                  .attr("width", chartWidth)
                  .attr("height", chartHeight)
                  .attr("x", 10)
                  .attr("y", -7)
                    .append("g");

              chart.selectAll(".bar")
                  .data(distribution)
                .enter().append("rect")
                  .attr("class", "bar")
                  .attr("x", function(d){ return scaleX(d.attributeValue); })
                  .attr("y", function(d){ return scaleY(+d.value); })
                  .attr("width", scaleX.rangeBand())
                  .attr("height", function(d){ return chartHeight - scaleY(+d.value); });
            }
          });


          node.on("mouseover", function(d){
              link.style("stroke-width", function(l) {
                if(d == l.target)
                  return "4px";
                else
                  return "1.5px";
              })
              link.style("stroke", function(l){
                if(d == l.source || d == l.target)
                  return "#31B404";
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

          node.on("mouseout", function(d){
              d3.select(this).select('circle')
                .attr("r", 5)
                .style("stroke-width", "1.5px");
              d3.select(this).select('text')
                .style("font-size", "10px");
              link.style("stroke-width", "1.5px");
              link.style("stroke", "#ccc");
          })

          // Transition nodes to their new position.
          var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

          nodeUpdate.select("circle")
              .attr("r", 4.5)
              .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

          nodeUpdate.select("text")
              .style("fill-opacity", 1);

          // Transition exiting nodes to the parent's new position.
          var nodeExit = node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
              .remove();

          nodeExit.select("circle")
              .attr("r", 1e-6);

          nodeExit.select("text")
              .style("fill-opacity", 1e-6);

          // Declare the links…
          var link = svg.selectAll("path.link")
              .data(links, function(d) { return d.target.id; });

          // Enter any new links at the parent's previous position.
          link.enter().insert("path", "g")
              .attr("class", "link")
              .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
              })

          // Transition links to their new position.
          link.transition()
              .duration(duration)
              .attr("d", diagonal);

          // Transition exiting nodes to the parent's new position.
          link.exit().transition()
              .duration(duration)
              .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
              })
              .remove();

          // Stash the old positions for transition.
          nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
          });
        }

        // Toggle children on click.
        function click(d) {
          if(d.depth == 2)
            data.setCurrentAttribute(d.name);
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          update(d);
        }

      })
    },
    controllerAs: 'treeCtrl'
};
}]);
