
var app = angular.module('mainModule', []);
// var app = angular.module('mainModule',[]);
app.controller('myCtrl', function($scope, $http){

    // stages.html
    $scope.listOfDevice = {};
    $scope.listOfInitNode = [];
    $scope.listOfLastNode = [];
    $scope.list = [];
    $scope.listOfRoadMap = [];
    $scope.listOfRunningRoadMap = [];
    $scope.tree;
    $scope.nodeIds;
    $scope.loadTarget ={};
    $scope.getTarget;

    // settings.html
    $scope.brokerList=[];
    $scope.currentDeviceList;
    $scope.currentBroker={
        brokerId:""
    };
    $scope.settings={};
    $scope.newnode ={};
    $scope.newdevice={};
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
        }).then(function(response){
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
        }).then(function(response){
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
        }).then(function(response){
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
        }).then(function(response){
        });
    }
    $scope.loadRoadMap = function(){
        $http({
            withCredentials: false,
            method: 'post',
            url: "/load_roadmap",
            headers: {'Content-Type': 'application/json'},
            data: $scope.loadTarget,
            contentType : 'application/json',
            dataType: "json"
        }).then(function(response){
            if(response.data=="no_connect"){
                alert('Connect failed. Check MongoDB Url, Port.');
            }else{
                console.log(response);
                $scope.getTarget = response.data;
            }
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
        }).then(function(response){
        });
    }
    $scope.addDevice = function(){
        $http({
            withCredentials: false,
            method: 'post',
            url: "/add_device",
            headers: {'Content-Type': 'application/json'},
            data: $scope.newdevice,
            contentType : 'application/json',
            dataType: "json"
        }).then(function(response){
        });
    }
    $scope.findDevice = function(){
        $http({
            withCredentials: false,
            method: 'post',
            url: "/find_device",
            headers: {'Content-Type': 'application/json'},
            data: $scope.newdevice,
            contentType : 'application/json',
            dataType: "json"
        }).then(function(response){
            if(response.data=="no_connect"){
                alert('Connect failed. Check MongoDB Url, Port.');
            }else{
                if(response.data.length==0){
                    $scope.addDevice();
                }else{
                    alert('deviceId already exist.');
                }
            }
        });
    }
    $scope.getBroker = function(){
        $http({
            withCredentials: false,
            method: 'post',
            url: "/get_broker",
            headers: {'Content-Type': 'application/json'},
            data: $scope.currentBroker,
            contentType : 'application/json',
            dataType: "json"
        }).then(function(response){
            if(response.data=="no_connect"){
                alert('Connect failed. Check MongoDB Url, Port.');
            }else{
                $scope.currentDeviceList = response.data[0]['deviceId'];
            }
        });
    }
    // get
    $scope.getBrokers = function(){
        $http({
            withCredentials: false,
            method: 'get',
            url: "/get_brokers"
        }).then(function(response){
            if(response.data=="no_connect"){
                alert('Connect failed. Check MongoDB Url, Port.');
            }else{
                console.log('done!');
                $scope.brokerList = response.data;
            }

        });
    }
    $scope.getSettings = function(){
        $http({
            withCredentials: false,
            method: 'get',
            url: "/get_settings"
        }).then(function(response){
            if(response.data=="no_connect"){
                alert('Connect failed. Check MongoDB Url, Port.');
            }else{
                $scope.settings = response.data;
            }
        });
    }
    $scope.getRoadMaps = function(){
        $http({
            withCredentials: false,
            method: 'get',
            url: "/get_roadmaps"
        }).then(function(response){
            if(response.data=="no_connect"){
                alert('Connect failed. Check MongoDB Url, Port.');
            }else{
                console.log(response.data);
                $scope.listOfRoadMap = response.data;
            }
        });
    }
    $scope.getRunningRoadMaps = function(){
        $http({
            withCredentials: false,
            method: 'get',
            url: "/get_running_roadmaps"
        }).then(function(response){
            if(response.data=="no_connect"){
                alert('Connect failed. Check MongoDB Url, Port.');
            }else{
                $scope.listOfRunningRoadMap = response.data;
            }
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
        rootNodes.orderNode = this.orderNode['key'];
        rootNodes.initNode = this.listOfInitNode;
        rootNodes.lastNode = this.listOfLastNode;
        rootNodes.isInput = false;
        rootNodes.isOutput = false;
        rootNodes.incomingNode = rootNodes.incomingNode || {};
        rootNodes.outingNode = rootNodes.outingNode || {};
        rootNodes.nodeIds = this.nodeIds || {};
        for(var i=0; i<arrayList.length; ++i){
            insert_incoming(arrayList[i]);
            insert_outcoming(arrayList[i]);
        }
        // $scope.tree = rootNodes;
        $scope.tree = JSON.stringify(rootNodes, null, '   ');
        return rootNodes;
    };

});
