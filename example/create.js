var fs = require('fs')

var osmdb = require('osm-p2p')
var osm = osmdb('/tmp/osm.db')

var level = require('level')
var db = level('/tmp/osm-obs.db')
var obs = require('../')({ db: db, log: osm.log })

var evdoc = {
  type: 'event',
  category: 'oil spill',
  date: '2016-05-30'
}
osm.create(evdoc, function (err, key, node) {
  var c0 = obs.open()
  fs.createReadStream('DSC_102931.jpg')
    .pipe(c0.createFileWriteStream())
  c0.finalize(function () {
    var doc = {
      type: 'observation',
      id: c.id,
      link: key,
      caption: 'pipeline break',
      category: 'contamination',
      media: 'DSC_102931.jpg',
      mediaType: 'photo'
    }
    osm.create(doc)
  })

  var c1 = obs.open()
  fs.createReadStream('DSC_102932.jpg')
    .pipe(c1.createFileWriteStream())
  c1.finalize(function () {
    var doc = {
      type: 'observation',
      id: c.id,
      link: key,
      caption: 'oil in the river',
      category: 'contamination',
      media: 'DSC_102932.jpg',
      mediaType: 'photo'
    }
    osm.create(doc, function (err, key, node) {})
  })

  var c2 = obs.open()
  fs.createReadStream('audiofile1.wav')
    .pipe(c2.createFileWriteStream())
  c2.finalize(function () {
    var doc = {
      type: 'observation',
      id: c.id,
      link: key,
      caption: 'interview with uncle simon',
      category: 'testimony',
      media: 'audiofile1.wav',
      mediaType: 'audio'
    }
    osm.create(doc, function (err, key, node) {})
  })
})
