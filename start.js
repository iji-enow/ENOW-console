const http = require('http');
const express = require('express');
const mongo = require('mongodb');
const bodyparser = require('body-parser');
var path = require('path');
var MongoClient = mongo.MongoClient;
var expressapp = express();
var temp = new Array();
var mongoUrl;
var mongoPort;
var roadMapIdTemp;
var kafka = require('kafka-node'),
Producer = kafka.Producer,
// KeyedMessage = kafka.KeyedMessage,
client = new kafka.Client('127.0.0.1:2181'),
producer = new Producer(client),
payloads = [{
    topic: '',
    messages: '',
    partition: 0
}];
// km = new KeyedMessage('key', 'message');
expressapp.use(bodyparser.json());
expressapp.use(express.static(path.join(__dirname+"/../", 'console')));
const port = 3000;

expressapp.set('port', port);


expressapp.post('/post_db', function(req, res){
    connectDB(req.body, 'source', 'recipe', 'save', null);
});
expressapp.post('/run_db', function(req, res){
    connectDB(req.body, 'source', 'execute', 'run', null);
    setTimeout(function () {
        payloads[0]['messages']='{"roadMapId":"'+roadMapIdTemp+'"}';
        payloads[0]['topic']='test';
    }, 500);
    setTimeout(function () {
        producer.send(payloads, function (err, data) {
            console.log(payloads);
        });
        producer.on('error', function (err) {
            console.log(err);
        });
    }, 700);
});
expressapp.post('/kill_db', function(req, res){
    connectDB(req.body, 'source', 'execute', 'kill', null)
});
expressapp.post('/add_broker', function(req, res){
    connectDB(req.body, 'connectionData', 'brokerList', 'saveBroker', null);
});
expressapp.post('/post_url_settings', function(req, res){
    mongoUrl = req.body['mongoUrl'];
    mongoPort = req.body['mongoPort'];
    producer.client.connectionString = req.body['zookeeperUrl']+':'+req.body['zookeeperPort'];
});
expressapp.get('/get_broker', function(req, res){
    connectDB(null, 'connectionData', 'brokerList', 'find', res);
});
expressapp.get('/get_settings', function(req, res){
    connectDB(null, 'connectionData', 'settings', 'find', res);
});

var server = expressapp.listen(expressapp.get('port'), function(){
    console.log("start enow console...");
    // connectDB(null, 'source', 'execute', 'find', null);
});

function connectDB(source, dbName, collectionName, command, response){
    MongoClient.connect('mongodb://'+mongoUrl+':'+mongoPort+'/'+dbName,function(err,db) {
        // MongoClient.connect('mongodb://127.0.0.1:27017/'+dbName,function(err,db) {


        var findDocument = function(db, callback){
            var cursor = db.collection(collectionName).find();
            // var cursor = db.collection(collectionName).find({
            //     "limit":1,
            //     "sort": {$natural:-1}
            // });
            cursor.each(function(err, doc){
                if(doc != null){
                    temp.push(doc);
                }else{
                    callback();
                }
            });
        };


        var insertDocument = function(db, callback){
            db.collection(collectionName).count({}, function(err, cnt) {
                roadMapIdTemp = cnt+1;
                db.collection(collectionName).insertOne({
                    "roadMapId" : (cnt+1).toString(),
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
            db.collection(collectionName).count({}, function(err, cnt) {
                db.collection(collectionName).insertOne({
                    "brokerNum" : (cnt+1).toString(),
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
                // console.log(temp);
                temp=[];
                db.close();
            });
        }
    });
};
