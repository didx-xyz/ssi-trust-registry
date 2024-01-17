var cfg = {
  _id: 'rs0',
  protocolVersion: 1,
  version: 1,
  members: [
    {
      _id: 0,
      host: 'mongo:27017',
      priority: 2,
    },
  ],
}
rs.initiate(cfg, { force: true })
rs.status()
