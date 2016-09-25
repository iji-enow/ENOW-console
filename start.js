const http = require('http');
const express = require('express');
const mongo = require('mongodb');
const fs = require('fs');
const bodyparser = require('body-parser');
var ascoltatori_mqtt = require('ascoltatori'),
ascoltatori_kafka = require('ascoltatori');
var mqtt = require('mqtt');
const BSON = require('bson').BSONPure;
var path = require('path');
var MongoClient = mongo.MongoClient;
var Server = mongo.Server;
var expressapp = express();
var mongoUrl;
var mongoPort;
var kafkaUrl;
var kafkaPort;
var roadMapIdTemp;
var db;
var latestOffset;
var MyDate = new Date();
var MyDateString;
var consumer;
var kafka = require('kafka-node'),
Producer = kafka.Producer,
Consumer = kafka.Consumer,
client = new kafka.Client(),
producer = new Producer(client),
payloads = [
    {
        topic:'event',
        messages: '',
        partition: 0
    }
],
offset = new kafka.Offset(client);
//make server starts from latest logs
offset.fetchLatestOffsets(['log'], function (error, offsets) {
    if (error)
    return handleError(error);
    console.log('start from...\n\tkafka topic: log\n\toffset : '+offsets['log'][0]);
    latestOffset = offsets['log'][0];
    consumer = new Consumer(
        client,
        [
            {
                topic: 'log',
                partition: 0,
                offset: latestOffset
            }
        ],
        {
            autoCommit: false,
            fromOffset: true

        }
    );
    consumer.on('message', function (message) {
        MyDate = new Date();
        MyDate.setDate(MyDate.getDate() + 20);
        MyDateString = MyDate.getFullYear() + '/'
        +('0' + MyDate.getMonth()).slice(-2) + '/'
        +('0' + MyDate.getDate()).slice(-2) + '   '
        +('0' + MyDate.getHours()).slice(-2) + ':'
        +('0' + MyDate.getMinutes()).slice(-2) + ':'
        +('0' + MyDate.getSeconds()).slice(-2);
        console.log(MyDateString+"   "+JSON.stringify(message));
        fs.appendFile('.log', '['+MyDateString+']  '+ JSON.stringify(message)+'\r\n', 'utf8', function(err) {
        });
    });
});

















//
// var KEY;
// var CERT;
// var TRUSTED_CA_LIST;
//
// var options = {
//     key: KEY,
//     cert: CERT,
//     rejectUnauthorized: true,
//     // The CA list will be used to determine if server is authorized
//     ca: TRUSTED_CA_LIST
// }
//
// var settings_mqtt = {
//     type: 'mqtt',
//     // set 'true' if input type is json type
//     json: false,
//     mqtt: require('mqtt'),
//     url: 'mqtt://127.0.0.1:1883'
// };
//
// var settings_kafka = {
//     type: 'kafka',
//     json: false,
//     kafka: require('kafka-node'),
//     //connectString: "192.168.0.3:2181",
//     connectString: "127.0.0.1:2181",
//     clientId: "ascoltatori",
//     groupId: "ascoltatori",
//     defaultEncoding: "utf8",
//     encodings: {
//         image: "buffer"
//     }
// };

// var client = mqtt.connect('mqtt://localhost:8883',options);
// client.subscribe('enow/+/+/+/order');
//
// client.on('message', function (topic, message) {
//     //console.log(message.toString())
//     console.log(arguments[0]);
//     var topicName = JSON.stringify(arguments[0]);
//     ascoltatori_kafka.build(settings_kafka, function (err, ascoltatori_kafka){
//         var arr = topicName.substring(1,topicName.length -1).split("/");
//         var corporationName = arr[0];
//         var serverId = arr[1];
//         var brokerId = arr[2];
//         var deviceId = arr[3];
//         var kafkaTopic = arr[4];
//
//         var str = "{\"corporationName\":\"" + corporationName + "\",\"serverId\":\"" + serverId + "\",\"brokerId\":\"" +  brokerId  + "\",\"deviceId\":\"" + deviceId + "\",\"kafkaTopic\":\"" + kafkaTopic + "\",\"payload\":\"" + message + "\"}"
//         var jsonObj = JSON.parse(str);
//
//         ascoltatori_kafka.publish('order', JSON.stringify(jsonObj), function() {
//             console.log('message published');
//         });
//     });
// });
//
// ascoltatori_mqtt.build(settings_mqtt, function (err, ascoltatori_mqtt){
//     ascoltatori_mqtt.subscribe('enow/+/+/+/tmp', function(topic,message) {
//         console.log(arguments[0]);
//         var topicName = JSON.stringify(arguments[0]);
//         ascoltatori_kafka.build(settings_kafka, function (err, ascoltatori_kafka){
//             var arr = topicName.substring(1,topicName.length -1).split("/");
//             var corporationName = arr[0];
//             var serverId = arr[1];
//             var brokerId = arr[2];
//             var deviceId = arr[3];
//             var kafkaTopic = arr[4];
//             var str = "{\"corporationName\":\"" + corporationName + "\",\"serverId\":\"" + serverId + "\",\"brokerId\":\"" +  brokerId  + "\",\"deviceId\":\"" + deviceId + "\",\"kafkaTopic\":\"" + kafkaTopic + "\",\"payload\":\"" + message + "\"}"
//             var jsonObj = JSON.parse(str);
//             ascoltatori_kafka.publish('order', JSON.stringify(jsonObj), function() {
//                 console.log('message published');
//             });
//         });
//     });
// });






















expressapp.use(bodyparser.json());
expressapp.use(function(req,res,next){
    res.setTimeout(5000, function(){
        console.log('time out..');
        res.sendStatus(408);
    });
    next();
});
expressapp.use(express.static(path.join(__dirname+"/../", 'console')));
const port = 1111;
expressapp.set('port', port);

expressapp.post('/post_db', function(req, res){
    connectDB(req.body, 'enow', 'recipes', 'save', res);
});
expressapp.post('/run_db', function(req, res){
    console.log('Running RoadMap!');
    connectDB(req.body, 'enow', 'execute', 'run', res);
    payloads[0]['messages']='{"roadMapId":"'+roadMapIdTemp+'"}';
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
    connectDB(req.body, 'enow', 'execute', 'kill', res)
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
    kafkaUrl = req.body['kafkaUrl'];
    kafkaPort = req.body['kafkaPort'];
    producer.client.connectionString = kafkaUrl+':'+kafkaPort;
    if(db){
        db.close();
    }
    MongoClient.connect('mongodb://'+ mongoUrl+'/'+mongoPort, function(err, database, callback) {
        if(err){
            console.log(err);
            res.send('no_connect');
            return;
        }
        db = database;
        console.log('connected to mongodb://'+ mongoUrl+'/'+mongoPort);
        res.send("done");
    });
});
expressapp.post('/load_roadmap', function(req, res){
    console.log('load roadmap...');
    console.log(req.body['db']);
    connectDB(req.body, req.body['db'], req.body['collection'], 'findTarget', res);
    // connectDB(req.body, 'enow', 'recipes', 'findTarget', res);
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
    connectDB(null, 'enow', 'recipes', 'find', res);
});
expressapp.get('/get_running_roadmaps', function(req, res){
    console.log('get running roadmaps...');
    connectDB(null, 'enow', 'execute', 'find', res);
});


expressapp.get('/get_devices', function(req, res){
    console.log('get devices...');
    connectDB(null, 'connectionData', 'brokerList', 'find', res);
});

var server = expressapp.listen(expressapp.get('port'), function(){
    console.log("\n\n\n");
    console.log(
        "  ███████╗███╗   ██╗ ██████╗ ██╗    ██╗\
        \n  ██╔════╝████╗  ██║██╔═══██╗██║    ██║  ENOW Started!\
        \n  █████╗  ██╔██╗ ██║██║   ██║██║ █╗ ██║  Connect to 127.0.0.1:1111\
        \n  ██╔══╝  ██║╚██╗██║██║   ██║██║███╗██║\
        \n  ███████╗██║ ╚████║╚██████╔╝╚███╔███╔╝  Version 0.0.1\
        \n  ╚══════╝╚═╝  ╚═══╝ ╚═════╝  ╚══╝╚══╝   Copyright © 2016 ENOW. All rights reserved.");
    });
    function connectDB(source, dbName, collectionName, command, response){
        console.log('connecting to '+mongoUrl+':'+mongoPort+'...'+dbName+'.'+collectionName);
        console.log('connected!');
        var findDocument = function(callback){
            db.db(dbName).collection(collectionName).find({}).toArray(function(err,result){
                response.send(result);
            });
        };
        var findBroker = function(callback){
            db.db(dbName).collection(collectionName).find({brokerId:source['brokerId']}).toArray(function(err,result){
                response.send(result);
            });
        };

        var findTarget = function(callback){
            console.log("abcd");
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
                    "orderNode" : source['orderNode'],
                    "initNode" : source['initNode'],
                    "lastNode" : source['lastNode'],
                    "incomingNode" : source['incomingNode'],
                    "outingNode" : source['outingNode'],
                    "isInput" : source['isInput'],
                    "isOutput" : source['isOutput'],
                    "nodeIds" : source['nodeIds']
                },function(err, result){
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
                });
            });
        };

        var deleteDocument = function(callback){
            db.db(dbName).collection(collectionName).deleteOne({
            },function(err, result){
                response.send("done");
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
            console.log("qwertty");
            findTarget(db, function(){
            });
        }else if(command=="findBroker"){
            findBroker(db, function(){
            });
        }
    };
