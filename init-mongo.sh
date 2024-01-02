set -e
mongod --port 27017 --replSet rs0 --bind_ip 0.0.0.0 & MONGOD_PID=$! -- "$MONGO_INITDB_DATABASE" <<EOF
    var rootUser = '$MONGO_INITDB_ROOT_USERNAME';
    var rootPassword = '$MONGO_INITDB_ROOT_PASSWORD';
    admin.auth(rootUser, rootPassword);
    db.createUser({ user: '$MONGO_INITDB_ROOT_USERNAME', pwd: '$MONGO_INITDB_ROOT_PASSWORD', roles: [ 'root' ] })
    rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'mongodb:27017' }] })
EOF
