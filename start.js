const http = require('http');
const express = require('express');
const mongo = require('mongodb');
const bodyparser = require('body-parser');

var path = require('path');
var MongoClient = mongo.MongoClient;
var expressapp = express();
var device_data = new Array();

expressapp.use(bodyparser.json());
expressapp.use(express.static(path.join(__dirname+"/../", 'console')));
const port = 3000;

// http.createServer(expressapp).listen(port);
// server.listen(port);
// var server = http.createServer(function(req, res){
expressapp.set('port', port);

// expressapp.get('/', function(req, res){
// 	res.sendFile(__dirname + "/index.html");
// 	console.log("zzzz");
// });

// expressapp.get('/get_db', function(req, res){
// 	getdevicedb(req, res);
// 	console.log("zzz111z");
// });

// expressapp.post('/db', function(req, res){
// 	console.log(req.param('name',null));
// 	connectDB(req.param('name',null), req.param('txtname',null));
// 	res.sendFile(path.resolve(__dirname+'/../../index.html'));
// });

expressapp.post('/post_db', function(req, res){
	console.log("zzzz");
	console.log(req.body);
	connectDB(req.body, "recipe");
});
expressapp.post('/run_db', function(req, res){
	console.log("zzzz");
	console.log(req.body);
	connectDB(req.body, 'execute')
});

var server = expressapp.listen(expressapp.get('port'), function(){
  console.log('Magic happens on ' + __dirname);
});


function getdevicedb(req, res){
	MongoClient.connect('mongodb://52.68.183.120:9191/enow',function(err,db) {
	        console.log("searching deviceid in db");
			var findRestaurants = function(db, callback) {
			   var cursor =db.collection('device').find();
			   cursor.each(function(err, doc) {
			      if (doc != null) {
			         console.dir(doc);
					 device_data.push(doc);
			      } else {
			         callback();
			      }
			   });
			};
			findRestaurants(db, function() {
				res.send(device_data)
		        db.close();
		    });
	});
}

function connectDB(source, collectionName){
    MongoClient.connect('mongodb://localhost/source',function(err,db) {
        console.log("connecting to db...");
        var insertDocument = function(db, callback){
            db.collection(collectionName).insertOne({
                "name" : "active",
                "source" : source
            },function(err, result){
                console.log("Running...");
                callback();
            });
        };
        insertDocument(db, function(){
            db.close();
        });
    });
};
