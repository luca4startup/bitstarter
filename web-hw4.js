var express = require('express');
var fs = require('fs'); // added for fs read write


var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  // response.send('Hello World 2!');
  var buf = new Buffer (1024) ; // confirm size 
  buf = fs.readFileSync ('index-mapmakers.html') ;
  response.send(buf.toString()) ;
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
