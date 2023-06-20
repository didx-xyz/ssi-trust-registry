FROM docker.io/node:18-alpine

USER 0
RUN apk add --update --no-cache tini

USER 1000
WORKDIR /app
COPY --chown=1000:1000 yarn.lock package.json ./
RUN yarn install --frozen-lockfile

COPY --chown=1000:1000 . .
RUN yarn build

EXPOSE 3000

ENTRYPOINT [ "tini", "--", "node", "./build/main.js" ]
