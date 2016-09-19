
var app = angular.module('mainModule', []);
// var app = angular.module('mainModule',[]);
app.controller('myCtrl', function($scope, $http){
    $scope.name = "a";
    // $http.get("/get_db").then(function(response, error){
    //     $scope.list = response.data;
    // })
    // stages.html
    $scope.listOfDevice = {};
    $scope.listOfInitNode = [];
    $scope.listOfLastNode = [];
    $scope.list = [];
    $scope.listOfRoadMap = [];
    $scope.tree;
    $scope.mapIds;
    $scope.loadTarget ={};
    $scope.getTarget;
    // settings.html
    $scope.brokerList=[
    //     {
    //         brokerId:"aaaaa",
    //         ipAddress:"127.0.0.1",
    //         port:"1111",
    //         devices:["aaaa","aaa","aa","a"]
    // },{
    //     brokerId:"bbbbb",
    //     ipAddress:"127.0.0.1",
    //     port:"2222",
    //     devices:["bbbb","bbb","bb","b"]
    // }

];
$scope.currentDeviceList;
$scope.currentBroker;
$scope.settings={};
$scope.newnode ={};
$scope.newdevice={
    deviceId:""
};
// ------------------------------------------
$scope.saveDataBase = function(){
    $http({
        withCredentials: false,
        method: 'post',
        url: "/post_db",
        headers: {'Content-Type': 'application/json'},
        data: $scope.tree,
        contentType : 'application/json',
        dataType: "json"
    });
}
$scope.runRoadMap = function(){
    $http({
        withCredentials: false,
        method: 'post',
        url: "/run_db",
        headers: {'Content-Type': 'application/json'},
        data: $scope.tree,
        contentType : 'application/json',
        dataType: "json"
    });
}
$scope.killRoadMap = function(){
    $http({
        withCredentials: false,
        method: 'post',
        url: "/kill_db",
        headers: {'Content-Type': 'application/json'},
        data: $scope.tree,
        contentType : 'application/json',
        dataType: "json"
    });
}
$scope.addBroker = function(){
    $http({
        withCredentials: false,
        method: 'post',
        url: "/add_broker",
        headers: {'Content-Type': 'application/json'},
        data: $scope.newnode,
        contentType : 'application/json',
        dataType: "json"
    });
}
$scope.loadRoadMap = function(){
    console.log($scope.loadTarget);
    $http({
        withCredentials: false,
        method: 'post',
        url: "/load_roadmap",
        headers: {'Content-Type': 'application/json'},
        data: $scope.loadTarget,
        contentType : 'application/json',
        dataType: "json"
    }).then(function(response){
        $scope.getTarget = response.data;
    });
}
$scope.addDevice = function(){
    console.log($scope.newnode);
    $http({
        withCredentials: false,
        method: 'post',
        url: "/add_device",
        headers: {'Content-Type': 'application/json'},
        data: $scope.newdevice,
        contentType : 'application/json',
        dataType: "json"
    });
}
// get
$scope.getBroker = function(){
    $http({
        withCredentials: false,
        method: 'get',
        url: "/get_broker"
    }).then(function(response){
        // this.brokerList = response.data;
        $scope.brokerList = response.data;
    });
}
$scope.getSettings = function(){
    $http({
        withCredentials: false,
        method: 'get',
        url: "/get_settings"
    }).then(function(response){
        // this.brokerList = response.data;
        $scope.settings = response.data;
    });
}
$scope.getRoadMaps = function(){
    $http({
        withCredentials: false,
        method: 'get',
        url: "/get_roadmaps"
    }).then(function(response){
        // this.brokerList = response.data;
        $scope.listOfRoadMap = response.data;
    });
}
$scope.postUrlSettings = function(){
    $http({
        withCredentials: false,
        method: 'post',
        url: "/post_url_settings",
        headers: {'Content-Type': 'application/json'},
        data: $scope.settings,
        contentType : 'application/json',
        dataType: "json"
    });
}
$scope.changeToTree = function (arrayList) {
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

    rootNodes.roadMapId = "";
    rootNodes.clientId = "1";
    rootNodes.initNode = this.listOfInitNode;
    rootNodes.lastNode = this.listOfLastNode;
    rootNodes.isInput = 'false';
    rootNodes.isOutput = 'false';
    rootNodes.incomingNode = rootNodes.incomingNode || {};
    rootNodes.outingNode = rootNodes.outingNode || {};
    rootNodes.clientId = "1";
    rootNodes.mapIds = this.mapIds || {};
    for(var i=0; i<arrayList.length; ++i){
        insert_incoming(arrayList[i]);
        insert_outcoming(arrayList[i]);
    }
    // $scope.tree = rootNodes;
    $scope.tree = JSON.stringify(rootNodes, null, '   ');
    return rootNodes;
};

});
