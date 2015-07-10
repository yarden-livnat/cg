/**
 * Created by yarden on 7/9/15.
 */
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var db = require('./sqlite_db');


var app = express();

var app_dir = path.join(__dirname, '../app');

app.set('port', process.env.PORT || 3000);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(app_dir));

app.get('/kb', db.kb);
app.get('/query', db.query);

app.listen(app.get('port'), function() {
  console.log('CG server listening on port '+app.get('port'));
});

