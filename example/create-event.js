var osmdb = require('osm-p2p')
var strftime = require('strftime')

var level = require('level')
var db = level('/tmp/osm-obs.db')

var osm = osmdb('/tmp/osm.db')

var doc = {
  type: 'event',
  category: process.argv[3],
  date: strftime('%F', new Date)
}
osm.create(doc, function (err, key, node) {
  if (err) console.error(err)
  else console.log(key)
})
