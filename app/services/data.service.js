angular.module('gui')
  .factory('data', ['attribute', '$rootScope', function(attribute, $rootScope){

    var dataService = function(data, json, vis){
      this.dataset = data;
      this.jsondata = json;
      this.visdata = vis;
      this.currentAttribute = null;
    };

    dataService.setCurrentAttribute = function(name){
      this.currentAttribute = new attribute(name, this.dataset, this.jsondata);
      $rootScope.$broadcast("attributeSet");
    }

    return dataService;
  }]);
