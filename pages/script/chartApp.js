var app = angular.module('chartModule', []);
// var app = angular.module('mainModule',[]);
app.controller('chartCtrl', function($scope, $http){

    $scope.settings={};
    $scope.listOfRunningRoadMap = [];
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
    $scope.traffic = document.getElementById("trafficChart");
    $scope.trafficChart = new Chart($scope.traffic, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Traffics',
                data: [],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.05)'
                ]
            }]
        },
        options: {
            title:{
                display:true,
                text:'Traffics of RoadMap'
            },
            scales: {
                xAxes: [{
                    ticks:{
                        beginAtZero:true
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });

    $scope.log = document.getElementById("logChart");
    $scope.logChart = new Chart($scope.log, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Logs',
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.05)'
                ]
            }]
        },
        options: {
            title:{
                display:true,
                text:'Logs of RoadMap'
            },
            scales: {
                xAxes: [{
                    ticks:{
                        beginAtZero:true
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
    $scope.error = document.getElementById("errorChart");
    $scope.errorChart = new Chart($scope.error, {
    type: 'doughnut',
    data: {
    labels: [
        "Passed",
        "ConnectionError",
        "TypeError",
        "ValueError"
    ],
    datasets: [
        {
            data: [0, 0, 0, 0],
            backgroundColor: [
                "#37D137",
                "#36A2EB",
                "#FFCE56",
                "#FF6384"
            ],
            hoverBackgroundColor: [
                "#37D137",
                "#36A2EB",
                "#FFCE56",
                "#FF6384"
            ]
        }]
},
    options: {}
});









    $scope.updateTrafficChart = function(){
        // $http({
        //     withCredentials: false,
        //     method: 'get',
        //     url: "/get_log"
        // }).then(function(response){
        //     if(response.data=="no_connect"){
        //         alert('Connect failed. Check MongoDB Url, Port.');
        //     }else{
        //         console.log('done!');
        //         $scope.brokerList = response.data;
        //     }
        // });
        MyDate = new Date();
        MyDate.setDate(MyDate.getDate() + 20);
        var myDateString = ('0' + MyDate.getMinutes()).slice(-2) + ':'
        +('0' + MyDate.getSeconds()).slice(-2);
        if($scope.trafficChart.data['datasets'][0]['data'].length>20){
            $scope.trafficChart.data['datasets'][0]['data'].shift();
            $scope.trafficChart.data['labels'].shift();
        }
        var num = Math.floor(Math.random()*100);
        $scope.trafficChart.data['labels'].push(myDateString);
        $scope.trafficChart.data['datasets'][0]['data'].push(num);
        $scope.trafficChart.update();
    };
    $scope.updateLogChart = function(){
        // $http({
        //     withCredentials: false,
        //     method: 'get',
        //     url: "/get_log"
        // }).then(function(response){
        //     if(response.data=="no_connect"){
        //         alert('Connect failed. Check MongoDB Url, Port.');
        //     }else{
        //         console.log('done!');
        //         $scope.brokerList = response.data;
        //     }
        // });
        MyDate = new Date();
        MyDate.setDate(MyDate.getDate() + 20);
        var myDateString = ('0' + MyDate.getMinutes()).slice(-2) + ':'
        +('0' + MyDate.getSeconds()).slice(-2);
        if($scope.logChart.data['datasets'][0]['data'].length>20){
            $scope.logChart.data['datasets'][0]['data'].shift();
            $scope.logChart.data['labels'].shift();
        }
        var num = Math.floor(Math.random()*100);
        $scope.logChart.data['labels'].push(myDateString);
        $scope.logChart.data['datasets'][0]['data'].push(num);
        $scope.logChart.update();
    };
    $scope.updateErrorChart = function(){
        // $http({
        //     withCredentials: false,
        //     method: 'get',
        //     url: "/get_log"
        // }).then(function(response){
        //     if(response.data=="no_connect"){
        //         alert('Connect failed. Check MongoDB Url, Port.');
        //     }else{
        //         console.log('done!');
        //         $scope.brokerList = response.data;
        //     }
        // });
        var arr = [0,0,0,0,0,0,0,1,2,3,0,0,0,0,0,0,0,1,0,3,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,2,3];
        var target = arr[Math.floor(Math.random()*40)];
        $scope.errorChart.data['datasets'][0]['data'][target] += 1;

        $scope.errorChart.update();
    };
});
