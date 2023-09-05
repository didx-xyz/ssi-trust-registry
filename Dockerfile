###
# Builder
###
FROM docker.io/node:18-slim AS builder

USER 0
RUN apt-get update && apt-get install -y \
  g++ \
  gcc \
  make \
  python3

USER 1000
WORKDIR /app
COPY --chown=1000:1000 yarn.lock package.json ./
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN yarn install --frozen-lockfile

COPY --chown=1000:1000 . .
RUN yarn build

###
# Runner
###
FROM docker.io/node:18-slim AS runner

USER 0
RUN apt-get update && apt-get install -y  \
  curl \
  tini \
  && rm -rf /var/lib/apt/lists/*

USER 1000
WORKDIR /app
COPY --chown=1000:1000 --from=builder /app /app

ENV URL=http://0.0.0.0
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT [ "tini", "--" ]
CMD [ "node", "./build/main.js" ]
