var osmdb = require('osm-p2p')
var obsdb = require('../')
var minimist = require('minimist')

var level = require('level')
var db = level('/tmp/osm-obs.db')

var osm = osmdb('/tmp/osm.db')
var obs = obsdb({ db: db, log: osm.log })

var doc = minimist(process.argv.slice(2), {
  string: ['obs','link']
})
delete doc._

osm.create(doc, function (err, key, node) {
  if (err) console.error(err)
  else console.log(key)
})
