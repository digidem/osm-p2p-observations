#!/bin/bash
rm -rf /tmp/osm-obs.db /tmp/osm.db
ID=`node create-event.js -147.9 64.5 'oil spill'`
echo $ID
node create-obs.js $ID --caption='oil in the river' \
  --category=contamination --media=files/DSC_102932.jpg --mediaType=photo
node create-obs.js $ID --caption='pipeline break' \
  --category=contamination --media=files/DSC_102931.jpg --mediaType=photo
