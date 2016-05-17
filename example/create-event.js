var osmdb = require('osm-p2p')
var level = require('level')
var strftime = require('strftime')

var db = level('/tmp/osm-obs.db')
var osm = osmdb('/tmp/osm.db')

var doc = {
  type: 'node',
  lon: Number(process.argv[2]),
  lat: Number(process.argv[3]),
  tags: {
    category: process.argv[4],
    date: strftime('%F', new Date),
    type: 'event'
  }
}
osm.create(doc, function (err, key, node) {
  if (err) console.error(err)
  else console.log(key)
})
