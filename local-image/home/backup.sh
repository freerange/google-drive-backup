#!/usr/bin/env bash

HEALTHCHECKS_URL=https://hc-ping.com/be6872b3-58a7-4e1d-94b3-619e3dcecc95

curl --retry 3 $HEALTHCHECKS_URL/start

rclone \
  --config rclone.conf --verbose \
  --drive-impersonate james.mead@gofreerange.com \
  sync "google-drive:Go Free Range" s3:gfr-google-drive-backup

if [ $? -eq 0 ]
then
  curl --retry 3 $HEALTHCHECKS_URL
else
  curl --retry 3 $HEALTHCHECKS_URL/fail
fi
