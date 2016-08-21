const http = require('http');
const express = require('express');
const mongo = require('mongodb');
const bodyparser = require('body-parser');

var path = require('path');
var MongoClient = mongo.MongoClient;
var expressapp = express();
expressapp.use(bodyparser.urlencoded({extended:true}));
expressapp.use(express.static(path.join(__dirname, 'public')));
var router = express.Router();
const hostname = '127.0.0.1';
const port = 3000;

router.use(function(req, res, next) {
	console.log(req.method, req.url);
	next();
});

http.createServer(expressapp).listen(3000);

expressapp.get('/', function(req, res){
	console.log("aa");
});

function startdb(){
    var name = document.getElementById('src');
    console.log(name.value);
    MongoClient.connect('mongodb://localh	ost/source',function(err,db) {
        var i = document.getElementById('src');
        console.log("start db");
        var insertDocument = function(db, callback){
            db.collection('codes').insertOne({
                "name" : "hello",
                "source" : i.value
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
