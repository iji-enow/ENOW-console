var app = angular.module('chartModule', []);
// var app = angular.module('mainModule',[]);
app.controller('chartCtrl', function($scope, $http){
    $scope.backgroundColor =
    [
        "#37D137",
        "#36A2EB",
        "#FFCE56",
        "#FF6384"
    ];
    $scope.settings={};
    $scope.brokerId={
        "brokerId" : "1"
    };
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
                setTimeout(function(){
                    for(i in response.data){
                        $scope.requestChart['config']['data']['labels'].push("roadMapId"+response.data[i]['roadMapId']);
                        $scope.requestChart['config']['data']['datasets'][0]['data'][i] = 0;
                        $scope.requestChart['config']['data']['datasets'][0]['backgroundColor'][i] = $scope.backgroundColor[i%4];
                        $scope.requestChart['config']['data']['datasets'][0]['hoverBackgroundColor'][i] = $scope.backgroundColor[i%4];
                    }
                }, 500);
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
                ],
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 5,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 5,
                pointHitRadius: 20
            }]
        },
        options: {
            title:{
                display:true,
                text:'Traffics of RoadMap',
                fontSize : 24
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
                ],
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 5,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 5,
                pointHitRadius: 20
            }]
        },
        options: {
            title:{
                display:true,
                text:'Logs of RoadMap',
                fontSize : 24
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
            options: {
                title:{
                    display:true,
                    text:'Error rate',
                    fontSize : 24
                }
            }
        });

        $scope.reqres = document.getElementById("requestChart");
        $scope.requestChart = new Chart($scope.reqres, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: "",
                        data: [],
                        backgroundColor: [],
                        hoverBackgroundColor: [],
                        borderWidth: 1
                    }]
                },
                options: {
                    title:{
                        display:true,
                        text:'Requests',
                        fontSize : 24
                    },
                    scales: {
                        xAxes: [{
                            stacked: true
                        }],
                        yAxes: [{
                            stacked: true
                        }]
                    },
                    barPercentage: 0.3,
                    categoryPercentage:0.3
                }
            });







            $scope.clearChart = function(){
                $scope.trafficChart.data['labels']=[];
                $scope.trafficChart.data['datasets'][0]['data']=[];
                $scope.logChart.data['labels']=[];
                $scope.logChart.data['datasets'][0]['data']=[];
                $scope.errorChart.data['datasets'][0]['data'][0]=0;
                $scope.errorChart.data['datasets'][0]['data'][1]=0;
                $scope.errorChart.data['datasets'][0]['data'][2]=0;
                $scope.errorChart.data['datasets'][0]['data'][3]=0;
                $scope.logChart.update();
            }

            $scope.updateTrafficChart = function(){
                $http({
                    withCredentials: false,
                    method: 'get',
                    url: "/get_traffic"
                }).then(function(response){
                    $scope.trafficChart.data['labels'].push(myDateString);
                    $scope.trafficChart.data['datasets'][0]['data'].push(response.data);
                    $scope.trafficChart.update();
                });
                MyDate = new Date();
                MyDate.setDate(MyDate.getDate() + 20);
                var myDateString =
                ('0' + MyDate.getHours()).slice(-2) + ':'
                +('0' + MyDate.getMinutes()).slice(-2) + ':'
                +('0' + MyDate.getSeconds()).slice(-2);
                if($scope.trafficChart.data['datasets'][0]['data'].length > 15){
                    $scope.trafficChart.data['datasets'][0]['data'].shift();
                    $scope.trafficChart.data['labels'].shift();
                }

            };
            $scope.updateLogChart = function(){
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
                $http({
                    withCredentials: false,
                    method: 'get',
                    url: "/get_error"
                }).then(function(response){
                    setTimeout(function(){
                        $scope.errorChart.data['datasets'][0]['data'][0] += response.data['traffic']*1 - response.data['errorRate']*1;
                        $scope.errorChart.data['datasets'][0]['data'][1] += response.data['errorRate'] *1;
                    }, 1000);
                    $scope.errorChart.update();
                });

                // $scope.errorChart.data['datasets'][0]['data'][target] += 1;

                // $scope.errorChart.update();
            };
            $scope.updateRequestChart = function(){
                $http({
                    withCredentials: false,
                    method: 'get',
                    url: "/get_request"
                }).then(function(response){
                    setTimeout(function(){
                        for(var i =1; i< 1000 ;++i){
                            if(response.data[i]){
                                $scope.requestChart['config']['data']['datasets'][0]['data'][i-1] = response.data[i];
                            }
                        }
                    }, 1000);
                    $scope.requestChart.update();
                });
            };
        });
