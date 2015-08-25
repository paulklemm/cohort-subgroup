angular.module('gui')
  .factory('data', ['$rootScope', function($rootScope){

    // empty constructor, initial variables are set in app.js
    var dataService = function(){

    };

    // set the currently selected attribute (for context information)
    dataService.setCurrentAttribute = function(name){
      this.currentAttribute = name;
      $rootScope.$broadcast("attributeSet");
    }

    // set the list of attributes with distribution and type for each attribute
    dataService.setAttributes = function(){
      res = {};
      var keys = d3.keys(this.dataset[0]);
      self = this;
      keys.forEach(function(key){
        // object for one attribute
        tmp = {};
        tmp["distribution"] = self.calcDistribution(key, self.dataset);
        tmp["type"] = self.jsondata[key].type;
        // add this attribute to list
        res[key] = tmp;
      });
      return res;
    }

    // compose string from subgroup data for saving subgroup as csv
    dataService.getCSVString = function(subgroup){
      // complete string
      var csvArray = [];
      // first row contains attribute names
      var keys = d3.keys(this.dataset[0]);
      csvArray.push("\"" + keys.join("\",\"") + "\"\n");

      // build one row with data for each proband
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

    //get index of subgroup that was created using given attribute in list of subgroups (used for position of predecessor in list)
    dataService.getIndex = function(attribute){
      return this.subgroups.map(function(e){ return e.attribute; }).indexOf(attribute);
    }

    // compute distribution of given attribute based on a given dataset
    dataService.calcDistribution = function(key, dataset){
      // type of given attribute
      var type = this.jsondata[key].type;
      // compute possible attribute values
      values = [];
      // collect attribute values of every proband for given attribute, contains possible duplicates
      for(var i = 0; i < dataset.length; i++){
        // if attribute is ordinal, then possible values are strings, e.g. "SHIP2"
        if(type == "nominal" || type == "ordinal" || type == "dichotomous"){
          values[i] = dataset[i][key];
        // if attribute is continuous then possible attribute values are numbers instead of strings, e.g. 68.5 kg (and values are rounded)
        }else{
          //values[i] = +data.dataset[i][this.name]; // without rounding
          values[i] = d3.round(+dataset[i][key]); // converted to integer and with rounding
        }
      }
      // remove duplicates
      possibleValues = this.uniq_fast(values);
      // compute distribution from possible values
      var result = [];
        if(possibleValues != null){
          // for each attribute value: filter probands and count results
          for(var i = 0; i < possibleValues.length; i++){
            var obj = {};
            var selection = dataset.filter( function(d){
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

    // filter the selected subgroup according to given criteria
    dataService.filterToCSV = function(filterValues){
      var alreadyUsed = this.alreadyUsed(this.currentAttribute);
      if(alreadyUsed)
        alert("This attribute was already used for filtering in the current process!")
      else{
        var currAtt = this.currentAttribute;
        // create object for new subgroup
        var subgroup = {};
        subgroup["row"] = this.selectedSub.row;
        subgroup["column"] = this.selectedSub.column+1;
        subgroup["attribute"] = currAtt;
        subgroup["pred"] = this.getIndex(this.selectedSub.attribute);
        subgroup["succ"] = [];
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

        // how many probands remain?
        subgroup["percentage"] = subgroup.data.length/this.dataset.length;
        // add to list of created subgroups
        this.subgroups.push(subgroup);
        // set this subgroup as successor of selected subgroup
        this.selectedSub.succ.push(this.getIndex(subgroup.attribute));
        // set filtered subgroup as selected subgroup
        this.selectedSub = subgroup;

        // update filter element matrix, progressbar and subdivided barcharts
        $rootScope.$broadcast('update');
        $rootScope.$broadcast('updateProgress', {progress: subgroup.percentage});
        $rootScope.$broadcast('updateSubdivisions', {subgroup: subgroup.data});
      }
    }

    // export of subgroup as csv via save file dialog
    dataService.saveSubgroup = function(){
      // get selected subgroup
      var subgroup = this.getSelectedSub();

      // get csv string for subgroup
      var csvArray = this.getCSVString(subgroup.data);

      // encode string
      var csvString = encodeURI(csvArray);
      // remove commas from the beginning of each proband that come through encodeURI
      csvString = csvString.split('%0A,').join('%0A');

      // simulate save file dialog
      var a = document.createElement('a');
      a.href = 'data:attachment/csv,' + csvString;
      a.target = '_blank';
      // set filename
      a.download = 'subgroup.csv';
      document.body.appendChild(a);
      // trigger click -> opens dialog
      a.click();
    }

    // determine if attribute has already been used in the current filter process
    dataService.alreadyUsed = function(attribute){
      var res = false;
      var e = this.selectedSub;
      // already used on path?
      while(e.pred != -1){
        if(e.attribute == attribute){
          res = true;
        }
        e = this.subgroups[e.pred];
      }
      return res;
    }

    // does a filter element already exist to the right of the filtered subgroup?
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

    // does an element already exist below?
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

    // remove duplicates from an array ([1 2 2 4 3 7 7 5] -> [1 2 4 3 7 5])
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
