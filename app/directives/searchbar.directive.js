angular.module('gui')
.directive('searchbar', ['data', function(data){
  return {
    restrict: 'E', //directive can be invoked on the page via <searchbar></searchbar>
    template: '<div id="searchbar"></div>',
    controller: function($scope){
      $scope.attributeClicked = false;
      $scope.attributeName = "";
      /*this.attributeClicked = true;
      this.attributeName = "Attributname";*/

      function uniq_fast(a) {
      var seen = {};
      var out = [];
      var len = a.length;
      var j = 0;
      for(var i = 0; i < len; i++) {
           var item = a[i];
           if(seen[item] !== 1) {
                 seen[item] = 1;
                 out[j++] = item;
           }
      }
      return out;
      }

      console.log(uniq_fast(["hello", "hello", "goodbye"]));

      $scope.$on("dataLoaded", function(){

        var keys = d3.keys(data.dataset[0]);
        start();

        //Call back for when user selects an option
        function onSelect(d) {
            $scope.attributeClicked = true; //TODO: reset this when view is left
            $scope.attributeName = d;
            /*this.attributeClicked = true;
            this.attributeName = d;*/
            $scope.$apply(); //TODO: is it possible without scope.apply?

            console.log(data.jsondata.Mobility.type);

        }

        //Setup and render the autocomplete
        function start() {
            var mc = autocomplete(document.getElementById('searchbar'))
                    .keys(keys)
                    .placeHolder("Search Attributes")
                    //.width(960)
                    //.height(500)
                    .onSelected(onSelect)
                    .render();
        }

        function autocomplete(parent) {
          var _data=null,
              _delay= 0,
              _selection,
              _margin = {top: 30, right: 10, bottom: 50, left: 80},
              __width = 420,
              __height = 420,
              _placeHolder = "Search",
              _width,
              _height,
              _matches,
              _searchTerm,
              _lastSearchTerm,
              _currentIndex,
              _keys,
              _selectedFunction=defaultSelected;
              _minLength = 1,
              _labelField = "labelField";

          _selection=d3.select(parent);

          function component() {
              _selection.each(function (data) {

                  //create div for searchbar if it doesn't already exist
                  var container = d3.select(this).selectAll("#bp-ac").data([data]);
                  var enter = container.enter()
                          .append("div")
                          .attr("id","bp-ac")
                          .attr("class","bp-ac")

                  container.attr("width", __width)
                      .attr("height", __height);

                  //create input field (=searchbar)
                  var input = enter.append("input")
                              .attr("class", "form-control")
                              .attr("placeholder",_placeHolder)
                              .attr("type","text")
                              .on("keyup",onKeyUp);

                  //create dropdown
                  var dropDown=enter.append("div").attr("class","bp-autocomplete-dropdown");

                  var searching=dropDown.append("div").attr("class","bp-autocomplete-searching").text("Searching ...");

                  hideSearching();
                  hideDropDown();

                  function onKeyUp() {
                      _searchTerm=input.node().value;
                      var e=d3.event;

                      //no searchterm
                      if (!(e.which == 38 || e.which == 40 || e.which == 13)) {
                          if (!_searchTerm || _searchTerm == "") {
                              hideDropDown();
                          }
                          //search for matches and display them
                          else if (isNewSearchNeeded(_searchTerm,_lastSearchTerm)) {
                              _lastSearchTerm=_searchTerm;
                              _currentIndex=-1;
                              _results=[];
                              showSearching();
                              search();
                              processResults();
                              //no matching attributes found
                              if (_matches.length == 0) {
                                  showSearching("No results");
                              }
                              else {
                                  hideSearching();
                                  showDropDown();
                              }

                          }

                      }
                      else {
                          e.preventDefault();
                      }
                  }

                  function processResults() {

                      var results=dropDown.selectAll(".bp-autocomplete-row").data(_matches, function (d) {
                          return d;});
                      results.enter()
                          .append("div").attr("class","bp-autocomplete-row")
                          .on("click",function (d,i) { row_onClick(d); })
                          .append("div").attr("class","bp-autocomplete-title")
                          .html(function (d) {
                              var re = new RegExp(_searchTerm, 'i');
                              var strPart = d.match(re)[0];
                              return d.replace(re, "<span class='bp-autocomplete-highlight'>" + strPart + "</span>");
                          });

                      results.exit().remove();

                      //Update results
                      results.select(".bp-autocomplete-title")
                          .html(function (d,i) {
                              var re = new RegExp(_searchTerm, 'i');
                              var strPart = _matches[i].match(re);
                              if (strPart) {
                                  strPart = strPart[0];
                                  return _matches[i].replace(re, "<span class='bp-autocomplete-highlight'>" + strPart + "</span>");
                              }

                          });

                  }

                  //search for matches
                  function search() {

                      var str=_searchTerm;
                      console.log("searching on " + _searchTerm);
                      console.log("-------------------");

                      if (str.length >= _minLength) {
                          _matches = [];
                          for (var i = 0; i < _keys.length; i++) {
                              var match = false;
                              match = match || (_keys[i].toLowerCase().indexOf(str.toLowerCase()) >= 0);
                              if (match) {
                                  _matches.push(_keys[i]);
                              }
                          }
                      }
                  }

                  function row_onClick(d) {
                      hideDropDown();
                      input.node().value= d;
                      _selectedFunction(d);
                  }

                  function isNewSearchNeeded(newTerm, oldTerm) {
                      return newTerm.length >= _minLength && newTerm != oldTerm;
                  }

                  function hideSearching() {
                      searching.style("display","none");
                  }

                  function hideDropDown() {
                      dropDown.style("display","none");
                  }

                  function showSearching(value) {
                      searching.style("display","block");
                      searching.text(value);
                  }

                  function showDropDown() {
                      dropDown.style("display","block");
                  }

              });
          }


          function measure() {
              _width=__width - _margin.right - _margin.left;
              _height=__height - _margin.top - _margin.bottom;
          }

          function defaultSelected(d) {
              console.log(d + " selected");
          }


          component.render = function() {
              measure();
              component();
              return component;
          }

          component.keys = function (_) {
              if (!arguments.length) return _keys;
              _keys = _;
              return component;
          }

          component.labelField = function (_) {
              if (!arguments.length) return _labelField;
              _labelField = _;
              return component;
          }

          component.margin = function(_) {
              if (!arguments.length) return _margin;
              _margin = _;
              measure();
              return component;
          };

          component.width = function(_) {
              if (!arguments.length) return __width;
              __width = _;
              measure();
              return component;
          };

          component.height = function(_) {
              if (!arguments.length) return __height;
              __height = _;
              measure();
              return component;
          };

          component.delay = function(_) {
              if (!arguments.length) return _delay;
              _delay = _;
              return component;
          };

          component.keys = function(_) {
              if (!arguments.length) return _keys;
              _keys = _;
              return component;
          };

          component.placeHolder = function(_) {
              if (!arguments.length) return _placeHolder;
              _placeHolder = _;
              return component;
          };

          component.onSelected = function(_) {
              if (!arguments.length) return _selectedFunction;
              _selectedFunction = _;
              return component;
          };

          return component;
        }

      });
    },
    controllerAs: 'searchbarCtrl'
};
}]);

/*
 Copyright (c) 2014 BrightPoint Consulting, Inc.

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */
