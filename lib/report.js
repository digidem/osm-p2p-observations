var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var isStream = require('is-stream')
var once = require('once')

module.exports = Report
inherits(Report, EventEmitter)

function Report (doc, opts) {
  if (!(this instanceof Report)) return new Report(doc, opts)
  EventEmitter.call(this)
  this.files = []
  this.core = opts.core
  this.doc = doc
  this._pending = 0
}

Report.prototype.attach = function (input, cb) {
  cb = once(cb || noop)
  var self = this
  var w = this.core.createWriteStream()
  w.once('error', cb)
  self._pending++
  w.once('finish', function () {
    if (--self._pending === 0) {
    }
    cb(null)
  })
  input.pipe(w)
  return self
}

Report.prototype.commit = function (cb) {
  cb = once(cb || noop)
  var self = this
  if (self._pending === 0) ready()
  else self.once('_ready', ready)
  return self
  function ready () { self.emit('commit', cb) }
}

function noop () {}
