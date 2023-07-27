FROM docker.io/node:18-alpine

USER 0
RUN apk add --update --no-cache tini curl

USER 1000
WORKDIR /app
COPY --chown=1000:1000 yarn.lock package.json ./
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN yarn install --frozen-lockfile

COPY --chown=1000:1000 . .
RUN yarn build

ENV URL=http://0.0.0.0
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT [ "tini", "--" ]
CMD [ "node", "./build/main.js" ]
