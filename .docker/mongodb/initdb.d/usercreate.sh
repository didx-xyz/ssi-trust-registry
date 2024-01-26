set -Eeuo pipefail
 
mongosh -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin "$MONGO_INITDB_DATABASE" <<EOF
    db.createUser({
        user: '$MONGO_INITDB_ROOT_USERNAME',
        pwd: '$MONGO_INITDB_ROOT_PASSWORD',
        roles: [ { role: 'readWrite', db: '$MONGO_INITDB_DATABASE' } ]
    })
EOF
