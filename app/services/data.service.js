angular.module('gui')
  .factory('data', /*['attribute', */function(){

    var dataService = function(data, json){
      this.dataset = data;
      this.jsondata = json;
      //this.selectedAttribute = null;
    };

    dataService.setCurrentAttribute = function(name){
      //this.selectedAttribute = new Attribute(name);
    }

    return dataService;
  }/*]*/);

// TODO: solve circular dependency that occurs because data depends on attribute and attribute itself depends on data