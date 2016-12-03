var osmdb = require('osm-p2p')
var obsdb = require('../')
var level = require('level')
var through = require('through2')
var xtend = require('xtend')

var db = level('/tmp/osm-obs.db')
var osm = osmdb('/tmp/osm.db')
var obs = obsdb({ db: db, log: osm.log })

osm.log.createReadStream()
  .pipe(through.obj(write))
  .pipe(process.stdout)

function write (row, enc, next) {
  var v = row.value && row.value.v || {}
  if (v.type === 'observation') {
    next(null, JSON.stringify(xtend({ id: row.value.k }, v)) + '\n')
  } else next()
}
