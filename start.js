const http = require('http');
const express = require('express');
const mongo = require('mongodb');
const bodyparser = require('body-parser');
const BSON = require('bson').BSONPure;
var path = require('path');
var MongoClient = mongo.MongoClient;
var Server = mongo.Server;
var expressapp = express();
var mongoUrl;
var mongoPort;
var roadMapIdTemp;
var db;
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
expressapp.use(function(req,res,next){
    res.setTimeout(5000, function(){
        console.log('time out..');
        res.sendStatus(408);
    });
    next();
});
expressapp.use(express.static(path.join(__dirname+"/../", 'console')));
const port = 3000;

expressapp.set('port', port);


expressapp.post('/post_db', function(req, res){
    connectDB(req.body, 'source', 'recipes', 'save', res);
});
expressapp.post('/run_db', function(req, res){
    connectDB(req.body, 'source', 'execute', 'run', res);
    setTimeout(function () {
        payloads[0]['messages']='{"roadMapId":"'+roadMapIdTemp+'"}';
        payloads[0]['topic']='event';
    }, 500);
    setTimeout(function () {
        producer.send(payloads, function (err, data) {
            console.log(payloads);
        });
        producer.on('error', function (err) {
            console.log(err);
        });
    }, 1000);
});
expressapp.post('/kill_db', function(req, res){
    console.log('kill execute...');
    connectDB(req.body, 'source', 'execute', 'kill', res)
});
expressapp.post('/add_broker', function(req, res){
    console.log('add broker...');
    connectDB(req.body, 'connectionData', 'brokerList', 'saveBroker', res);
});
expressapp.post('/add_device', function(req, res){
    console.log('add device...');
    connectDB(req.body, 'connectionData', 'brokerList', 'saveDevice', res);
});
expressapp.post('/find_device', function(req, res){
    console.log('find device...');
    connectDB(req.body, 'connectionData', 'brokerList', 'findDevice', res);
});
expressapp.post('/post_url_settings', function(req, res){
    console.log('setting url...');
    mongoUrl = req.body['mongoUrl'];
    mongoPort = req.body['mongoPort'];
    producer.client.connectionString = req.body['kafkaUrl']+':'+req.body['kafkaPort'];
    if(db){
        db.close();
    }
    MongoClient.connect('mongodb://'+ mongoUrl+'/'+mongoPort, function(err, database) {
        if(err) throw err;
        db = database;
        console.log('connected to mongodb://'+ mongoUrl+'/'+mongoPort);
        response.send("done");
    });
});
expressapp.post('/load_roadmap', function(req, res){
    console.log('load roadmap...');
    connectDB(req.body, 'source', 'recipes', 'findTarget', res);
});
expressapp.post('/get_broker', function(req, res){
    console.log('get broker...');
    connectDB(req.body, 'connectionData', 'brokerList', 'findBroker', res);
});
expressapp.get('/get_brokers', function(req, res){
    console.log('get brokers...');
    connectDB(null, 'connectionData', 'brokerList', 'find', res);
});
expressapp.get('/get_settings', function(req, res){
    console.log('get settings...');
    connectDB(null, 'connectionData', 'settings', 'find', res);
});
expressapp.get('/get_roadmaps', function(req, res){
    console.log('get roadmaps...');
    connectDB(null, 'source', 'recipes', 'find', res);
});
expressapp.get('/get_devices', function(req, res){
    console.log('get devices...');
    connectDB(null, 'connectionData', 'brokerList', 'find', res);
});

var server = expressapp.listen(expressapp.get('port'), function(){
    console.log("start enow console...");
});
function connectDB(source, dbName, collectionName, command, response){
    console.log('connecting to '+mongoUrl+':'+mongoPort+'...');
    console.log('connected!');
    var findDocument = function(callback){
        db.db(dbName).collection(collectionName).find({}).toArray(function(err,result){
            console.log("finding...");
            console.log(result);
            response.send(result);
        });
    };
    var findBroker = function(callback){
        db.db(dbName).collection(collectionName).find({brokerId:source['brokerId']}).toArray(function(err,result){
            response.send(result);
        });
    };

    var findTarget = function(callback){
        var o_id = BSON.ObjectID.createFromHexString(source['_id']);
        db.db(dbName).collection(collectionName).find({_id:o_id}).toArray(function(err,result){
            console.log(result);
            response.send(result);
            o_id = null;
        });
    }

    var findDevice = function(callback){
        db.db(dbName).collection(collectionName).find({deviceId:source['deviceId']}).toArray(function(err,result){
            response.send(result);
        });
    }

    var insertDocument = function(callback){
        var cursor = db.db(dbName).collection(collectionName).find({}).toArray(function(err,result){
            if(result.length!=0){
                roadMapIdTemp = parseInt(result[result.length-1]['roadMapId'])+1;
            }
            else{
                roadMapIdTemp = 1;
            }
            db.db(dbName).collection(collectionName).insertOne({
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
                // callback();
                response.send("done");
            });
        });

    };


    var insertDocumentDevice = function(callback){
        db.db(dbName).collection(collectionName).updateOne({'brokerId':source['brokerId']},{
            '$push' : { 'deviceId': source['deviceId']}
        }, function(err,result){
            response.send("done");
        });
    };

    var insertDocumentBroker = function(callback){
        db.db(dbName).collection(collectionName).count({}, function(err, cnt) {
            db.db(dbName).collection(collectionName).insertOne({
                "brokerNum" : (cnt+1).toString(),
                "brokerId" : source['brokerId'],
                "ipAddress" : source['ipAddress'],
                "port" : source['port'],
                "deviceId" : source['deviceId'],
            },function(err, result){
                response.send("done");
                // callback();
            });
        });
    };

    var deleteDocument = function(callback){
        db.db(dbName).collection(collectionName).deleteOne({
        },function(err, result){
            response.send("done");
            // callback();
        });
    };

    if(command=="save" || command=="run"){
        insertDocument(db, function(){
        });
    }else if(command=="saveBroker"){
        insertDocumentBroker(db, function(){
        });
    }else if(command=="saveDevice"){
        insertDocumentDevice(db, function(){
        });
    }else if(command=="findDevice"){
        findDevice(db, function(){
        });
    }else if(command=="kill"){
        deleteDocument(db,function(){
        });
    }else if(command=="find"){
        findDocument(db, function(){
        });
    }else if(command=="findTarget"){
        findTarget(db, function(){
        });
    }else if(command=="findBroker"){
        findBroker(db, function(){
        });
    }
};
