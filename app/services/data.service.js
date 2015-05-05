angular.module('gui')
  .factory('data', /*['attribute', */function(){

    var dataService = function(data, json){
      this.dataset = data;
      this.jsondata = json;
      this.selectedAttribute = null;
    };

    dataService.setCurrentAttribute = function(name){
      //this.selectedAttribute = new Attribute(name);
    }

    return dataService;
  }/*]*/);
