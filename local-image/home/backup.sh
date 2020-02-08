#!/usr/bin/env bash

curl --retry 3 $HEALTHCHECKS_URL/start

rclone \
  --config rclone.conf --verbose \
  --drive-impersonate $GOOGLE_DRIVE_IMPERSONATION_EMAIL \
  sync "google-drive:$GOOGLE_DRIVE_FOLDER" "s3:$S3_BUCKET_NAME"

if [ $? -eq 0 ]
then
  curl --retry 3 $HEALTHCHECKS_URL
else
  curl --retry 3 $HEALTHCHECKS_URL/fail
fi
