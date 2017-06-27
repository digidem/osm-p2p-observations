[![Build Status](https://img.shields.io/travis/digidem/osm-p2p-observations.svg)](https://travis-ci.org/digidem/osm-p2p-observations)
[![npm](https://img.shields.io/npm/v/osm-p2p-observations.svg?maxAge=2592000)](https://www.npmjs.com/package/osm-p2p-observations)

# osm-p2p-observations

> Indexing layer to record monitoring observations for [osm-p2p-db][1].

This layer understands two new document types, `observation` and
`observation-link`.

`observation` need only have `lat` and `lon` properties at minimum.

`observation-link` documents require an `obs` property (the OSM ID of the
observation document) and a `link` property (anything you'd like, but probably
the OSM ID of the `node` document the observation is linked to).


[1]: https://github.com/digidem/osm-p2p-db

# Stability

We're still figuring out the requirements upstream of this API, so we may make
more breaking changes in the near term, but we will respect semver by
incrementing the major version for each update.

# Example

Create documents with `osm.create()`:

``` js
var osmdb = require('osm-p2p')
var obsdb = require('osm-p2p-observations')
var minimist = require('minimist')
var level = require('level')

var db = level('/tmp/osm-obs.db')

var osm = osmdb('/tmp/osm.db')
var obs = obsdb({ db: db, log: osm.log })

var doc = minimist(process.argv.slice(2), {
  string: ['obs','link']
})
delete doc._

osm.create(doc, function (err, key, node) {
  if (err) console.error(err)
  else console.log(key)
})
```

Create normal osm-p2p types plus `'observation'` to record events and
`'observation-link'` to link observations with other osm-p2p types:

``` sh
$ node create.js --type=observation --lon=-147.93 --lat=64.51 \
  --caption='oil in the river' --category=contamination \
  --media=2016-12-02_15h24_63ec3720a6a5f.jpg
13932038153867622787
$ node create.js --type=observation --lon=-149.95 --lat=64.49 \
  --caption='pipeline break' --category=contamination \
  --media=2016-12-02_15h51_d57362a9a06e7.jpg
313578825992369305
$ node create.js --type=node --lon=-147.92 --lat=64.51
10510648254103783027
$ node create.js --type=observation-link \
  --link=10510648254103783027 --obs=13932038153867622787
4117990465324480637
```

Now you can list which documents are linked to each other with `obs.link()`:

``` js
var osmdb = require('osm-p2p')
var obsdb = require('osm-p2p-observations')
var level = require('level')
var db = level('/tmp/osm-obs.db')

var osm = osmdb('/tmp/osm.db')
var obs = obsdb({ db: db, log: osm.log })

obs.links(process.argv[2], function (err, docs) {
  console.log(docs)
})
```

You can query by either the linked document id or the observation id:

``` sh
$ node links.js 13932038153867622787
[ { key: '4117990465324480637',
    value: 
     { type: 'observation-link',
       link: '10510648254103783027',
       obs: '13932038153867622787' } } ]
$ node links.js 10510648254103783027
[ { key: '4117990465324480637',
    value: 
     { type: 'observation-link',
       link: '10510648254103783027',
       obs: '13932038153867622787' } } ]
```

Some documents won't be linked to anything:

``` sh
$ node links.js 313578825992369305
[]
```

## API

``` js
var obsdb = require('osm-p2p-observations')
```

### var obs = obsdb(opts)

Create an `obs` instance from:

* `opts.log` - a hyperlog instance from an osm-p2p-db
* `opts.db` - a leveldb database

### var stream = obs.links(id, cb)

Return a readable `stream` of `observation-link` documents that link to `id`.

If `cb` is given, collect the documents into `cb(err, docs)`.

`id` can be an OSM document ID or an observation ID.

### obs.ready(cb)

Calls the callback function `done` exactly once, when the indexer has finished
indexing all documents in `osmdb`.

# Install

```
npm install osm-p2p-observations
```

# License

MIT
