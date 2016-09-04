const http = require('http');
const express = require('express');
const mongo = require('mongodb');
const bodyparser = require('body-parser');

var path = require('path');
var MongoClient = mongo.MongoClient;
var expressapp = express();
var theValue="zzzzzzz123123";


expressapp.use(bodyparser.urlencoded({extended:true}));
expressapp.use(express.static(path.join(__dirname+"/../", 'console')));
const port = 3000;

// http.createServer(expressapp).listen(port);
// server.listen(port);
// var server = http.createServer(function(req, res){
expressapp.set('port', port);

expressapp.get('/', function(req, res){
	res.sendFile(__dirname + "/index.html");
	console.log("zzzz");
});

expressapp.get('/get_db', function(req, res){
	getdevicedb();
	console.log("zzz111z");
});

expressapp.post('/db', function(req, res){
	console.log(req.param('name',null));
	startdb(req.param('name',null), req.param('txtname',null));
	res.sendFile(path.resolve(__dirname+'/../../index.html'));
});

var server = expressapp.listen(expressapp.get('port'), function(){
  console.log('Magic happens on ' + __dirname);
});


function getdevicedb(){
	MongoClient.connect('mongodb://52.196.199.32:9191/enow',function(err,db) {
	        console.log("searching deviceid in db");
			var findRestaurants = function(db, callback) {
			   var cursor =db.collection('device').find( );
			   module.exports.hello = [
			       { 'deviceId': 'Rpi_1'},
				   { 'deviceId': 'Rpi_1'}
			   ];
			   cursor.each(function(err, doc) {
			      if (doc != null) {
			         console.dir(doc);
			      } else {
			         callback();
			      }
			   });
			};
			findRestaurants(db, function() {
		        db.close();
		    });
	});
}

function startdb(source, txtname){
    MongoClient.connect('mongodb://localhost/source',function(err,db) {
        console.log("start db");
        var insertDocument = function(db, callback){
            db.collection('codes').insertOne({
                "name" : txtname,
                "source" : source
            },function(err, result){
                console.log("Inserted a document into logs collection.");
                callback();
            });
        };
        insertDocument(db, function(){
            db.close();
        });
    });
};
