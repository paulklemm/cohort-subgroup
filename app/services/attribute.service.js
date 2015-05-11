angular.module('gui')
  .factory('attribute', ['data', function(data){

    var Attribute = function(name){
      this.name = name;
      this.type = data.jsondata[this.name].type;
      this.values = this.setPossibleAttributeValues();
      this.distribution = this.setDistribution(); // von der Form [{attributeValue: "SHIP2", value: 300}, {attributeValue: "TREND0", value: 400}]
    }

    Attribute.setPossibleAttributeValues = function(){
      // so far for ordinal attributes only
      if(data.jsondata[this.name].type == "nominal" || data.jsondata[this.name].type == "ordinal" || data.jsondata[this.name].type == "dichotomous"){
        values = [];
        // collect attribute values of every proband for this specific attribute, contains possible duplicates
        for(var i = 0; i < data.dataset.length; i++){
          values[i] = data.dataset[i][this.name];
        }

        possibleValues = uniq_fast(values); //without duplicates

        return possibleValues;
      }else
        return null;
    }

    Attribute.setDistribution = function(){
      var result = [];

      if(this.values != null){
        // for each attribute value filter probands and count results
        for(var i = 0; i < this.values.length; i++){
          var obj = {};
          var selection = data.dataset.filter( function(d){
            if (d[this.name] == this.values[i]){
              return d;
            }
          });
          obj["attributeValue"] = this.values[i];
          obj["value"] = selection.length
          result.push(obj);
        }
      }
      return result;
    }

    // this private function removes duplicates from a javascript array, only works if all elements of the array have the same type
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

    return Attribute;
  }]);
