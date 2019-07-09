var express = require('express');
var app = express();
// var fs = require('fs');

// app.get('/', function (req, res) {
//   // let file = fs.readFileSync('index.html');
//   res.sendFile('/home/sergey/Documents/localhost/index.html');
// });

app.use('/', express.static('dist'));

app.listen(3001, function () {
});
// app.get('/renault-landing/build/main.html', function (req, res) {
//   // let file = fs.readFileSync('index.html');
//   res.sendFile('/home/sergey/Documents/localhost/renault-landing/build/main.html');
// });

