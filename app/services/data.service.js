angular.module('gui')
  .factory('data', function(){
    var dataService = {};
    dataService.dataset = [];

    dataService.setData = function(data){
      dataService.dataset = data;
    };
  });
