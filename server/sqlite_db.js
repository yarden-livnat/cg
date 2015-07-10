/**
 * Created by yarden on 7/9/15.
 */
var sqlite = require('sqlite3');

var DB_FILE = 'cg.sqlite';
var DB_DIR = process.env.CG_DIR || '../data';

//debugging
sqlite.verbose();

var db = new sqlite.Database(DB_DIR+ '/' + DB_FILE);

function kb(req, res, next) {
  db.serialize(function() {
    db.all('select id, category, system, name, specific from kb', function(err, rows) {
      if (err) next(err);
      res.send(JSON.stringify(rows));
    });
  });
}

function query(req, res, next) {
}

exports.kb = kb;
exports.query = query;
