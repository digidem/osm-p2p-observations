var test = require('tape')
var mkdirp = require('mkdirp')
var osmdb = require('osm-p2p')
var fs = require('fs')
var path = require('path')
var memdb = require('memdb')
var OBS = require('../')

var tmpdir = path.join(require('os').tmpdir(), 'osm-obs-' + Math.random())
mkdirp.sync(tmpdir)

function dir (x) { return path.join(__dirname, 'files', x) }

test('create', function (t) {
  t.plan(6)
  var osm = osmdb(tmpdir)
  var obs = OBS({ db: memdb(), log: osm.log })
  var eventKey
  var obsdocs = []
  var pending = 6

  var evdoc = {
    type: 'node',
    lon: 12.3,
    lat: 45.6,
    tags: {
      type: 'event',
      category: 'oil spill',
      date: '2016-05-30'
    }
  }
  osm.create(evdoc, function (err, key, node) {
    t.error(err)
    eventKey = key
    var c0 = obs.open()
    fs.createReadStream(dir('DSC_102931.jpg'))
      .pipe(c0.createFileWriteStream('DSC_102931.jpg'))
      .once('finish', done)

    var doc = {
      type: 'observation',
      id: c0.id,
      link: key,
      caption: 'pipeline break',
      category: 'contamination',
      media: 'DSC_102931.jpg',
      mediaType: 'photo'
    }
    obsdocs.push(doc)
    osm.create(doc, function (err, xkey, xnode) {
      t.error(err)
      done()
    })

    var c1 = obs.open()
    fs.createReadStream(dir('DSC_102932.jpg'))
      .pipe(c1.createFileWriteStream('DSC_102932.jpg'))
      .once('finish', done)
    var doc = {
      type: 'observation',
      id: c1.id,
      link: key,
      caption: 'oil in the river',
      category: 'contamination',
      media: 'DSC_102932.jpg',
      mediaType: 'photo'
    }
    obsdocs.push(doc)
    osm.create(doc, function (err, xkey, xnode) {
      t.error(err)
      done()
    })

    var c2 = obs.open()
    fs.createReadStream(dir('audiofile1.wav'))
      .pipe(c2.createFileWriteStream('audiofile1.wav'))
      .once('finish', done)
    var doc = {
      type: 'observation',
      id: c2.id,
      link: key,
      caption: 'interview with uncle simon',
      category: 'testimony',
      media: 'audiofile1.wav',
      mediaType: 'audio'
    }
    obsdocs.push(doc)
    osm.create(doc, function (err, xkey, xnode) {
      t.error(err)
      done()
    })
  })

  function done () {
    if (--pending !== 0) return
    obs.list(eventKey, function (err, keys) {
      t.error(err)
      t.deepEqual(keys.sort(cmp), obsdocs.sort(cmp), 'expected observations')
    })
  }
  function cmp (a, b) { return a.id < b.id ? -1 : 1 }
})
