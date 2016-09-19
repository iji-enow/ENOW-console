const http = require('http');
const express = require('express');
const mongo = require('mongodb');
const bodyparser = require('body-parser');
const BSON = require('bson').BSONPure;
var path = require('path');
var MongoClient = mongo.MongoClient;
var expressapp = express();
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
    connectDB(req.body, 'source', 'recipes', 'save', null);
});
expressapp.post('/run_db', function(req, res){
    connectDB(req.body, 'source', 'execute', 'run', null);
    setTimeout(function () {
        payloads[0]['messages']='{"roadMapId":"'+roadMapIdTemp+'"}';
        payloads[0]['topic']='test';
    }, 300);
    setTimeout(function () {
        producer.send(payloads, function (err, data) {
            console.log(payloads);
        });
        producer.on('error', function (err) {
            console.log(err);
        });
    }, 500);
});
expressapp.post('/kill_db', function(req, res){
    connectDB(req.body, 'source', 'execute', 'kill', null)
});
expressapp.post('/add_broker', function(req, res){
    connectDB(req.body, 'connectionData', 'brokerList', 'saveBroker', null);
});
expressapp.post('/add_device', function(req, res){
    connectDB(req.body, 'connectionData', 'brokerList', 'saveDevice', res);
});
expressapp.post('/find_device', function(req, res){
    console.log("aaa");
    connectDB(req.body, 'connectionData', 'brokerList', 'findDevice', res);
});
expressapp.post('/post_url_settings', function(req, res){
    mongoUrl = req.body['mongoUrl'];
    mongoPort = req.body['mongoPort'];
    producer.client.connectionString = req.body['zookeeperUrl']+':'+req.body['zookeeperPort'];
});
expressapp.post('/load_roadmap', function(req, res){
    connectDB(req.body, 'source', 'recipes', 'findTarget', res);
});
expressapp.post('/get_broker', function(req, res){
    // console.log(req.body);
    connectDB(req.body, 'connectionData', 'brokerList', 'findBroker', res);
});
expressapp.get('/get_brokers', function(req, res){
    connectDB(null, 'connectionData', 'brokerList', 'find', res);
});
expressapp.get('/get_settings', function(req, res){
    connectDB(null, 'connectionData', 'settings', 'find', res);
});
expressapp.get('/get_roadmaps', function(req, res){
    connectDB(null, 'source', 'recipes', 'find', res);
});
expressapp.get('/get_devices', function(req, res){
    connectDB(null, 'connectionData', 'brokerList', 'find', res);
});

var server = expressapp.listen(expressapp.get('port'), function(){
    console.log("start enow console...");
});

function connectDB(source, dbName, collectionName, command, response){
    MongoClient.connect('mongodb://'+mongoUrl+':'+mongoPort+'/'+dbName,function(err,db) {
    // MongoClient.connect('mongodb://127.0.0.1:27017/'+dbName,function(err,db) {


        var findDocument = function(db, callback){
            db.collection(collectionName).find({}).toArray(function(err,result){
                response.send(result);
            });
        };
        var findBroker = function(db, callback){
            console.log("asdfadsfadsfasd   "+ source['deviceId']);
            db.collection(collectionName).find({brokerId:source['brokerId']}).toArray(function(err,result){
                console.log(result);
                response.send(result);
            });
        };

        var findTarget = function(db, callback){
            var o_id = BSON.ObjectID.createFromHexString(source['_id']);
            db.collection(collectionName).find({_id:o_id}).toArray(function(err,result){
                console.log(result);
                response.send(result);
                o_id = null;
            });
        }

        var findDevice = function(db, callback){
            db.collection(collectionName).find({deviceId:source['deviceId']}).toArray(function(err,result){
                response.send(result);
            });
        }

        var insertDocument = function(db, callback){
            var cursor = db.collection(collectionName).find({}).toArray(function(err,result){
                if(result.length!=0){
                    roadMapIdTemp = parseInt(result[result.length-1]['roadMapId'])+1;
                }
                else{
                    roadMapIdTemp = 1;
                }
                db.collection(collectionName).insertOne({
                    "roadMapId" : roadMapIdTemp.toString(),
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
        var insertDocumentDevice = function(db, callback){
            db.collection(collectionName).updateOne(
           {
               'brokerId':source['brokerId']
           },{
               $push: { "deviceId": source['deviceId']}
           }, function(err, results) {
           callback();
        });
     };

        var insertDocumentBroker = function(db, callback){
            db.collection(collectionName).count({}, function(err, cnt) {
                db.collection(collectionName).insertOne({
                    "brokerNum" : (cnt+1).toString(),
                    "brokerId" : source['brokerId'],
                    "ipAddress" : source['ipAddress'],
                    "devices" : source['devices'],
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

        if(command=="save" || command=="run"){
            insertDocument(db, function(){
                db.close();
            });
        }else if(command=="saveBroker"){
            insertDocumentBroker(db, function(){
                db.close();
            });
        }else if(command=="saveDevice"){
            insertDocumentDevice(db, function(){
                db.close();
            });
        }else if(command=="findDevice"){
            findDevice(db, function(){
                db.close();
            });
        }else if(command=="kill"){
            deleteDocument(db,function(){
                db.close();
            });
        }else if(command=="find"){
            findDocument(db, function(){
                db.close();
            });
        }else if(command=="findTarget"){
            findTarget(db, function(){
                db.close();
            });
        }else if(command=="findBroker"){
            findBroker(db, function(){
                db.close();
            });
        }


    });
};
