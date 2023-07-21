# Trust Registry

An implementation of a Trust Registry for Self-Sovereign Identity Ecosystems

## Background

After some initial discussion between ABSA and DIDx regaring development of a Trust Registry that can be used in the South African SSI Ecosystem we determined that both entities developed a version of a Trust Registry but we have a requirement to develop one implementation that can be used by everyone.

For more detailed information regarding the current discussion and implementation requirements read the [HackMD Write Up](https://hackmd.io/heOazbtvSi2B18I7YWkGIg?view)

## Run

Build Docker image

```sh
docker build -t ssi-trust-registry .
```

Create `.env`

```
cp .env.example .env
```

Run Docker container

```sh
docker run -d -p 3000:3000 --name ssi-trust-registry --env-file .env ssi-trust-registry
```

## Tests

There are integration tests that starts HTTP server and calls a database. We have to set some environment variables first. You can copy `.env.example` and update values according to the environment where your're running tests:

```sh
cp .env.example .env.test
```

Start the databse, you can use docker for that in the following way:

```sh
docker run --name mongo -p 4000:27017 -d mongo:6.0
```

Now, you can run tests:

```
yarn test
```
