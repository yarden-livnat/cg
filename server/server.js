/**
 * Created by yarden on 7/9/15.
 */
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('./sqlite_db');


var app = express();

var app_dir = path.join(__dirname, '../app');

app.set('port', process.env.PORT || 4000);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(logErrors);

app.use(express.static(app_dir));
app.use(express.static(app_dir+'/lib'));
//app.use(express.static(app_dir+'/src'));

app.get(function(req, res) {
  console.log('called');
});

app.get('/data/kb', db.kb);
app.get('/data/population', db.population);
app.get('/info/:topic', db.info);
app.get('/query', db.query);

app.post('/pathogens', db.pathogens);
app.post('/detectors', db.detectors);

app.use(function(err, req, res, next) {
  console.error(err.stack);
  next(err);
});

app.listen(app.get('port'), function() {
  console.log('CG server listening on port '+app.get('port'));
});

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}


