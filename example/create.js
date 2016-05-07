var monitordb = require('../')
var level = require('level')
var fdstore = require('fd-chunk-store')
var hyperlog = require('hyperlog')

var path = require('path')
var fs = require('fs')

var minimist = require('minimist')
var argv = minimist(process.argv.slice(2), {
  alias: { f: [ 'file', 'files' ] }
})

var monitor = monitordb({
  log: hyperlog(level('/tmp/monitor.log'), { valueEncoding: 'json' }),
  db: level('/tmp/monitor.db'),
  store: fdstore(1024, '/tmp/monitor.store')
})

var doc = JSON.parse(argv._[0])
var files = [].concat(argv.files)

var report = monitor.create(doc)
files.forEach(function (file) {
  fs.stat(file, function (err, stat) {
    if (err) return console.error(err)
    report.attach(fs.createReadStream(file), {
      name: path.basename(file),
      date: stat.ctime
    })
  })
})

report.commit(function (err, id) {
  if (err) console.error(err)
  else console.log(id)
})
