angular.module('gui')
  .factory('data', function(){

    var dataService = function(data){
      this.dataset = data;
    };

    return dataService;
  });
