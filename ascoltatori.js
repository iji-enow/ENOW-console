var ascoltatori_mqtt = require('ascoltatori');
var ascoltatori_kafka = require('ascoltatori');
var mqtt = require('mqtt')
var fs = require('fs')

var KEY = fs.readFileSync('/Users/leegunjoon/Documents/downloadSpace/tools/TLS/iui-MacBook-Air.local.key')
var CERT = fs.readFileSync('/Users/leegunjoon/Documents/downloadSpace/tools/TLS/iui-MacBook-Air.local.crt')
var TRUSTED_CA_LIST = fs.readFileSync('/Users/leegunjoon/Documents/downloadSpace/tools/TLS/ca.crt')

var options = {
  key: KEY,
  cert: CERT,
  rejectUnauthorized: true,
  // The CA list will be used to determine if server is authorized
  ca: TRUSTED_CA_LIST
}

var settings_mqtt = {
  type: 'mqtt',
  // set 'true' if input type is json type
  json: false,
  mqtt: require('mqtt'),
  // must use 'http://'
  url: 'mqtt://127.0.0.1:1883'
};

var settings_kafka = {
  type: 'kafka',
  json: false,
  kafka: require('kafka-node'),
  //connectString: "192.168.0.3:2181",
  connectString: "127.0.0.1:2181",
  clientId: "ascoltatori",
  groupId: "ascoltatori",
  defaultEncoding: "utf8",
  encodings: {
    image: "buffer"
  }
};

var client = mqtt.connect('mqtt://localhost:8883',options)

client.subscribe('enow/+/+/+/order')

client.on('message', function (topic, message) {
  //console.log(message.toString())
  console.log(arguments[0]);
  var topicName = JSON.stringify(arguments[0]);
  ascoltatori_kafka.build(settings_kafka, function (err, ascoltatori_kafka){
    var arr = topicName.substring(1,topicName.length -1).split("/");
    var corporationName = arr[0];
    var serverId = arr[1];
    var brokerId = arr[2];
    var deviceId = arr[3];
    var kafkaTopic = arr[4];

    var str = "{\"corporationName\":\"" + corporationName + "\",\"serverId\":\"" + serverId + "\",\"brokerId\":\"" +  brokerId  + "\",\"deviceId\":\"" + deviceId + "\",\"kafkaTopic\":\"" + kafkaTopic + "\",\"payload\":\"" + message + "\"}"
    var jsonObj = JSON.parse(str);

      ascoltatori_kafka.publish('order', JSON.stringify(jsonObj), function() {
        console.log('message published');
      });
    });
})



ascoltatori_mqtt.build(settings_mqtt, function (err, ascoltatori_mqtt){
  ascoltatori_mqtt.subscribe('enow/+/+/+/tmp', function(topic,message) {
    console.log(arguments[0]);
    var topicName = JSON.stringify(arguments[0]);
    ascoltatori_kafka.build(settings_kafka, function (err, ascoltatori_kafka){
      var arr = topicName.substring(1,topicName.length -1).split("/");
      var corporationName = arr[0];
      var serverId = arr[1];
      var brokerId = arr[2];
      var deviceId = arr[3];
      var kafkaTopic = arr[4];

      var str = "{\"corporationName\":\"" + corporationName + "\",\"serverId\":\"" + serverId + "\",\"brokerId\":\"" +  brokerId  + "\",\"deviceId\":\"" + deviceId + "\",\"kafkaTopic\":\"" + kafkaTopic + "\",\"payload\":\"" + message + "\"}"
      var jsonObj = JSON.parse(str);
      ascoltatori_kafka.publish('order', JSON.stringify(jsonObj), function() {
        console.log('message published');
      });
    });
  });
});


/*
ascoltatori_mqtt.build(settings_mqtt, function (err, ascoltatori_mqtt){
  ascoltatori_mqtt.subscribe('test', function(topic,message) {
    console.log(arguments);
    ascoltatori_kafka.build(settings_kafka, function (err, ascoltatori_kafka){
      ascoltatori_kafka.publish('test', message, function() {
        console.log('message published');
      });
    });
  });
});
*/

/*
ascoltatori_kafka.build(settings_kafka, function (err, ascoltatori_kafka){
  ascoltatori_kafka.subscribe('onlytest', function(topic, message) {
    console.log(arguments);
    ascoltatori_mqtt.build(settings_mqtt, function (err, ascoltatori_mqtt){
      ascoltatori_mqtt.publish('onlytest', message, function() {
        console.log('message published');
      });
    });
  });
});
*/

/*
ascoltatori_kafka.build(settings_kafka, function (err, ascoltatori_kafka){
  ascoltatori_kafka.subscribe('webhook', function(topic, message) {
    console.log(arguments);
    var options = {
      uri: 'https://hooks.slack.com/services/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',
      method: 'POST',
      json: {
        "text": message
      }
    };
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body.id) // Print the shortened url.
      }
    });
  });
});
