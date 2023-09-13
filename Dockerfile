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

WORKDIR /app
COPY yarn.lock package.json ./
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN yarn install --frozen-lockfile

COPY . .
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

WORKDIR /app
COPY --from=builder /app /app

USER 1000
ENV URL=http://0.0.0.0
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT [ "tini", "--" ]
CMD [ "node", "./build/main.js" ]
