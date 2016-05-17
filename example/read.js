var osmdb = require('osm-p2p')
var obsdb = require('../')
var level = require('level')
var db = level('/tmp/osm-obs.db')

var osm = osmdb('/tmp/osm.db')
var obs = obsdb({ db: db, log: osm.log })

var archive = obs.open(process.argv[2])
archive.createFileReadStream(process.argv[3])
  .pipe(process.stdout)
