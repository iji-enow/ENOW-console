const http = require('http');
const express = require('express');
const mongo = require('mongodb');
const fs = require('fs');
const ascoltatori_kafka = require('ascoltatori')
const bodyparser = require('body-parser');
const shell = require('shelljs');
var ascoltatori_mqtt = require('ascoltatori');
var mqtt = require('mqtt');
const BSON = require('bson').BSONPure;
var path = require('path');
var MongoClient = mongo.MongoClient;
var Server = mongo.Server;
var expressapp = express();
const port = 1111;
var mongoStart;
var mongoUrl;
var mongoPort;
var kafkaUrl;
var kafkaPort;
var roadmapNum;
var timeoutLimit,
roadMapIdTemp,
db,
latestOffset,
mqttHost,
mqttPort;
var MyDate = new Date();
var traffic=0;
var trafficPin=0;
var errorRate=0;
var nodeTraffic= new Array(1000);
nodeTraffic.fill(0);
var MyDateString;
var consumer = null;
var kafka = require('kafka-node');
client = new kafka.Client();
producer = new kafka.Producer(client);
process.setMaxListeners(100);
payloads = [
    {
        // topic:'event',
        messages: '',
        partition: 0
    }
];
client.on('error',function(error){
    console.log(error);
});
producer.on('error',function(error){
    console.log(error);
});
// express settings
expressapp.use(bodyparser.json());
// timeout for all response
expressapp.use(function(req,res,next){
    res.setTimeout(20000, function(){
        console.log('time out..');
        // res.sendStatus(408);
        // res.send('NOPE');
    });
    next();
});
expressapp.use(express.static(path.join(__dirname+"/../", 'ENOW-console')));
expressapp.set('port', port);
// save recipe in mongoDB. db:enow, collection:recipes.
expressapp.post('/post_db', function(req, res){
    connectDB(req.body, 'enow', 'recipes', 'save', res);
});
// publish message to kafka.
var sendKafka = function(req, topic, messages){
    payloads[0]['topic'] = topic
    payloads[0]['messages']= JSON.stringify(messages);
    console.log(payloads[0]['messages']);
    setTimeout(function () {
        producer.send(payloads, function (err, data) {
            if(err){
                console.log(err);
            }
        });
        producer.on('error', function (err) {
            console.log(err);
        });
    }, 1000);
}

// mqtt listener. wait for all devices response.
var reserve = function(cb) {
    process.nextTick(function() {
        cb();
    });
}
var makeReserve = function(key, value, res) {
    reserve(function() {
        var obj = new Object();
        var aliveAsk = 0;
        obj['brokerId'] = key;
        connectDB(obj, 'connectionData', 'brokerList', 'findBroker2', null);
        setTimeout(function(){
            if(mqttHost != null){
                var mqclient = mqtt.connect('mqtt://'+mqttHost+':'+mqttPort);
                mqclient.on('connect', function(){
                    mqclient.publish('enow/server0/'+key+'/'+value+'/alive/request', '{"topic":'+'"enow/server0/'+key+'/'+value+'"}');
                    mqclient.subscribe('enow/server0/'+key+'/'+value+'/alive/response');
                })
                var waitAck = setInterval(function(){
                    if(++aliveAsk>3 && mqclient.connected){
                        clearInterval(waitAck);
                        res.write('0');
                        mqclient.end();
                    }
                }, 1000);
                mqclient.on('message', function(topic, message){
                    console.log(topic + ' sent ack.');
                    mqclient.end();
                    res.write('1');
                    clearInterval(waitAck);
                });
            }else{
                res.write('1');
            }
        }, 2000);
    });
}
// run mqtt listener.
expressapp.post('/alive_check', function(req, res){
    var obj = new Object();
    console.log('Running RoadMap!');
    console.log(req.body);
    console.log(req.body['orderNode']);
    setTimeout(function(){
        for(var i=1; i<= Object.keys(req.body['nodeIds']).length ; ++i){
            obj[req.body['nodeIds'][i]['brokerId']] = obj[req.body['nodeIds'][i]['brokerId']] || [];
            if(req.body['nodeIds'][i]['lambda']==false && req.body['orderNode'][0]!=i+""){
                obj[req.body['nodeIds'][i]['brokerId']].push(req.body['nodeIds'][i]['deviceId']);
            }
        }
        for(key in obj){
            for(val in obj[key]){
                //mqtt listener.
                makeReserve(key, obj[key][val], res);
            }
        }
        setTimeout(function(){
            res.end();
        }, 10000)
    }, 3000);
});
// run roadmap.
expressapp.post('/run_db', function(req, res){
    connectDB(req.body, 'enow', 'execute', 'run', res);
    setTimeout(function(){
        var obj = {};
        obj['roadMapId'] = roadmapNum.toString();
        obj['status'] = "start";
        sendKafka(req, 'event', obj);
    }, 3000);
});
// stop roadmap.
expressapp.post('/kill_db', function(req, res){
    console.log('kill execute...');
    var obj = {};
    obj['roadMapId'] = req.body['roadMapId'].toString();
    obj['status'] = "stop";
    sendKafka(req, 'event', obj);
    setTimeout(function(){
        connectDB(req.body, 'enow', 'execute', 'kill', res);
    }, 8000);

});
// add broker to mongoDB. db:connectionData, collection:brokerList.
expressapp.post('/add_broker', function(req, res){
    console.log('add broker...');
    connectDB(req.body, 'connectionData', 'brokerList'
    , 'saveBroker', res);
    sendKafka(req, 'brokerAdd', req.body);
});
// append device to selected broker in mongoDB.
expressapp.post('/add_device', function(req, res){
    console.log('add device...');
    connectDB(req.body, 'connectionData', 'brokerList', 'saveDevice', res);
});
expressapp.post('/delete_device', function(req, res){
    console.log('delete device...');
    connectDB(req.body, 'connectionData', 'brokerList', 'deleteDevice', res);
});
expressapp.post('/find_device', function(req, res){
    console.log('find device...');
    connectDB(req.body, 'connectionData', 'brokerList', 'findDevice', res);
});
expressapp.post('/find_broker', function(req, res){
    console.log('find broker...');
    connectDB(req.body, 'connectionData', 'brokerList', 'findBroker', res);
});
expressapp.post('/delete_broker', function(req, res){
    console.log('delete broker...');
    connectDB(req.body, 'connectionData', 'brokerList', 'deleteBroker', res);
    sendKafka(req, 'brokerSub', req.body);
});
// default settings
expressapp.post('/post_url_settings', function(req, res){
    console.log('setting url...');
    mongoUrl = req.body['mongoUrl'];
    mongoPort = req.body['mongoPort'];
    kafkaUrl = req.body['kafkaUrl'];
    kafkaPort = req.body['kafkaPort'];
    timeoutLimit = req.body['timeoutLimit']*1000;
    console.log("kafkaUrl : "+ kafkaUrl);
    if(kafkaUrl!==undefined){
        client = new kafka.Client(kafkaUrl+':'+kafkaPort);
        producer = new kafka.Producer(client);
    }
    if(db){
        db.close();
    }
    setTimeout(function(){
        MongoClient.connect('mongodb://'+ mongoUrl+'/'+mongoPort, function(err, database) {
            db = database;
            console.log('connected to mongodb://'+ mongoUrl+'/'+mongoPort);
            if(err){
                console.log(err)
                res.send('NO_CONNECT');
            }else{
                res.send("done");
            }
        });
    }, 2000);

});
expressapp.post('/load_roadmap', function(req, res){
    console.log('load roadmap...');
    connectDB(req.body, req.body['db'], req.body['collection'], 'findTarget', res);
});
expressapp.post('/get_broker', function(req, res){
    console.log('get broker...');
    connectDB(req.body, 'connectionData', 'brokerList', 'findBroker', res);
});

// add ca, cert, key file to broker.
expressapp.post('/add_secure', function(req, res){
    var buf1 = new Buffer(req.body['ca'].length);
    var buf2 = new Buffer(req.body['hostCrt'].length);
    var buf3 = new Buffer(req.body['hostKey'].length);
    console.log('add secure...');
    console.log(req.body);
    connectDB(req.body, 'connectionData', 'brokerList', 'addSecure', res);
    buf1.write(req.body['ca']);
    buf2.write(req.body['hostCrt']);
    buf3.write(req.body['hostKey']);
    setTimeout(function(){
        var obj = {};
        obj['brokerId'] = req.body['brokerId'];
        obj['ca'] = buf1;
        obj['hostCrt'] = buf2;
        obj['hostKey'] = buf3;
        setTimeout(function(){
            console.log(obj);
            sendKafka(req, 'sslAdd', obj);
        }, 2000);
    },1000);


});
// delete ca, cert, key file from broker.
expressapp.post('/del_secure', function(req, res){
    console.log('delete secure...');
    connectDB(req.body, 'connectionData', 'brokerList', 'delSecure', res);
    var obj = {};
    obj['brokerId'] = req.body['brokerId'];
    setTimeout(function(){
        sendKafka(req, 'sslSub', obj);
    }, 2000);
});
// get request count for requestChart.
expressapp.get('/get_request', function(req, res){
    console.log('get requests...');
    setTimeout(function(){
        res.send(nodeTraffic);
    }, 1000);
});
// get traffic count for trafficChart.
expressapp.get('/get_traffic', function(req, res){
    console.log('get traffics...');
    setTimeout(function(){
        res.send(traffic.toString());
        setTimeout(function(){
            traffic=0;
            trafficPin =0;
        }, 500);
    }, 1000);
});
// get error count for errorChart.
expressapp.get('/get_error', function(req, res){
    console.log('get error...');
    var obj = {};
    obj['traffic'] = (traffic - trafficPin)+"";
    trafficPin = traffic;
    obj['errorRate'] = errorRate+"";
    res.send(obj);
    setTimeout(function(){
        errorRate=0;
    }, 500);
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
//start storm
expressapp.get('/execute_storm', function(req, res){
    console.log('execute storm...');
    res.send("done");
});
//start mongodb
expressapp.get('/execute_mongodb', function(req, res){
    console.log('execute mongodb...');
    res.send("done");
});
//load all of deviceslist.
expressapp.get('/get_devices', function(req, res){
    console.log('get devices...');
    connectDB(null, 'connectionData', 'brokerList', 'find', res);
});

var server = expressapp.listen(expressapp.get('port'), function(){
    console.log(
        "\n\n\n  ███████╗███╗   ██╗ ██████╗ ██╗    ██╗\
        \n  ██╔════╝████╗  ██║██╔═══██╗██║    ██║  ENOW Started!\
        \n  █████╗  ██╔██╗ ██║██║   ██║██║ █╗ ██║  Connect to 127.0.0.1:1111\
        \n  ██╔══╝  ██║╚██╗██║██║   ██║██║███╗██║\
        \n  ███████╗██║ ╚████║╚██████╔╝╚███╔███╔╝  Version 0.0.1\
        \n  ╚══════╝╚═╝  ╚═══╝ ╚═════╝  ╚══╝╚══╝   Copyright © 2016 ENOW. All rights reserved."
    );
});

function connectDB(source, dbName, collectionName, command, response){
    console.log('connecting to '+mongoUrl+':'+mongoPort+'...'+dbName+'.'+collectionName);
    var findDocument = function(callback){
        if(db){
            db.db(dbName).collection(collectionName).find({}).toArray(function(err,result){
                response.send(result);
            });
        }
        else{
            response.send("NO_CONNECT");
        }
    };
    // find broker for get mqtt url.
    var findBroker_2 = function(callback){
        if(source['brokerId']!='null'){
            db.db(dbName).collection(collectionName).find({brokerId:source['brokerId']}).toArray(function(err,result){
                mqttHost = result[0]['ipAddress'];
                mqttPort = result[0]['port'];
                console.log(result);
            });
        }else{
            mqttHost = mqttPort = null;
        }
    };
    // find broker and load info.
    var findBroker = function(callback){
        db.db(dbName).collection(collectionName).find({brokerId:source['brokerId']}).toArray(function(err,result){
            response.send(result);
        });
    }
    //delete broker
    var deleteBroker = function(callback){
        db.db(dbName).collection(collectionName).deleteOne({'brokerId':source['brokerId']},function(err,result){
            response.send("done");
        });
    }
    // find roadmap.
    var findTarget = function(callback){
        var o_id = BSON.ObjectID.createFromHexString(source['_id']);
        db.db(dbName).collection(collectionName).find({_id:o_id}).toArray(function(err,result){
            response.send(result);
            o_id = null;
        });
    }
    var deleteDevice = function(callback){
        db.db(dbName).collection(collectionName).updateOne({'brokerId':source['brokerId']},{
            '$pull' : { 'deviceId': source['deviceId']}
        }, function(err,result){
            response.send("done");
        });
    }
    var findDevice = function(callback){
        db.db(dbName).collection(collectionName).find({deviceId:source['deviceId']}).toArray(function(err,result){
            response.send(result);
        });
    }
    // run roadmap of save it to mongodb.
    var insertDocument = function(callback){
        var cursor = db.db(dbName).collection(collectionName).find({}).toArray(function(err,result){
            if(result.length!=0){
                roadmapNum = roadMapIdTemp = parseInt(result[result.length-1]['roadMapId'])+1;
            }
            else{
                roadmapNum = roadMapIdTemp = 1;
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
                response.send(roadmapNum.toString());
            });
        });

    };
    // append device to broker.
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
                "ca" : "",
                "hostCrt" : "",
                "hostKey" : ""
            },function(err, result){
                response.send("done");
            });
        });
    };
    var addBrokerSecure = function(callback){
        db.db(dbName).collection(collectionName).updateOne({'brokerId':source['brokerId']},{
            '$set' : { 'ca': source['ca'], 'hostCrt': source['hostCrt'], 'hostKey': source['hostKey']}
        }, function(err,result){
            response.send("done");
        });
    };
    var deleteBrokerSecure = function(callback){
        db.db(dbName).collection(collectionName).updateOne({'brokerId':source['brokerId']},{
            '$set' : { 'ca': "", 'hostCrt': "", 'hostKey': ""}
        }, function(err,result){
            response.send("done");
        });
    };
    var deleteDocument = function(callback){
        db.db(dbName).collection(collectionName).deleteOne({'roadMapId':source['roadMapId']},function(err, result){
            response.send("done");
        });
    };
    switch(command){
        case 'save':
        case 'run':
            insertDocument(db, function(){
            });
            break;
        case 'saveBroker':
            insertDocumentBroker(db, function(){
            });
            break;
        case 'saveDevice':
            insertDocumentDevice(db, function(){
            });
            break;
        case 'deleteDevice':
            deleteDevice(db, function(){
            });
            break;
        case 'deleteBroker':
            deleteBroker(db, function(){
            });
            break;
        case 'findDevice':
            findDevice(db, function(){
            });
            break;
        case 'kill':
            deleteDocument(db,function(){
            });
            break;
        case 'find':
            findDocument(db, function(){
            });
            break;
        case 'findTarget':
            findTarget(db, function(){
            });
            break;
        case 'findBroker':
            findBroker(db, function(){
            });
            break;
        case 'findBroker2':
            findBroker_2(db, function(){
            });
            break;
        case 'addSecure':
            addBrokerSecure(db, function(){
            });
            break;
        case 'delSecure':
            deleteBrokerSecure(db, function(){
            });
            break;
        default:
            break;
        }
};
