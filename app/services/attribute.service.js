angular.module('gui')
  .factory('attribute', ['data', function(data){

    var Attribute = function(name){
      this.name = name;
      this.type = data.jsondata[this.name].type;
      this.values = Attribute.setPossibleAttributeValues();
      /*this.distribution = [(key, value), (key, value)] with key = possible attribute value and value = number people, get this from data.dataset*/
    }

    Attribute.setPossibleAttributeValues = function(){
      //mögliche Attributausprägungen erstmal nur für kategorische Attribute
      if(data.jsondata[this.name].type == "nominal" || data.jsondata[this.name].type == "ordinal" || data.jsondata[this.name].type == "dichotomous"){
        values = [];
        //collect attribute values of every proband for this specific attribute, contains possible duplicates
        for(var i = 0; i < data.dataset.length; i++){
          values[i] = data.dataset[i][this.name];
        }

        possibleValues = uniq_fast(values); //without duplicates

        return possibleValues;
      }else
        return null;
    }

    Attribute.setDistribution = function(){
      if(this.values != null){
        //TODO: for each attribute value filter probands and count results
        for(var i = 0; i < this.values.length; i++){

        }
      }
      /*return*/
    }

    //this private function removes duplicates from a javascript array, call with uniq(["hello", "hello", "goodbye"]), only works if all elements of the array have the same type
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
