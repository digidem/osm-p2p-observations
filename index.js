var join = require('hyperlog-join')
var sub = require('subleveldown')
var hprefix = require('hyperdrive-prefix')
var hyperdrive = require('hyperdrive')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var hex2dec = require('./lib/hex2dec.js')
var randombytes = require('randombytes')

module.exports = Obs
inherits(Obs, EventEmitter)

var REF = 'r', DRIVE = 'd', INFO = 'i'

function Obs (opts) {
  var self = this
  if (!(self instanceof Obs)) return new Obs(opts)
  self.indexes = {}
  self.indexes.ref = join({
    log: opts.log,
    db: sub(opts.db, REF),
    map: function (row) {
      var v = row.value && row.value.v
      if (!v || v.type !== 'observation' || !v.ref) return
      return { type: 'put', key: v.ref, value: 0 }
    }
  })
  self.drive = hyperdrive(sub(opts.db, DRIVE))
  self.db = sub(opts.db, INFO, { valueEncoding: 'buffer' })
  self.db.get('link', function (err, link) {
    if (err && !notfound(err)) return self.emit('error', err)
    else if (link) {
      self.link = link
      return self.emit('link', link)
    }
    var archive = self.drive.createArchive()
    archive.finalize(function () {
      self.db.put('link', archive.key, function (err) {
        if (err) return self.emit('error')
        self.link = archive.key
        self.emit('link', archive.key)
      })
    })
  })
}

Obs.prototype._getArchive = function (fn) {
  if (this.link) onlink.call(this, this.link)
  else self.once('link', onlink)
  function onlink (link) { fn(this.drive.createArchive(link)) }
}

Obs.prototype.open = function (obsid) {
  if (!obsid) obsid = hex2dec(randombytes(8).toString('hex'))
  var cursor = hprefix(String(obsid))
  cursor.id = obsid
  this._getArchive(function (archive) {
    cursor.setArchive(archive)
  })
  return cursor
}

Obs.prototype.list = function (refid, cb) {
  return this.indexes.ref.list(refid, cb)
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
