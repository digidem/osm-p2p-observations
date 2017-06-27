var test = require('tape')
var osmdb = require('osm-p2p-mem')
var memdb = require('memdb')
var collect = require('collect-stream')
var OBS = require('../')

function dir (x) { return path.join(__dirname, 'files', x) }

test('create', function (t) {
  t.plan(7)
  var osm = osmdb()
  var obs = OBS({ db: memdb(), log: osm.log })

  var docs = [
    {
      type: 'put',
      key: '5376464111285135',
      value: {
        type: 'observation',
        lon: -147.93,
        lat: 64.51,
        caption: 'oil in the river',
        category: 'contamination',
        media: '2016-12-02_15h24_63ec3720a6a5f.jpg'
      }
    },
    {
      type: 'put',
      key: '3698308318298018',
      value: {
        type: 'observation',
        lon: -149.95,
        lat: 64.49,
        caption: 'pipeline break',
        category: 'contamination',
        media: '2016-12-02_15h51_d57362a9a06e7.jpg'
      }
    },
    {
      type: 'put',
      key: '7188637216252609',
      value: {
        type: 'node',
        lon: -147.92,
        lat: 64.51
      }
    },
    {
      type: 'put',
      value: {
        type: 'observation-link',
        link: '7188637216252609',
        obs: '3698308318298018'
      }
    }
  ]
  osm.batch(docs, function (err, nodes) {
    t.error(err)
    obs.ready(function () {
      obs.links('3698308318298018', function (err, docs) {
        t.error(err)
        t.deepEqual(docs.map(valueof), [
          {
            type: 'observation-link',
            link: '7188637216252609',
            obs: '3698308318298018'
          }
        ])
      })
      obs.links('5376464111285135', function (err, docs) {
        t.error(err)
        t.deepEqual(docs, [])
      })
      collect(osm.log.createReadStream(), function (err, docs) {
        t.error(err)
        t.deepEqual(docs.map(valueof).map(vprop).filter(isobs).sort(cmp), [
          {
            type: 'observation',
            lon: -147.93,
            lat: 64.51,
            caption: 'oil in the river',
            category: 'contamination',
            media: '2016-12-02_15h24_63ec3720a6a5f.jpg'
          },
          {
            type: 'observation',
            lon: -149.95,
            lat: 64.49,
            caption: 'pipeline break',
            category: 'contamination',
            media: '2016-12-02_15h51_d57362a9a06e7.jpg'
          }
        ].sort(cmp))
      })
    })
  })
})

function cmp (a, b) { return a.id < b.id ? -1 : 1 }
function isobs (doc) { return doc.type === 'observation' }
function valueof (doc) { return doc.value }
function vprop (doc) { return doc.v }
