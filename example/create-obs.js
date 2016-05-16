var osmdb = require('osm-p2p')
var obsdb = require('../')
var fs = require('fs')
var path = require('path')
var minimist = require('minimist')

var level = require('level')
var db = level('/tmp/osm-obs.db')

var osm = osmdb('/tmp/osm.db')
var obs = obsdb({ db: db, log: osm.log })

var argv = minimist(process.argv.slice(2), { string: [ '_' ] })

var evkey = argv._[0]
var cursor = obs.open()
var doc = {
  type: 'observation',
  id: cursor.id,
  link: evkey,
  caption: argv.caption,
  category: argv.category,
  media: path.basename(argv.media),
  mediaType: argv.mediaType
}

fs.createReadStream(argv.media)
  .pipe(cursor.createFileWriteStream(argv.media))

cursor.finalize(function () {
  osm.create(doc, function (err, key, node) {
    if (err) console.error(err)
    else console.log(cursor.id)
  })
})
