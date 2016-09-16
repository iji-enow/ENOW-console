const http = require('http');
const express = require('express');
const mongo = require('mongodb');
const bodyparser = require('body-parser');

var path = require('path');
var MongoClient = mongo.MongoClient;
var expressapp = express();
var temp = new Array();

expressapp.use(bodyparser.json());
expressapp.use(express.static(path.join(__dirname+"/../", 'console')));
const port = 3000;

// http.createServer(expressapp).listen(port);
// server.listen(port);
// var server = http.createServer(function(req, res){
expressapp.set('port', port);

expressapp.post('/post_db', function(req, res){
	connectDB(req.body, 'source', 'recipe', 'save', null);
});
expressapp.post('/run_db', function(req, res){
	connectDB(req.body, 'source', 'execute', 'run', null);
});
expressapp.post('/kill_db', function(req, res){
	connectDB(req.body, 'source', 'execute', 'kill', null)
});
expressapp.get('/get_broker', function(req, res){
	// console.log(req.body);
	connectDB(null, 'connectionData', 'brokerList', 'find', res);
});
expressapp.post('/add_broker', function(req, res){
	connectDB(req.body, 'connectionData', 'brokerList', 'saveBroker', null);
});
var server = expressapp.listen(expressapp.get('port'), function(){
	console.log("start enow console...");
});

function connectDB(source, dbName, collectionName, command, response){
	MongoClient.connect('mongodb://localhost/'+dbName,function(err,db) {
		var findDocument = function(db, callback){
			var cursor = db.collection(collectionName).find();
			cursor.each(function(err, doc){
				if(doc != null){
					temp.push(doc);
				}else{
					callback();
				}
			});
		};
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
		var insertDocumentBroker = function(db, callback){
			db.collection(collectionName).count({}, function(err, c) {
				db.collection(collectionName).insertOne({
					"brokerNum" : (c+1).toString(),
					"brokerId" : source['brokerId'],
					"ipAddress" : source['ipAddress'],
					"kafkaUrl" : source['kafkaUrl'],
					"kafkaPort" : source['kafkaPort'],
				},function(err, result){
					callback();
				});
			});
		};
		var deleteDocument = function(db, callback){
			db.collection(collectionName).deleteOne({
			},function(err, result){
				callback();
			});
		};
		var countDocument = function(db, callback){
			db.collection(collectionName).count({
			},function(err, result){
				callback();
			});
		};
		if(command=="save"){
			insertDocument(db, function(){
				db.close();
			});
		}else if(command=="saveBroker"){
			insertDocumentBroker(db, function(){
				db.close();
			});
		}else if(command=="kill"){
			deleteDocument(db,function(){
				db.close();
			});
		}else if(command=="run"){
			insertDocument(db, function(){
				db.close();
			});
		}else if(command=="find"){
			findDocument(db, function(){
				response.send(temp);
				temp=[];
				db.close();
			});
		}
	});
};
