#!/bin/bash

echo "Waiting for startup.."
sleep 5
echo "done"

echo SETUP.sh time now: $(date +"%T")
mongosh --host mongo:27017 -u ${MONGO_INITDB_ROOT_USERNAME} -p ${MONGO_INITDB_ROOT_PASSWORD} <<EOF
var cfg = {
    "_id": "rs0",
    "protocolVersion": 1,
    "version": 1,
    "members": [
        {
            "_id": 0,
            "host": "mongo:27017",
            "priority": 2
        }
    ]
};
rs.initiate(cfg, { force: true });
rs.status();
EOF
