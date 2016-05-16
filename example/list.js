var osmdb = require('osm-p2p')
var obsdb = require('../')
var level = require('level')
var db = level('/tmp/osm-obs.db')

var osm = osmdb('/tmp/osm.db')
var obs = obsdb({ db: db, log: osm.log })

obs.list(process.argv[2], function (err, docs) {
  console.log(docs)
})
