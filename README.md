# Trust Registry

An implementation of a Trust Registry for Self-Sovereign Identity Ecosystems

## Background

After some initial discussion between ABSA and DIDx regaring development of a Trust Registry that can be used in the South African SSI Ecosystem we determined that both entities developed a version of a Trust Registry but we have a requirement to develop one implementation that can be used by everyone.

For more detailed information regarding the current discussion and implementation requirements read the [HackMD Write Up](https://hackmd.io/heOazbtvSi2B18I7YWkGIg?view)

## Schemas

We require fully qualified schemas. You can find how the unqualified should be transformed to fully qualified and vice-versa at the following links:

- [Indy DID Method spec](https://hyperledger.github.io/indy-did-method/#schema)
- [JavaScript implementation](https://gist.github.com/jakubkoci/26cb093d274bf61d982b4c56e05d9ebc)

## Development

### Prerequisities

- Node.js
- Docker
- Docker Compose (optional)

### Run

Start the database, you can use docker for that in the following way:

```sh
docker-compose up -d mongo mongo-replica-setup
```

You can change port but don't forget to update the `.env`.

If you already have docker container, you can start/stop the container:

```sh
docker stop mongo
```

```sh
docker start mongo
```

Start backend

```sh
cd packages/backend
```

Create `.env`

```
cp .env.example .env
```

Run the backend in dev mode

```sh
yarn dev
```

Start frontend

```sh
cd packages/frontend
```

Create `.env`

```
cp .env.example .env
```

Run the frontend in dev mode

```sh
yarn dev -p 3001
```

Start both

### Run with Docker

Build Docker image

```sh
docker build -t local/ssi-trust-registry .
```

Create common `.env` file from the `packages/frontend/.env` and `packages/backend/.env`:

```sh
cat packages/backend/.env > .env && cat packages/frontend/.env >> .env
```

Run Docker container

```sh
docker run -d -p 3000:3000 -p 3001:3001 --name trust-registry --env-file .env local/ssi-trust-registry
```

### Run with Docker Compose

...

### Run Tests

There are integration tests that starts HTTP server and calls a database. We have to set some environment variables first. You can copy `.env.example` and update values according to the environment where your're running tests:

```sh
cp .env.example .env.test
```

Start the database, you can use docker for that in the following way:

```sh
docker compose up -d mongo mongo-replica-setup
```

Now, you can run tests:

```
yarn test
```
