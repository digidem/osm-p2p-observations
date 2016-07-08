#!/bin/bash
rm -rf /tmp/osm-obs.db /tmp/osm.db
ID=`node obs.js create --lat=-147.9 --lon=64.5 'oil spill'`
echo $ID
node obs.js attach $ID --caption='oil in the river' \
  --category=contamination --media=files/DSC_102932.jpg --mediaType=photo
node obs.js attach $ID --caption='pipeline break' \
  --category=contamination --media=files/DSC_102931.jpg --mediaType=photo
