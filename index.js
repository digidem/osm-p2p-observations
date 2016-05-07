var hypercore = require('hypercore')
var hyperkv = require('hyperkv')
var sub = require('subleveldown')
var randombytes = require('randombytes')
var once = require('once')
var symgroup = require('symmetric-protocol-group')
var hyperkdb = require('hyperlog-kdb-index')
var kdbtree = require('kdb-tree-store')

var CORE = 'c', KV = 'k'
var KEYS = {
  start: ['start'],
  end: ['end'],
  lon: ['location','lon'],
  lat: ['location','lat']
}
function getkey (obj, keys) {
  keys.forEach(function (key) {
    if (obj) obj = obj[key]
  })
  return obj
}

module.exports = Monitor

function Monitor (opts) {
  var self = this
  if (!(this instanceof Monitor)) return new Monitor(opts)
  this.log = opts.log
  this.kv = hyperkv({
    db: sub(opts.db, KV),
    log: this.log
  })
  this.kdb = hyperkdb({
    log: this.log,
    types: [ 'float', 'float' ],
    kdbtree: kdbtree,
    store: opts.store,
    map: function (row) {
      if (!row.value) return
      var lon = getkey(row.value.v, KEYS.lon)
      if (lon === undefined) return
      var lat = getkey(row.value.v, KEYS.lat)
      if (lat === undefined) return
      if (row.value.k) {
        return { type: 'put', point: ptf({ lat: lat, lon: lon }) }
      } else if (row.value.d && row.value.points) {
        return { type: 'del', points: row.value.points.map(ptf) }
      }
      function ptf (x) { return [ x.lat, x.lon ] }
    }
  })
  this.kdb.on('error', function (err) { self.emit('error', err) })
  this.core = hypercore(sub(opts.db, CORE))
}

Monitor.prototype.create = function (doc) {
  var self = this
  var report = new Report(doc, {
    core: self.core
  })
  report.once('commit', function (next) {
    var id = randombytes(8).toString('hex')
    self.kv.put(id, {
      report: doc,
      files: report.files
    }, next)
  })
  return report
}

Monitor.prototype.get = function (id, cb) {
  this.kv.get(id, cb)
}

Monitor.prototype.replicate = function (opts) {
  return symgroup({
    core: this.core.replicate(opts),
    log: this.log.replicate(opts)
  })
}

Monitor.prototype.query = function (bbox) {
  return this.kdb.query(bbox)
}

Monitor.prototype.geojson = function (bbox) {
  // todo
}

function noop () {}
