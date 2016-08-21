const mongo = require('mongodb');
var MongoClient = mongo.MongoClient;



function startdb(){
	//code from 'ENOW code editor'
	var code = document.getElementById("iframecode").contentWindow['code'];
	//name of sourcecode saved in mongodb
    var name = document.getElementById('nameofcode');
	//connect to mongodb. insert data in 'source' db
    MongoClient.connect('mongodb://localhost/source',function(err,db) {
        var src = document.getElementById('source');
        var name = document.getElementById('nameofcode');
        console.log("start db");
		//insert in mongodb.
        var insertDocument = function(db, callback){
			//insert in 'codes' collection
            db.collection('codes').insertOne({
                "name" : name.value,
                "source" : code
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
