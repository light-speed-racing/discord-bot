FROM node:18-alpine as builder
ARG NPM_AUTH_TOKEN
WORKDIR /usr/src/app

COPY package.json yarn.lock tsconfig.json tsconfig.build.json ./
RUN yarn --ignore-scripts --frozen-lockfile

COPY src src

RUN yarn build

RUN yarn --prod --ignore-scripts --frozen-lockfile


FROM node:18-alpine
WORKDIR /usr/src/app
ENV PORT=3000
RUN apk add curl

COPY public public
COPY saved-queries saved-queries
COPY --from=builder /usr/src/app/node_modules node_modules
COPY --from=builder /usr/src/app/package.json package.json
COPY --from=builder /usr/src/app/dist dist

HEALTHCHECK CMD curl -sSf "http://localhost:${PORT}/health" || exit 1 
EXPOSE $PORT

CMD [ "node", "dist/main.js"]