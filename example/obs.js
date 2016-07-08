var osmdb = require('osm-p2p')
var obsdb = require('../')

var strftime = require('strftime')
var fs = require('fs')
var path = require('path')

var level = require('level')
var db = level('/tmp/osm-obs.db')

var osm = osmdb('/tmp/osm.db')
var obs = obsdb({ db: db, log: osm.log })

var minimist = require('minimist')
var argv = minimist(process.argv.slice(2), {
  number: [ 'lon', 'lat' ],
  string: [ '_' ]
})

if (argv._[0] === 'create') {
  var doc = {
    type: 'node',
    lon: argv.lon,
    lat: argv.lat,
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
} else if (argv._[0] === 'attach') {
  var evkey = argv._[1]
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
    .pipe(cursor.createFileWriteStream(doc.media))
    .once('finish', function () {
      osm.create(doc, function (err, key, node) {
        if (err) console.error(err)
        else console.log(cursor.id)
      })
    })
} else if (argv._[0] === 'files') {
  var archive = obs.open(argv._[1])
  archive.list().on('data', function (entry) {
    console.log(entry.name)
  })
} else if (argv._[0] === 'list') {
  obs.list(argv._[1], function (err, docs) {
    console.log(docs)
  })
} else if (argv._[0] === 'read') {
  var archive = obs.open(process.argv[2])
  archive.createFileReadStream(process.argv[3])
    .pipe(process.stdout)
}
