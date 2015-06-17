var express = require('express');
var app = express();
app.get('/', function(request, res){
  res.render('index.html')
});
app.set('views',__dirname);
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.listen(8000, function(){
  console.log("Listening on port 8000...");
});
