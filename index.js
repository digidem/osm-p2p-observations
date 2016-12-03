var join = require('hyperlog-join')
var sub = require('subleveldown')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var collect = require('collect-stream')
var through = require('through2')
var readonly = require('read-only-stream')
var xtend = require('xtend')

module.exports = Obs
inherits(Obs, EventEmitter)

var REF = 'r', INFO = 'i'

function Obs (opts) {
  var self = this
  if (!(self instanceof Obs)) return new Obs(opts)
  self.indexes = {}
  self.log = opts.log
  self.log.on('error', function (err) { self.emit('error', err) })
  self.indexes.ref = join({
    log: self.log,
    db: sub(opts.db, REF),
    map: function (row) {
      var v = row.value && row.value.v || {}
      if (v.type === 'observation-link' && v.link) {
        return { type: 'put', key: v.osmid, value: 0 }
      }
    }
  })
  self.indexes.ref.on('error', function (err) { self.emit('error', err) })
  self.db = sub(opts.db, INFO, { valueEncoding: 'binary' })
}

Obs.prototype.list = function (cb) {
  var self = this
  var r = self.indexes.ref.relations()
  if (cb) collect(r, cb)
  return r
}

Obs.prototype.links = function (refid, cb) {
  var self = this
  var r = self.indexes.ref.list(refid)
  var tr = through.obj(function (row, enc, next) {
    self.log.get(row.value.obsid, function (err, doc) {
      if (err) next(err)
      else if (!doc || !doc.value || !doc.value.v) next()
      else next(null, doc.value.v)
    })
  })
  r.once('error', tr.emit.bind(tr, 'error'))
  r.pipe(tr)
  if (cb) collect(tr, cb)
  return readonly(tr)
}
