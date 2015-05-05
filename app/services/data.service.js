angular.module('gui')
  .factory('data', function(){

    var dataService = function(data, json){
      this.dataset = data;
      this.jsondata = json;
      this.selectedAttribute = null;
    };

    dataService.getPossibleAttributeValues = function(){
      var attributeNames = d3.keys(this.dataset[0]);

      //this function removes duplicates from a javascript array, call with uniq(["hello", "hello", "goodbye"]), only works if all elements of the array have the same type
      function uniq(a) {
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
    }

    dataService.setCurrentAttribute = function(name){
      //this.selectedAttribute = new Attribute(name);
    }

    return dataService;
  });
