
var app = angular.module('gui', []);

//load initial data
app.run(['$rootScope', 'data', function($rootScope, data){
  d3.csv('data/breast_fat_labels.csv', function(result){ data.dataset = result; $rootScope.$broadcast("dataLoaded"); });
  d3.json('data/dictionary_new_names.json', function(result){ data.jsondata = result; });
  d3.json('data/attributes.json', function(result){ data.visdata = result; $rootScope.$broadcast("visDataLoaded"); });
  data.currentAttribute = null;
}]);

app.controller('attributeCtrl', ['$scope', 'data', function($scope, data) {
  $scope.attributeClicked = false;
  $scope.attributeName = "";
  $scope.isContinuous = false;
  $scope.$on("attributeSet", function(){
    $scope.attributeClicked = true;
    $scope.attributeName = data.currentAttribute.name;
    if(data.currentAttribute.type == "numerical")
      $scope.isContinuous = false;
    else
      $scope.isContinuous = true;
    $scope.$apply();
  });
}]);

app.controller('ListCtrl', ['$scope', function($scope) {
  var i = 0;
  $scope.extendSubgroupList = function() {
    i += 1;
    console.log('extend');
    var list = d3.select("#subgroupList")
      .append("li")
      .text("Subgruppe " + i);
  };
}]);
