# osm-p2p-observations

media layer to record monitoring observations for [osm-p2p][1]

[1]: https://github.com/digidem/osm-p2p

# example

create an event:

``` js
var osmdb = require('osm-p2p')
var level = require('level')
var strftime = require('strftime')

var db = level('/tmp/osm-obs.db')
var osm = osmdb('/tmp/osm.db')

var doc = {
  type: 'node',
  lon: Number(process.argv[2]),
  lat: Number(process.argv[3]),
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
```

```
$ node create-event.js -147.9 64.5 'oil spill'
2549835612660169035
```

---

create observations that link to the event:

``` js
var osmdb = require('osm-p2p')
var obsdb = require('osm-p2p-observation')
var fs = require('fs')
var path = require('path')
var minimist = require('minimist')

var level = require('level')
var db = level('/tmp/osm-obs.db')

var osm = osmdb('/tmp/osm.db')
var obs = obsdb({ db: db, log: osm.log })

var argv = minimist(process.argv.slice(2), { string: [ '_' ] })

var evkey = argv._[0]
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
  .pipe(cursor.createFileWriteStream(argv.media))

cursor.finalize(function () {
  osm.create(doc, function (err, key, node) {
    if (err) console.error(err)
    else console.log(cursor.id)
  })
})
```

```
$ node create-obs.js 2549835612660169035 --caption='oil in the river' \
  --category=contamination --media=DSC_102932.jpg --mediaType=photo
3816383091836550097
$ node create-obs.js 2549835612660169035 --caption='pipeline break' \
  --category=contamination --media=DSC_102931.jpg --mediaType=photo
7719235301294729118
```

---

list the observations associated with an event:

``` js
var osmdb = require('osm-p2p')
var obsdb = require('osm-p2p-observations')
var level = require('level')
var db = level('/tmp/osm-obs.db')

var osm = osmdb('/tmp/osm.db')
var obs = obsdb({ db: db, log: osm.log })

obs.list(process.argv[2], function (err, docs) {
  console.log(docs)
})
```

# api

``` js
var obsdb = require('osm-p2p-observations')
```

## var obs = obsdb(opts)

Create an `obs` instance from:

* `opts.log` - a hyperlog instance from an osm-p2p-db
* `opts.db` - a leveldb database

## var archive = obs.open(obsid)

Open a hyperdrive `archive`, optionally with an `obsid`.
Otherwise, an `obsid` is generated and can be read as `archive.id`.

## var stream = obs.list(evkey, cb)

Return a readable `stream` of documents that link to `evkey` or collect the
documents into `cb(err, docs)`.

## var stream = obs.replicate()

Return a duplex `stream` for replication.

# install

```
npm install osm-p2p-observations
```

# license

MIT
