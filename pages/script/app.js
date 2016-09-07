
var app = angular.module('mainModule', ['ngDragDrop','gridster']);
// var app = angular.module('mainModule',[]);
app.controller('myCtrl', function($scope, $http){
    $scope.list5 = [
        {"deviceId":"dev1"},
        {"deviceId":"dev2"},
        {"deviceId":"dev3"},
        {"deviceId":"dev4"},
        {"deviceId":"dev5"},
        {"deviceId":"dev6"}
    ];
    $scope.name = "kihwan";
    $http.get("/get_db").then(function(response, error){
        $scope.list5 = response.data;
    })
    $scope.maplist = [
    ];
    $scope.gridsterOpts = {
        minRows: 2, // the minimum height of the grid, in rows
        maxRows: 100,
        columns: 6, // the width of the grid, in columns
        colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
        rowHeight: 'match', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
        margins: [50, 50], // the pixel distance between each widget
        defaultSizeX: 1, // the default width of a gridster item, if not specifed
        defaultSizeY: 1, // the default height of a gridster item, if not specified
        mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
        resizable: {
            enabled: true,
            start: function (event, uiWidget, $element) {
            }, // optional callback fired when resize is started,
            resize: function (event, uiWidget, $element) {
            }, // optional callback fired when item is resized,
            stop: function (event, uiWidget, $element) {
            } // optional callback fired when item is finished resizing
        },
        draggable: {
            enabled: true, // whether dragging items is supported
            handle: '.ddd', // optional selector for resize handle
            start: function (event, uiWidget, $element) {
            }, // optional callback fired when drag is started,
            drag: function (event, uiWidget, $element) {
            }, // optional callback fired when item is moved,
            stop: function (event, uiWidget, $element) {
            } // optional callback fired when item is finished dragging
        }
    };
});
