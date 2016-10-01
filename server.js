var express = require("express");
var app = express();
var mongodb = require("mongodb");
var mongoClient = mongodb.MongoClient;
var mongodbUrl = "mongodb://localhost:27017/sigdb";
var db;

mongoClient.connect(mongodbUrl, function(err, database) {  
  if (err) { 
    return console.log("Error connecting to mongodb: ", err); 
  } else {
    db = database;  
  }
});

app.get("/", function(req, res) {
  console.log("Got a GET request for the Products API");
  res.status(200);
  res.send("Welcome to SIG Products API!");
});

app.get("/products", function(req, res) {
  console.log("Got a GET request for /products");  
  var fieldProjection = { "_id":0, "sku":1, "name":1, "description":1, "lastUpdatedTimestamp":1 };
  var queryBySku;  
  var queryResult;
  
  if (req.query.sku && req.query.sku.trim()) {
    queryBySku = { "sku":req.query.sku };  
  } 
  
  var collection = db.collection("product", function(err, collection) {
    if (err) {
	  console.log("Error accessing collection: ", err);
	} else {
	  collection.find(queryBySku, fieldProjection).toArray(function(err, docs) {
        if (err) {
	      console.log("Error querying document: ", err);
	    } else {
		  console.log("Found " + docs.length + " documents.");
		  res.status(200);
		  res.send(docs);
        } 
	  })
	}
  });      
});

app.get("/products/:sku", function(req, res) {   
  console.log("Got a GET request for /products/");
  var queryBySku = { "sku":req.params.sku };  
  var fieldProjection = { "_id":0, "sku":1, "name":1, "description":1, "lastUpdatedTimestamp":1 };
  var queryResult;
  var collection = db.collection("product", function(err, collection) {
    if (err) {
	  console.log("Error accessing collection: ", err);
	} else {
	  collection.findOne(queryBySku, fieldProjection, function(err, doc) {
        if (err) {
	      console.log("Error querying document: ", err);
	    } else {
		  res.status(200);
		  res.send(doc);
        } 
	  })
	}
  });      
});

app.post("/products", function(req, res) {
  console.log("Got a POST request for /products");
  var collection = db.collection("product", function(err, collection) {
    if (err) {
	  console.log("Error accessing collection: ", err);
	}
  });  
  collection.updateOne(
    { "sku":"10006" },
	{ $set:{ "sku":"10006", "name":"product 10006", "description":"product description 10006yyy" }, "$currentDate":{ "lastUpdatedTimestamp":true } },
	{ "upsert":true },
	function(err, result) {
	  if (err) {
	    console.log("Error upserting document: ", err);
	  } else {
	    res.status(201);
	    res.send("");
      }
	}
  );  
});

app.put("/products/:sku", function(req, res) {
  console.log("Got a PUT request for /products/");
  var sku = req.params.sku;
  res.send("Hello PUT /products/ for sku=" + sku);
});

app.delete("/products/:sku", function (req, res) {
  console.log("Got a DELETE request for /products/");
  var sku = req.params.sku;
  res.send("Hello DELETE /products/ for sku=" + sku);
});

var port = process.env.PORT || 8080;
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Products API App Listening at http://%s:%s", host, port);
});