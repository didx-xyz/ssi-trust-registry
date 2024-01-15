#!/bin/bash

echo "Waiting for startup.."
sleep 5
echo mongosetup.sh time now: $(date +"%T")
mongosh --host mongo:27017 -u ${MONGO_INITDB_ROOT_USERNAME} -p ${MONGO_INITDB_ROOT_PASSWORD} < $(dirname "$0")/rs-init.js
echo "done"
