angular.module('gui')
  .factory('data', ['$rootScope', function($rootScope){

    var dataService = function(data, json, vis){
      this.dataset = data;
      this.jsondata = json;
      this.visdata = vis;
      this.visdatas = {};
      this.subgroups = [];
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
      var elementIndex = this.subgroups.length;
      var currAtt = this.currentAttribute;
      var subgroup = this.dataset.filter(function(proband){
        var value = proband[currAtt];
        for(i=0; i < filterValues.length; i++){
          if(value == filterValues[i]){
            return true;
          }
        }
        return false;
      });
      this.subgroups.push(subgroup);

      var csvString = this.getCSVString(subgroup);
      //console.log(csvString);
      $rootScope.$broadcast('filtered', {index: elementIndex, attribute: currAtt, values: filterValues});
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
      var keys = d3.keys(this.dataset[0]);
      var csv = "\"" + keys.join("\",\"") + "\"\n";

      subgroup.forEach(function(proband){
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
      });
      return csv;
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
