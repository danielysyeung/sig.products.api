var express = require('express');
var app = express();

app.get('/', function (req, res) {
   console.log("Got a GET request for the Products API");
   res.send('Hello GET');
});

app.get('/products', function (req, res) {
   console.log("Got a GET request for /products");

   var sku = req.param('sku');

   res.send('Hello GET /products for sku=' + sku);
});

app.get('/products/:sku', function(req, res) {   
   console.log("Got a GET request for /products/");
   res.send('Hello GET /products/ for sku=' + req.params.sku);
});

app.post('/products', function (req, res) {
   console.log("Got a POST request for /products");
   res.send('Hello POST /products');
});

app.put('/products/:sku', function (req, res) {
   console.log("Got a PUT request for /products/");
   res.send('Hello PUT /products/ for sku=' + req.params.sku);
});

app.delete('/products/:sku', function (req, res) {
   console.log("Got a DELETE request for /products/");
   res.send('Hello DELETE /products/ for sku=' + req.params.sku);
});

var server = app.listen(8081, function () {

   var host = server.address().address;
   var port = server.address().port;

   console.log("Products API App Listening at http://%s:%s", host, port);
});