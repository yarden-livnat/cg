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
