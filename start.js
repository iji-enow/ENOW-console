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
	console.log("post");
	connectDB(req.body, 'recipe', 'save');
});
expressapp.post('/run_db', function(req, res){
	console.log("run");
	connectDB(req.body, 'execute', 'run');


});
expressapp.post('/kill_db', function(req, res){
	console.log("kill");
	connectDB(req.body, 'execute', 'kill')
});

var server = expressapp.listen(expressapp.get('port'), function(){
	console.log('Magic happens on ' + __dirname);
});

function connectDB(source, collectionName, command){
	MongoClient.connect('mongodb://localhost/source',function(err,db) {
		console.log("connecting to db...");
		// console.log("count : " + db.collection(collectionName).count());

		var insertDocument = function(db, callback){
			db.collection(collectionName).count({}, function(err, c) {
				db.collection(collectionName).insertOne({
					"roadMapId" : (c+1).toString(),
					"clientId" : source['clientId'],
					"initNode" : source['initNode'],
					"lastNode" : source['lastNode'],
					"incomingNode" : source['incomingNode'],
					"outingNode" : source['outingNode'],
					"isInput" : source['isInput'],
					"isOutput" : source['isOutput'],
					"mapIds" : source['mapIds']
				},function(err, result){
					callback();
				});
			});
		};
		var deleteDocument = function(db, callback){
			db.collection(collectionName).deleteOne({
			},function(err, result){
				console.log("Running...");
				callback();
			});
		};
		var countDocument = function(db, callback){
			db.collection(collectionName).count({
			},function(err, result){
				console.log("Running..." + result);
				callback();
			});
		};
		if(command=="save"){
			countDocument(db, function(){
				insertDocument(db, function(){
					db.close();
				});
			});
		}else if(command=="kill"){
			deleteDocument(db,function(){
				db.close();
			});
		}else if(command=="run"){
			insertDocument(db, function(){
				db.close();
			});
		}
	});
};
