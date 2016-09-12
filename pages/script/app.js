
var app = angular.module('mainModule', ['ngDragDrop','gridster']);
// var app = angular.module('mainModule',[]);
app.controller('myCtrl', function($scope, $http){
    $scope.list5 = [
    ];
    $scope.name = "kihwan";
    $http.get("/get_db").then(function(response, error){
        $scope.list5 = response.data;
    })
    $scope.maplist = [
    ];



    var changeToTree = function (arrayList) {
        Object.setPrototypeOf(arrayList, Object.prototype);
        var rootNodes = {};

        var insert_incoming = function (list){
            rootNodes.incomingPeer[list.target] = rootNodes.incomingPeer[list.target] || [];
            rootNodes.incomingPeer[list.target].push(list.source);
        }
        var insert_outcoming = function (list){
            rootNodes.outingPeer[list.source] = rootNodes.outingPeer[list.source] || [];
            rootNodes.outingPeer[list.source].push(list.target);
        }
        rootNodes.incomingPeer = rootNodes.incomingPeer || {};
        rootNodes.outingPeer = rootNodes.outingPeer || {};
        rootNodes.isInput = false;
        rootNodes.isOutput = false;
        rootNodes.devices = rootNodes.devices || {};

        for(var i=0; i<arrayList.length; ++i){
            insert_incoming(arrayList[i]);
            insert_outcoming(arrayList[i]);
        }
    };
    $scope.list = [];
    var tree = treeModel($scope.list);
    $scope.tree = JSON.stringify(tree, null, '   ');
    return rootNodes;
});
