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

RUN yarn config set strict-ssl false
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN yarn global add node-gyp

WORKDIR /app
COPY yarn.lock package.json ./
COPY ./packages/frontend/package.json ./packages/frontend/
COPY ./packages/backend/package.json ./packages/backend/
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
ENV NODE_ENV=${NODE_ENV}

EXPOSE 3000

ENTRYPOINT [ "tini", "--" ]
CMD [ "yarn", "start" ]
