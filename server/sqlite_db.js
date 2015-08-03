/**
 * Created by yarden on 7/9/15.
 */
var sqlite = require('sqlite3');

var DB_FILE = 'cg.sqlite';
var DB_DIR = process.env.CG_DIR || '../data';

//debugging
sqlite.verbose();

var db = new sqlite.Database(DB_DIR+ '/' + DB_FILE);
db.on('profile', function(sql, time) {
  console.log('['+time/1000+' secs] query:'+sql);
});


function population(req, res, next) {
  res.sendfile('data/population.csv');
}

function kb(req, res, next) {
  db.serialize(function() {
    db.all('select id, category, name, system, details from kb', function(err, rows) {
      if (err) next(err);
      res.send(JSON.stringify(rows));
    });
  });
}

function info(req, res, next) {
  var query;
  if (req.params.topic == 'pathogens') query = 'select name from pathogen_info';
  else if (req.params.topic == 'detectors') query = 'select name from detector_info';
  else next(new Error('unknown table ['+req.params.topic+']'));

  db.all(query, function(err, rows) {
    if (err) next(err);
    res.send(JSON.stringify(rows));
  });
}

function pathogens(req, res, next) {
  var list = req.body.names;
  var from = req.body.from;
  var to = req.body.to;

  var data = [];
  var n = 0;

  var stmt = db.prepare(
    'select enc_id, date, positive from pathogens, encounter ' +
    ' where pathogens.path_id = (select id from pathogen_info where name = ?) ' +
    ' and enc_id = encounter.id ' +
    ' and encounter.date between ? and ?' +
    ' order by date');

  db.parallelize(function() {
    list.forEach(function(pathogen) {
      stmt.all(pathogen, from, to,
        function(err, rows) {
          if (err) next(err);
          data.push({name: pathogen, rows: rows});
          n++;
          if (n == list.length) {
            console.log('done '+ data);
            res.send(JSON.stringify(data));
          }
      });
    });
  });
}

function detectors(req, res, next) {
  var list = req.body.names;
  var from = req.body.from;
  var to = req.body.to;

  var data = [];
  var n = 0;

  var stmt = db.prepare(
    'select enc_id as id, prob, similar from detectors, encounter ' +
    ' where detectors.did = (select id from detector_info where name = ?) ' +
    ' and enc_id = encounter.id ' +
    ' and encounter.date between ? and ? ' +
    ' order by enc_id');

  db.parallelize(function() {
    list.forEach(function(detector) {
      stmt.all(detector, from, to,
        function(err, rows) {
          if (err) next(err);
          data.push({name: detector, rows: rows});
          n++;
          if (n == list.length) {
            res.send(JSON.stringify(data));
          }
        });
    });
  });
}

function query(req, res, next) {
  var query = req.query;

  var associations;
  var enc;
  var from = query.from;
  var to = query.to;

  var enc_stmt = db.prepare('select id, date, age, zipcode from encounter where date between ? and ?');
  var association_stmt = db.prepare('select enc_id, tag_id from enc_tag, encounter where encounter.date between ? and ? and enc_id = encounter.id');

  db.serialize(function() {
    enc_stmt.all(from, to,
      function(err, rows) {
        enc = rows;
      }
    );

    association_stmt.all(query.from, query.to,
      function(err, rows) {
        associations = rows;
        res.send(JSON.stringify({enc: enc, associations: associations}));
      });
  });


}

exports.kb = kb;
exports.query = query;
exports.population = population;
exports.info = info;
exports.pathogens = pathogens;
exports.detectors = detectors;