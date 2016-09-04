
var App = angular.module('drag-and-drop', ['ngDragDrop']);
App.controller('oneCtrl', function($scope, $timeout) {
  $scope.list1 = [];
  $scope.list2 = [];
  $scope.list3 = [];
  $scope.list4 = [];

  $scope.list5 = [
      { 'deviceId': 'Rpi_1'},
      { 'deviceId': 'Rpi_2'},
      { 'deviceId': 'Rpi_3'},
      { 'deviceId': 'I7_1'},
      { 'deviceId': 'I7dd_2'},
      { 'deviceId': 'Echo_1'},
      { 'deviceId': 'Echo_2'},
      { 'deviceId': 'Echo_3'}
  ];
});
