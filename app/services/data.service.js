angular.module('gui')
  .factory('data', ['$rootScope', function($rootScope){

    var dataService = function(){

    };

    dataService.setCurrentAttribute = function(name){
      this.currentAttribute = name;
      $rootScope.$broadcast("attributeSet");
    }

    dataService.setAttributes = function(){
      res = {};
      var keys = d3.keys(this.dataset[0]);
      self = this;
      keys.forEach(function(key){
        tmp = {};
        tmp["distribution"] = self.calcDistribution(key);
        tmp["type"] = self.jsondata[key].type;
        res[key] = tmp;
      });
      return res;
    }

    dataService.filterToCSV = function(filterValues){
      //TODO: prevent from filtering by attribute if this attribute was already used for filtering
      var subgroup = {};
      subgroup["row"] = this.currentSubgroup.row;
      subgroup["column"] = this.subgroups[this.currentSubgroup.row].length;
      subgroup["selected"] = true;
      var currAtt = this.currentAttribute;
      subgroup["attribute"] = currAtt;
      subgroup["filterValues"] = filterValues;
      // concatenating filter (selected subgroup gets filtered, first subgroup is initially the whole proband set)
      subgroup["data"] = this.subgroups[subgroup.row][subgroup.column-1].data.filter(function(proband){
        var value = proband[currAtt];
        for(i=0; i < filterValues.length; i++){
          if(value == filterValues[i]){
            return true;
          }
        }
        return false;
      });
      this.subgroups[subgroup.row].push(subgroup);

      this.subgroups.push([{row: 1, column: 0}, {row: 1, column: 1}]);

      console.log(this.subgroups);

      /*var arr = [];
      arr[3] = 5;
      console.log(arr);*/

      this.currentSubgroup = subgroup;

      // how many probands remain?
      var percentage = subgroup.data.length/this.dataset.length;

      $rootScope.$broadcast('filtered', {subgroup: subgroup, progress: percentage});

      var csvArray = this.getCSVString(subgroup.data);

      // open/save csv file
      var csvString = encodeURI(csvArray);
      // remove commas from the beginning of each proband that come through encodeURI
      csvString = csvString.split('%0A,').join('%0A');
      var a = document.createElement('a');
      a.href = 'data:attachment/csv,' + csvString;
      a.target = '_blank';
      a.download = 'subgroup.csv';
      document.body.appendChild(a);
      //a.click();
    }

    dataService.calcDistribution = function(key){
      // compute possible attribute values
      var type = this.jsondata[key].type;
      values = [];
      // collect attribute values of every proband for this specific attribute, contains possible duplicates
      for(var i = 0; i < this.dataset.length; i++){
        // if attribute is ordinal, then possible values are strings, e.g. "SHIP2"
        if(type == "nominal" || type == "ordinal" || type == "dichotomous"){
          values[i] = this.dataset[i][key];
        // if attribute is continuous then possible attribute values are numbers instead of strings, e.g. 68.5 kg (and values are rounded)
        }else{
          //values[i] = +data.dataset[i][this.name]; // without rounding
          values[i] = d3.round(+this.dataset[i][key]); // with rounding
        }
      }
      possibleValues = this.uniq_fast(values); //without duplicates

      // compute distribution from possible values
      var result = [];
        if(possibleValues != null){
          // for each attribute value filter probands and count results
          for(var i = 0; i < possibleValues.length; i++){
            var obj = {};
            var self = this;
            var selection = this.dataset.filter( function(d){
              if(type == "nominal" || type == "ordinal" || type == "dichotomous"){
                if (d[key] == possibleValues[i]){
                  return d;
                }
              }else{
                if(d3.round(+d[key]) == possibleValues[i]){ // with rounding
                  return d;
                }
              }
            });
            obj["attributeValue"] = possibleValues[i];
            obj["value"] = selection.length;
            result.push(obj);
          }
        }
      return result;
    }

    dataService.getCSVString = function(subgroup){
      var csvArray = [];
      var keys = d3.keys(this.dataset[0]);
      csvArray.push("\"" + keys.join("\",\"") + "\"\n");

      subgroup.forEach(function(proband){
        var csv = "";
        var attributeValue;
        for(i=0; i < keys.length-1; i++){
          if(!isNaN(Number(proband[keys[i]]))){
            attributeValue = Number(proband[keys[i]]);
          }else{
            attributeValue = "\"" + proband[keys[i]] + "\"";
          }
          csv += attributeValue + ",";
        }
        // not necessary cause last attribute value of a proband is always a string
        if(!isNaN(Number(proband[keys[keys.length-1]]))){
          attributeValue = Number(proband[keys[keys.length-1]]);
        }
        attributeValue = "\"" + proband[keys[keys.length-1]] + "\"";
        csv += attributeValue + "\n";
        csvArray.push(csv);
      });
      return csvArray;
    }

    dataService.uniq_fast = function(a) {
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

    return dataService;
  }]);
