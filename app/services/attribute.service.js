angular.module('gui')
  .factory('Attribute', ['data', function(data){

    var Attribute = function(name){
      this.name = name;
      /*this.type = data.jsondata.<name>.type;*/
      /*this.values = get possible values from self-created file*/
      /*this.distribution = [(key, value), (key, value)] with key = possible attribute value and value = number people, get this from data.dataset*/
    };

    return Attribute;
  }]);
