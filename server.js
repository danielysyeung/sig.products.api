var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mongodb = require("mongodb");
var mongoClient = mongodb.MongoClient;
var mongodbUrl = "mongodb://localhost:27017/sigdb";
var httpHeaderAccessControlAllowOrigin = "*";
var httpHeaderAccessControlAllowMethods = "GET, PUT, POST, DELETE, OPTIONS";
var httpHeaderAccessControlAllowHeaders = "Accept, Content-Type";
var db;

app.use(bodyParser.json());

mongoClient.connect(mongodbUrl, function (err, database) {
  if (err) {
    return console.log("Error connecting to mongodb: ", err);
  }
  db = database;
});

app.get("/products", function (req, res) {
  console.log("GET request for /products");
  var fieldProjection = { "_id": 0, "sku": 1, "name": 1, "description": 1, "lastUpdatedTimestamp": 1 };
  var queryBySku;

  // For CORS response.  
  res.setHeader("Access-Control-Allow-Origin", httpHeaderAccessControlAllowOrigin);

  // TODO filtering, sorting, pagination
  if (req.query.sku && req.query.sku.trim()) {
    queryBySku = { "sku": req.query.sku };
  }

  var collection = db.collection("product", function (err, collection) {
    if (err) {
      console.log("Error accessing collection: ", err);
      res.status(500);
      return res.send("");
    }
    collection.find(queryBySku, fieldProjection).toArray(function (err, docs) {
      if (err) {
        console.log("Error querying document: ", err);
        res.status(500);
        return res.send("");
      }
      console.log("Found " + docs.length + " documents.");
      res.status(200);
      return res.send(docs);
    });
  });
});

app.get("/products/:sku", function (req, res) {
  console.log("GET request for /products/");
  var queryBySku = { "sku": req.params.sku };
  var fieldProjection = { "_id": 0, "sku": 1, "name": 1, "description": 1, "lastUpdatedTimestamp": 1 };

  // For CORS response.
  res.setHeader("Access-Control-Allow-Origin", httpHeaderAccessControlAllowOrigin);

  var collection = db.collection("product", function (err, collection) {
    if (err) {
      console.log("Error accessing collection: ", err);
      res.status(500);
      return res.send("");
    }
    collection.findOne(queryBySku, fieldProjection, function (err, doc) {
      if (err) {
        console.log("Error querying document: ", err);
        res.status(500);
        return res.send("");
      }
      if (!doc) {
        res.status(404);
        return res.send("");
      }
      res.status(200);
      return res.send(doc);
    });
  });
});

app.post("/products", function (req, res) {

  console.log("POST request for /products");
  var body = req.body;
  console.log("%j", req.body);

  // For CORS response.
  res.setHeader("Access-Control-Allow-Origin", httpHeaderAccessControlAllowOrigin);

  if (!req.body.sku || !req.body.sku.trim() || !req.body.name || !req.body.name.trim()) {
    res.status(400);
    return res.send("");
  }

  var keyDoc = { "sku": req.body.sku };
  var valueDoc = { "sku": req.body.sku, "name": req.body.name, "description": req.body.description }
  var collection = db.collection("product", function (err, collection) {
    if (err) {
      console.log("Error accessing collection: ", err);
      res.status(500);
      return res.send("");
    }
    collection.updateOne(keyDoc, { $set: valueDoc, "$currentDate": { "lastUpdatedTimestamp": true } }, { "upsert": true }, function (err, result) {
      if (err) {
        console.log("Error upserting document: ", err);
        res.status(500);
        return res.send("");
      }
      res.location("/products/" + req.body.sku);
      res.status(201);
      return res.send("");
    });
  });
});

app.put("/products/:sku", function (req, res) {
  console.log("PUT request for /products/");
  var body = req.body;
  console.log("%j", req.body);

  // For CORS response.
  res.setHeader("Access-Control-Allow-Origin", httpHeaderAccessControlAllowOrigin);

  if (!req.body.sku || !req.body.sku.trim() || !req.body.name || !req.body.name.trim()) {
    res.status(400);
    return res.send("");
  }

  var queryBySku = { "sku": req.params.sku };
  var valueDoc = { "sku": req.body.sku, "name": req.body.name, "description": req.body.description }
  var collection = db.collection("product", function (err, collection) {
    if (err) {
      console.log("Error accessing collection: ", err);
      res.status(500);
      return res.send("");
    }
    collection.findOne(queryBySku, function (err, doc) {
      if (err) {
        console.log("Error querying document: ", err);
        res.status(500);
        return res.send("");
      }
      if (!doc) {
        res.status(404);
        return res.send("");
      }
      collection.updateOne(queryBySku, { $set: valueDoc, "$currentDate": { "lastUpdatedTimestamp": true } }, { "upsert": true }, function (err, result) {
        if (err) {
          console.log("Error upserting document: ", err);
          res.status(500);
          return res.send("");
        }
        res.status(204);
        return res.send("");
      });
    });
  });
});

app.delete("/products/:sku", function (req, res) {
  console.log("DELETE request for /products/");
  var queryBySku = { "sku": req.params.sku };

  // For CORS response.
  res.setHeader("Access-Control-Allow-Origin", httpHeaderAccessControlAllowOrigin);

  var collection = db.collection("product", function (err, collection) {
    if (err) {
      console.log("Error accessing collection: ", err);
      res.status(500);
      return res.send("");
    }
    collection.findOne(queryBySku, function (err, doc) {
      if (err) {
        console.log("Error querying document: ", err);
        res.status(500);
        return res.send("");
      }
      if (!doc) {
        res.status(404);
        return res.send("");
      }
      collection.remove(queryBySku, { "justOne": true }, function (err, result) {
        if (err) {
          console.log("Error removing document: ", err);
          res.status(500);
          return res.send("");
        }
        res.status(200);
        return res.send("");
      });
    });
  });
});

// For cross-origin resource sharing (CORS) pre-flight requests.
// Browsers skip pre-flight requests if requests is GET, HEAD, or POST and with regular headers like Accept, Content-Type, etc.
app.options("/products", function (req, res) {
  console.log("OPTIONS request for /products");
  res.setHeader("Access-Control-Allow-Origin", httpHeaderAccessControlAllowOrigin);
  res.setHeader("Access-Control-Allow-Methods", httpHeaderAccessControlAllowMethods);
  res.setHeader("Access-Control-Allow-Headers", httpHeaderAccessControlAllowHeaders);
  res.status(200);
  return res.send("");
});

app.options("/products/:sku", function (req, res) {
  console.log("OPTIONS request for /products/");
  res.setHeader("Access-Control-Allow-Origin", httpHeaderAccessControlAllowOrigin);
  res.setHeader("Access-Control-Allow-Methods", httpHeaderAccessControlAllowMethods);
  res.setHeader("Access-Control-Allow-Headers", httpHeaderAccessControlAllowHeaders);
  res.status(200);
  return res.send("");
});

var port = process.env.PORT || 8081;
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Products API WebApp is listening at http://%s:%s", host, port);
});