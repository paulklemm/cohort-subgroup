var express = require('express');
var app = express();
var path = require('path');
app.use(express.static(__dirname + '/assets'));
app.get('/', function(request, res){
  res.sendfile(__dirname + '/index.html')
});
app.set('views',__dirname);
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.listen(8000, fcmdunction(){
  console.log("Listening on port 8000...");
});
