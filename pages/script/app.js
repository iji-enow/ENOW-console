
var app = angular.module('mainModule', ['ngDragDrop','gridster']);
// var app = angular.module('mainModule',[]);
app.controller('myCtrl', function($scope, $http){
    $scope.name = "kihwan";
    // $http.get("/get_db").then(function(response, error){
    //     $scope.list5 = response.data;
    // })
    // $scope.maplist = [];
    $scope.listofdevice = {};

    var changeToTree = function (arrayList) {
        Object.setPrototypeOf(arrayList, Object.prototype);
        var rootNodes = {};

        var insert_incoming = function (list){
            rootNodes.incomingNode[list.target] = rootNodes.incomingNode[list.target] || [];
            rootNodes.incomingNode[list.target].push(list.source);
        }
        var insert_outcoming = function (list){
            rootNodes.outingNode[list.source] = rootNodes.outingNode[list.source] || [];
            rootNodes.outingNode[list.source].push(list.target);
        }
        rootNodes.incomingNode = rootNodes.incomingNode || {};
        rootNodes.outingNode = rootNodes.outingNode || {};
        rootNodes.isInput = false;
        rootNodes.isOutput = false;
        rootNodes.devices = rootNodes.devices || {};

        for(var i=0; i<arrayList.length; ++i){
            insert_incoming(arrayList[i]);
            insert_outcoming(arrayList[i]);
        }

        return rootNodes;
    };
    $scope.list = [];
    var tree = changeToTree($scope.list);
    $scope.tree = JSON.stringify(tree, null, '   ');
});
