#!/bin/bash
rm -rf /tmp/osm-obs.db /tmp/osm.db
OBS1=$(node create.js --type=observation --lon=-147.93 --lat=64.51 \
  --caption='oil in the river' --category=contamination \
  --media=files/DSC_102932.jpg --mediaType=photo)
echo OBS1=$OBS1
OBS2=$(node create.js --type=observation --lon=-149.95 --lat=64.49 \
  --caption='pipeline break' --category=contamination \
  --media=files/DSC_102931.jpg --mediaType=photo)
echo OBS2=$OBS2
NODE1=$(node create.js --type=node --lon=-147.92 --lat=64.51)
echo NODE1=$NODE1
LINK1=$(node create.js --type=observation-link --osmid=$NODE1 --obsid=$OBS1)
echo LINK1=$LINK1 "($NODE1 => $OBS1)"
