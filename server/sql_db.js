/**
 * Created by yarden on 1/9/17.
 */

var sql = require('mssql');

var config = {
  user: "cg",
  password: 'cg4va', //process.env.CG_PASS,
  server: 'wings.sci.utah.edu',
  port:1433
  // database: 'BasicTracks'
};


var config1 = "mssql://cg:cg4va@wings.sci.utah.edu:1433/";
var test = new sql.Connection(config, function(err) {
  if (err) console.log('sql connection error:', err);
  else console.log('connected');
});


function population(req, res, next) {
  res.sendfile('data/population.csv');
}

function kb(req, res, next) {
  sql.connect(config1).then(function() {
    new sql.Request()
      .query('select id, category, name, system, details from common_ground.kb').then(function(rows) {
        // console.log('kb:'+rows);
        res.send(JSON.stringify(rows));
    }).catch(function(err) {
      console.log('kb err:', err);
      next(err);
    });
  }).catch(function(err) {
    console.log('connection error:', err);
    next(err);
  });
}

function info(req, res, next) {
  res.send(JSON.stringify([]));
  // var query;
  // if (req.params.topic == 'pathogens') query = 'select name from pathogen_info';
  // else if (req.params.topic == 'detectors') query = 'select name from detector_info';
  // else next(new Error('unknown table ['+req.params.topic+']'));
  //
  // db.all(query, function(err, rows) {
  //   if (err) next(err);
  //   res.send(JSON.stringify(rows));
  // });
}

function pathogens(req, res, next) {
  res.send(JSON.stringify([]));

  // var list = req.body.names;
  // var from = req.body.from;
  // var to = req.body.to;
  //
  // var data = [];
  // var n = 0;
  //
  // var stmt = db.prepare(
  //   'select enc_id, date, positive from pathogens, encounter ' +
  //   ' where pathogens.path_id = (select id from pathogen_info where name = ?) ' +
  //   ' and enc_id = encounter.id ' +
  //   ' and encounter.date between ? and ?' +
  //   ' order by date');
  //
  // db.parallelize(function() {
  //   list.forEach(function(pathogen) {
  //     stmt.all(pathogen, from, to,
  //       function(err, rows) {
  //         if (err) next(err);
  //         data.push({name: pathogen, rows: rows});
  //         n++;
  //         if (n == list.length) {
  //           console.log('done '+ data);
  //           res.send(JSON.stringify(data));
  //         }
  //     });
  //   });
  // });
}

function detectors(req, res, next) {
  res.send(JSON.stringify([]));
  // var list = req.body.names;
  // var from = req.body.from;
  // var to = req.body.to;
  //
  // var data = [];
  // var n = 0;
  //
  // var stmt = db.prepare(
  //   'select enc_id as id, prob, similar from detectors, encounter ' +
  //   ' where detectors.did = (select id from detector_info where name = ?) ' +
  //   ' and enc_id = encounter.id ' +
  //   ' and encounter.date between ? and ? ' +
  //   ' order by enc_id');
  //
  // console.log('>> detector');
  // db.parallelize(function() {
  //   list.forEach(function(detector) {
  //     console.log('detector:',detector,from, to);
  //     stmt.all(detector, from, to,
  //       function(err, rows) {
  //         if (err) next(err);
  //         data.push({name: detector, rows: rows});
  //         n++;
  //         if (n == list.length) {
  //           res.send(JSON.stringify(data));
  //         }
  //       });
  //   });
  // });
}

function query(req, res, next) {
  var enc;

  sql.connect(config1).then(function() {
    new sql.Request()
      .input('from',req.query.from )
      .input('to', req.query.to)
      .execute('app.common_ground_enc')
      .then(function(rows) {
        enc = rows[0];
      }).catch(function(err) {
        console.log('enc err:', err);
        next(err);
        console.log('after enc err');
    });

    new sql.Request()
      .input('from',req.query.from )
      .input('to', req.query.to)
      .execute('app.common_ground_associations')
      .then(function(rows) {
        console.log('associations =', rows);
        res.send(JSON.stringify({from: req.query.from, to: req.query.to, enc: enc, associations: rows[0]}));
      }).catch(function(err) {
      console.log('associations err:', err);
      next(err);
      console.log('after associations err');
    });
  });

}
function query1(req, res, next) {
  var query = req.query;

  var associations;
  var enc;
  var from = query.from;
  var to = query.to;

  var enc_stmt = db.prepare('select id, date, age, zipcode from common_ground.encounter where date between ? and ?');
  var association_stmt = db.prepare('select enc_id, tag_id from common_ground.enc_tag, common_ground.encounter where encounter.date between ? and ? and enc_id = encounter.id');

  db.serialize(function() {
    enc_stmt.all(from, to,
      function(err, rows) {
        enc = rows;
      }
    );

    association_stmt.all(query.from, query.to,
      function(err, rows) {
        associations = rows;
        // console.log('*** enc:');
        // console.log(enc);
        // console.log('*** association:');
        // console.log(associations);
        res.send(JSON.stringify({from: query.from, to: query.to, enc: enc, associations: associations}));
      });
  });
}


exports.kb = kb;
exports.query = query;
exports.population = population;
exports.info = info;
exports.pathogens = pathogens;
exports.detectors = detectors;