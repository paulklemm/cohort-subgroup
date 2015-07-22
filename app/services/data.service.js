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

    dataService.filterToCSV = function(attribute, filterValues){
      // TODO: prevent from filtering by attribute that was used for filtering !on this path! before
      var alreadyUsed = this.alreadyUsed(this.currentAttribute);
      if(!alreadyUsed){
        // create object for new subgroup
        var subgroup = {};
        subgroup["row"] = this.selectedSub.row;
        subgroup["column"] = this.selectedSub.column+1;
        var currAtt = this.currentAttribute;
        subgroup["attribute"] = currAtt;
        // TODO: evtl. Nachfolger für jede Subgruppe speichern durch Listen-Position des jeweiligen Objekts
        subgroup.pred = this.getIndex(this.selectedSub.attribute);
        subgroup["filterValues"] = filterValues;
        // filter selected subgroup
        subgroup["data"] = this.selectedSub.data.filter(function(proband){
          var value = proband[currAtt];
          for(i=0; i < filterValues.length; i++){
            if(value == filterValues[i]){
              return true;
            }
          }
          return false;
        });
        // if selected element was not the end of the row: start new row
        rightNeigh = this.findNeigh(subgroup.row, subgroup.column);
        if(rightNeigh){
          subgroup.row += 1;
          var downNeigh = this.findDown(subgroup.row, subgroup.column);
          while(downNeigh){
            subgroup.row += 1;
            downNeigh = this.findDown(subgroup.row, subgroup.column);
          }
        }

        this.subgroups.push(subgroup);
        // how many probands remain?
        var percentage = subgroup.data.length/this.dataset.length;

        // set filtered subgroup as selected subgroup
        this.selectedSub = subgroup;

        $rootScope.$broadcast('update', {subgroup: subgroup, progress: percentage});
      }
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

    dataService.saveSubgroup = function(){
      // get selected subgroup
      var subgroup = this.getSelectedSub();

      // get csv string from subgroup
      var csvArray = this.getCSVString(subgroup.data);

      // save csv file
      var csvString = encodeURI(csvArray);
        // remove commas from the beginning of each proband that come through encodeURI
      csvString = csvString.split('%0A,').join('%0A');
      var a = document.createElement('a');
      a.href = 'data:attachment/csv,' + csvString;
      a.target = '_blank';
      a.download = 'subgroup.csv';
      document.body.appendChild(a);
      a.click();
    }

    //get index of certain attribute in subgroup list
    dataService.getIndex = function(attribute){
      return this.subgroups.map(function(e){ return e.attribute; }).indexOf(attribute);
    }

    dataService.alreadyUsed = function(attribute){
      var res = false;
      var e = this.selectedSub;
      this.subgroups.forEach(function(subgroup){
        if(subgroup != null && subgroup.attribute == attribute){
          res = true;
        }
      });
      // already used on path?
      /*while(this.subgroups[e.pred].data != null){
        if(e.attribute == attribute)
          res = true;
        e = this.subgroups[e.pred];
      }*/
      return res;
    }

    dataService.findNeigh = function(row, column){
      var res = false;
      var sameRow = this.subgroups.filter(function(subgroup){
        return subgroup.row == row;
      });
      sameRow.forEach(function(subgroup){
        if(subgroup.column == column)
          res = true;
      });
      return res;
    }

    dataService.findDown = function(row, column){
      var res = false;
      var sameCol = this.subgroups.filter(function(subgroup){
        return subgroup.column == column;
      });
      sameCol.forEach(function(subgroup){
        if(subgroup.row == row)
          res = true;
      });
      return res;
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
