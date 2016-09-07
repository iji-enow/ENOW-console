
var app = angular.module('mainModule', ['ngDragDrop']);
// var app = angular.module('mainModule',[]);

app.controller('myCtrl', function($scope, $http){
  $scope.list1 = [];
  $scope.list2 = [];
  $scope.list3 = [];
  $scope.list4 = [];
  $scope.list5 = [];
  $scope.name = "kihwan";
  $http.get("/get_db").then(function(response, error){
      $scope.list5 = response.data;
  })
});
