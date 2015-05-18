angular.module('gui')
  .factory('data', ['attribute', function(attribute){

    var dataService = function(data, json){
      this.dataset = data;
      this.jsondata = json;
      this.currentAttribute = null;
    };

    dataService.setCurrentAttribute = function(name){
      this.currentAttribute = new attribute(name, this.dataset, this.jsondata);
    }

    return dataService;
  }]);
