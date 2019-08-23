// index.js

var express = require("express");
const fetch = require("node-fetch");

var app = express();
var endpoint = "https://restcountries.eu/rest/v2/";

app.use("/", function(req, res) {
  var resource = endpoint + req.url.slice(5);
  fetch(resource)
    .then(data => data.json())
    .then(data => res.status(200).send(data));
});

// serve static files from current directory
app.use(express.static(__dirname + "/"));

var server = app.listen(3001);
