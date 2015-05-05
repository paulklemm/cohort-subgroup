
var app = angular.module('gui', []);

//load initial data
app.run(['$rootScope', 'data', function($rootScope, data){
  d3.csv('data/breast_fat_labels.csv', function(result){ data.dataset = result; $rootScope.$broadcast("dataLoaded"); });
  d3.json('data/dictionary_new_names.json', function(result){ data.jsondata = result; });
}]);
