var join = require('hyperlog-join')
var sub = require('subleveldown')
var hprefix = require('hyperdrive-prefix')
var hyperdrive = require('hyperdrive')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var hex2dec = require('./lib/hex2dec.js')
var randombytes = require('randombytes')
var collect = require('collect-stream')
var through = require('through2')
var readonly = require('read-only-stream')

module.exports = Obs
inherits(Obs, EventEmitter)

var REF = 'r', DRIVE = 'd', INFO = 'i'

function Obs (opts) {
  var self = this
  if (!(self instanceof Obs)) return new Obs(opts)
  self.indexes = {}
  self.log = opts.log
  self.indexes.ref = join({
    log: self.log,
    db: sub(opts.db, REF),
    map: function (row) {
      var v = row.value && row.value.v
      if (!v || v.type !== 'observation' || !v.link) return
      return { type: 'put', key: v.link, value: 0 }
    }
  })
  self.drive = hyperdrive(sub(opts.db, DRIVE))
  self.db = sub(opts.db, INFO, { valueEncoding: 'binary' })
  self.db.get('link', function (err, link) {
    if (err && !notfound(err)) return self.emit('error', err)
    else if (link) {
      self.link = Buffer(link, 'hex')
      return self.emit('link', link)
    }
    var archive = self.drive.createArchive(undefined, { live: true })
    self.archive = archive
    self.db.put('link', archive.key.toString('hex'), function (err) {
      if (err) return self.emit('error')
      self.link = archive.key
      self.emit('link', archive.key)
    })
  })
}

Obs.prototype._getArchive = function (fn) {
  if (this.link) onlink.call(this, this.link)
  else this.once('link', onlink)
  function onlink (link) {
    if (this.archive) return fn(this.archive)
    this.archive = this.drive.createArchive(link, { live: true })
    fn(this.archive)
  }
}

Obs.prototype.open = function (obsid) {
  if (!obsid) obsid = hex2dec(randombytes(8).toString('hex'))
  var cursor = hprefix(String(obsid))
  cursor.id = obsid
  cursor.finalize = function (cb) { cb() }

  this._getArchive(function (archive) {
    cursor.setArchive(archive)
  })
  return cursor
}

Obs.prototype.list = function (refid, cb) {
  var self = this
  var r = self.indexes.ref.list(refid)
  var tr = through.obj(function (row, enc, next) {
    self.log.get(row.key, function (err, doc) {
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

Obs.prototype.replicate = function (opts) {
  return symgroup({
    drive: this.drive.replicate(opts)
  })
}

function noop () {}
function notfound (err) {
  return err && (/^notfound/i.test(err.message) || err.notFound)
}
