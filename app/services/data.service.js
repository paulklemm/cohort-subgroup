angular.module('gui')
  .factory('data', ['attribute', '$rootScope', function(attribute, $rootScope){

    var dataService = function(data, json){
      this.dataset = data;
      this.jsondata = json;
      this.currentAttribute = null;
    };

    dataService.setCurrentAttribute = function(name){
      this.currentAttribute = new attribute(name, this.dataset, this.jsondata);
      $rootScope.$broadcast("attributeSet");
    }

    return dataService;
  }]);
