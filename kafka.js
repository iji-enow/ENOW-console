/*
    Basic producer to send data to kafka from nodejs.
    More Information Here : https://www.npmjs.com/package/kafka-node
*/

//    Using kafka-node - really nice library
//    create a producer and connect to a Zookeeper to send the payloads.
var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    client = new kafka.Client('127.0.0.1:2181'),
    producer = new Producer(client);

    /*
        Creating a payload, which takes below information
        'topic'     -->    this is the topic we have created in kafka. (test)
        'messages'     -->    data which needs to be sent to kafka. (JSON in our case)
        'partition' -->    which partition should we send the request to. (default)

                        example command to create a topic in kafka:
                        [kafka@kafka kafka]$ bin/kafka-topics.sh \
                                    --create --zookeeper localhost:2181 \
                                    --replication-factor 1 \
                                    --partitions 1 \
                                    --topic test

                        If there are multiple partition, then we optimize the code here,
                        so that we send request to different partitions.

    */
    payloads = [
        { topic: 'test', messages: 'This is the First Message I am sending', partition: 0 },
    ];


//    producer 'on' ready to send payload to kafka.
producer.on('ready', function(){
    producer.send(payloads, function(err, data){
        console.log(data)
    });
});

producer.on('error', function(err){});
