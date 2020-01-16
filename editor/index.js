var express = require("express");
var app = express();
var port = process.env.EDITOR_PORT;
// Serve all the files in '/dist' directory
// app.use(express.static("dist"));

// Handle a get request to an api route
app.use("/", express.static("dist"));
app.get("/config", function(req, res) {
  res.send({
    api: process.env.HOST
  });
});
app.listen(port, function() {
  console.log("CMSSIMPLE EDITOR listening on port" + port + "!");
});
