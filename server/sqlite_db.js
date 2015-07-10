/**
 * Created by yarden on 7/9/15.
 */
var sqlite = require('sqlite3');

var DB_FILE = 'cg.sqlite';
var DB_DIR = process.env.GG_DIR || '../data';

//debugging
sqlite.verbose();


var db = new sqlite.Database(DB_DIR_+ '/' + DB_FILE);

function kb(req, res, next) {
  var stmt = db.run('select id, category, system, name specific from kb', function(err, rows) {

  });
}

function query(req, res, next) {
}

exports.kb = kb;
exports.query = query;
