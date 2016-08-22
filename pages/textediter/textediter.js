const http = require('http');
const express = require('express');
const mongo = require('mongodb');
const bodyparser = require('body-parser');

var path = require('path');
var MongoClient = mongo.MongoClient;
var expressapp = express();

expressapp.use(bodyparser.urlencoded({extended:true}));
expressapp.use(express.static(path.join(__dirname+"/../../../", 'dashboard')));
const hostname = '127.0.0.1';
const port = 3000;

// http.createServer(expressapp).listen(port);
// server.listen(port);
// var server = http.createServer(function(req, res){
expressapp.set('port', port);

expressapp.get('/', function(req, res){
	res.sendFile("./index.html");
	console.log("zzzz");
});

expressapp.post('/', function(req, res){
	console.log(req.param('name',null));
	startdb(req.param('name',null));
});

var server = expressapp.listen(expressapp.get('port'), function(){
  console.log('Magic happens on ' + __dirname);
});


function startdb(source){
    MongoClient.connect('mongodb://localhost/source',function(err,db) {
        console.log("start db");
        var insertDocument = function(db, callback){
            db.collection('codes').insertOne({
                "name" : "hello",
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
