
var app = angular.module('mainModule', []);
// var app = angular.module('mainModule',[]);
app.controller('myCtrl', function($scope, $http){

    $scope.temp;
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
    $scope.currentTarget={'roadMapId':''};

    // settings.html
    $scope.brokerList=[];
    $scope.currentDeviceList;
    $scope.currentBroker={
        brokerId:""
    };
    $scope.settings={};
    $scope.newnode ={};
    $scope.newdevice={};
    $scope.file ={
        "ca":"",
        "hostCrt":"",
        "hostKey":""
    };
    // dashboard.html
    $scope.data={
        'x': 10,
        'y': 20
    };
    // statistics.html
    $scope.log;

    // ------------------------------------------

    $scope.addFile = function(){
        var files = [];
        $scope.temp = [];
        for(var i =1; i<= 3; ++i){
            files.push(document.getElementById('addSecurityFile'+i).files[0]);
        }
        setTimeout(function(){
            $.each(files, function(i, j){
                var reader = new FileReader();
                reader.readAsText(files[i]);
                reader.onload = function(e){
                    $scope.temp.push(reader.result);
                }
            });
            console.log(this.temp);
            setTimeout(function(){
                $scope.file['caFile'] = $scope.temp[0];
                $scope.file['crtFile'] = $scope.temp[1];
                $scope.file['keyFile'] = $scope.temp[2];
                }, 1000);
        }, 1000);
    };

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
            url: "/alive_check",
            headers: {'Content-Type': 'application/json'},
            data: $scope.tree,
            contentType : 'application/json',
            dataType: "json"
        }).then(function(response){
            if(response.data.includes('0')){
                alert('no ack from devices');
                console.log($('#run').attr('checked', false));
            }else{
                $http({
                    withCredentials: false,
                    method: 'post',
                    url: "/run_db",
                    headers: {'Content-Type': 'application/json'},
                    data: $scope.tree,
                    contentType : 'application/json',
                    dataType: "json"
                }).then(function(response){
                    $scope.currentTarget['roadMapId'] = response.data;
                });
            }
        });
    }
    $scope.killRoadMap = function(){
        $http({
            withCredentials: false,
            method: 'post',
            url: "/kill_db",
            headers: {'Content-Type': 'application/json'},
            data: $scope.currentTarget,
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
    $scope.addSecure = function(){
        $http({
            withCredentials: false,
            method: 'post',
            url: "/add_secure",
            headers: {'Content-Type': 'application/json'},
            data: $scope.file,
            contentType : 'application/json',
            dataType: "json"
        }).then(function(response){
        });
    }
    $scope.delSecure = function(){
        $http({
            withCredentials: false,
            method: 'post',
            url: "/del_secure",
            headers: {'Content-Type': 'application/json'},
            data: $scope.file,
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
            console.log(response.data);
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
    $scope.findDevice = function(option){
        $http({
            withCredentials: false,
            method: 'post',
            url: "/find_device",
            headers: {'Content-Type': 'application/json'},
            data: $scope.newdevice,
            contentType : 'application/json',
            dataType: "json"
        }).then(function(response){
            if(option=="add"){
                if(response.data=="no_connect"){
                    alert('Connect failed. Check MongoDB Url, Port.');
                }else{
                    if(response.data.length==0){
                        $scope.addDevice();
                    }else{
                        alert('deviceId already exist.');
                    }
                }
            }else if(option=="delete"){
                if(response.data=="no_connect"){
                    alert('Connect failed. Check MongoDB Url, Port.');
                }else{
                    if(response.data.length==1){
                        $scope.deleteDevice();
                    }
                }
            }
        });
    }
    $scope.deleteDevice = function(){
        $http({
            withCredentials: false,
            method: 'post',
            url: "/delete_device",
            headers: {'Content-Type': 'application/json'},
            data: $scope.newdevice,
            contentType : 'application/json',
            dataType: "json"
        }).then(function(response){
        });
    }
    $scope.deleteBroker = function(){
        $http({
            withCredentials: false,
            method: 'post',
            url: "/delete_broker",
            headers: {'Content-Type': 'application/json'},
            data: $scope.newnode,
            contentType : 'application/json',
            dataType: "json"
        }).then(function(response){
        });
    }
    $scope.findBroker = function(){
        $http({
            withCredentials: false,
            method: 'post',
            url: "/find_broker",
            headers: {'Content-Type': 'application/json'},
            data: $scope.newnode,
            contentType : 'application/json',
            dataType: "json"
        }).then(function(response){
            if(response.data=="no_connect"){
                alert('Connect failed. Check MongoDB Url, Port.');
            }else{
                if(response.data.length==0){
                    $scope.addBroker();
                }else{
                    alert('brokerId already exist.');
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
                $scope.brokerList = response.data;
            }
        });
    }
    $scope.executeMongodb = function(){
        $http({
            withCredentials: false,
            method: 'get',
            url: "/execute_mongodb"
        }).then(function(response){
        });
    }
    $scope.executeStorm = function(){
        $http({
            withCredentials: false,
            method: 'get',
            url: "/execute_storm"
        }).then(function(response){
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
        if(this.getTarget){
            rootNodes.roadMapId = this.getTarget[0]['roadMapId'] || "";
        }
        else{
            rootNodes.roadMapId = "";
        }

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
