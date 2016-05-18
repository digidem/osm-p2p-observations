# osm-p2p-observations

media layer to record monitoring observations for [osm-p2p][1]

[1]: https://github.com/digidem/osm-p2p

# stability

We're still figuring out the requirements upstream of this API, so we may make
more breaking changes in the near term, but we will respect semver by
incrementing the major version for each update.

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
5025029157861247926
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

osm.create(doc, function (err, key, node) {
  if (err) console.error(err)
  else console.log(cursor.id)
})
```

```
$ node create-obs.js 5025029157861247926 --caption='oil in the river' \
  --category=contamination --media=DSC_102932.jpg --mediaType=photo
17033495527276810754
$ node create-obs.js 5025029157861247926 --caption='pipeline break' \
  --category=contamination --media=DSC_102931.jpg --mediaType=photo
3645369582472120028
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

```
$ node list.js 5025029157861247926
[ { type: 'observation',
    id: '3645369582472120028',
    link: '5025029157861247926',
    caption: 'pipeline break',
    category: 'contamination',
    media: 'DSC_102931.jpg',
    mediaType: 'photo' },
  { type: 'observation',
    id: '17033495527276810754',
    link: '5025029157861247926',
    caption: 'oil in the river',
    category: 'contamination',
    media: 'DSC_102932.jpg',
    mediaType: 'photo' } ]
```

---

list the media files attached to an observation:

``` js
var osmdb = require('osm-p2p')
var obsdb = require('osm-p2p-observations')
var level = require('level')
var db = level('/tmp/osm-obs.db')

var osm = osmdb('/tmp/osm.db')
var obs = obsdb({ db: db, log: osm.log })

var archive = obs.open(process.argv[2])
archive.list().on('data', function (entry) {
  console.log(entry.name)
})
```

---

read the file contents of a media file from an observation:

```
var osmdb = require('osm-p2p')
var obsdb = require('osm-p2p-observations')
var level = require('level')
var db = level('/tmp/osm-obs.db')

var osm = osmdb('/tmp/osm.db')
var obs = obsdb({ db: db, log: osm.log })

var archive = obs.open(process.argv[2])
archive.createFileReadStream(process.argv[3])
  .pipe(process.stdout)
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

Open a [hyperdrive][2] `archive`, optionally with an `obsid`.
Otherwise, an `obsid` is generated and can be read as `archive.id`.

[2]: https://npmjs.com/package/hyperdrive

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
