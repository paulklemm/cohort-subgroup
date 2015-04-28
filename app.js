
var app = angular.module('gui', []);

//load initial data
app.run(['$rootScope', function($rootScope){
  data = [];
  d3.csv('data/breast_fat_labels.csv', function(result){ data = result; $rootScope.$broadcast("dataLoaded"); });
}]);
