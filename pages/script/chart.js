var app = angular.module("chartApp", ["ng-fusioncharts"])
app.controller('MyController', function ($scope) {

    //Define the `myDataSource` scope variable.
    $scope.updateTraffic = function(){
        if(Object.keys($scope.myDataSource['dataset'][0]['data']).length>=12){
            $scope.myDataSource['categories'][0]['category'].shift();
            $scope.myDataSource['dataset'][0]['data'].shift();
        }
        var value = new Object();
        var time = new Object();
        var num = Math.floor(Math.random() * 1000+1000);
        MyDate = new Date();
        MyDate.setDate(MyDate.getDate() + 20);
        myDateString = ('0' + MyDate.getMinutes()).slice(-2) + ':'
        +('0' + MyDate.getSeconds()).slice(-2);
        time = {
            "label" : myDateString
        }
        value = {
            "value": num
        };
        $scope.myDataSource['categories'][0]['category'].push(time);
        $scope.myDataSource['dataset'][0]['data'].push(value);
    }
    $scope.myDataSource = {
        "chart": {
            "caption": "Traffic",
            "subcaption": "",
            "xaxisname": "Time",
            "yaxisname": "Traffics",
            "numberprefix": "",
            "theme": "fint"
        },
        "categories": [
            {
                "category": []
            }
        ],
        "dataset": [
            {
                "seriesname": "Traffics",
                "renderas": "line",
                "showvalues": "0",
                "data": []
            }
        ]
    }

});
