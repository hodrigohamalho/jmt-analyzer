var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  bodyParser = require('body-parser');
  cors = require('./src/routes/cors');

app.listen(port);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var crawler = require('./src/routes/crawler.js');
crawler(app);

console.log('Server started on: ' + port);

module.exports = app
