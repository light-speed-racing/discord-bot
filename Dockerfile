FROM node:16-alpine as builder
WORKDIR /usr/src/app
COPY package.json yarn.lock tsconfig.json tsconfig.build.json .env.json ./
RUN yarn --ignore-scripts --frozen-lockfile
COPY src src
RUN yarn build
RUN yarn --prod --ignore-scripts --frozen-lockfile

FROM node:16-alpine
WORKDIR /usr/src/app
ENV PORT=3000
RUN apk add curl zip
COPY --from=builder /usr/src/app/node_modules node_modules
COPY --from=builder /usr/src/app/package.json package.json
COPY --from=builder /usr/src/app/.env.json .env.json
COPY --from=builder /usr/src/app/dist dist
HEALTHCHECK CMD curl -sSf "http://localhost:${PORT}/health" || exit 1 
EXPOSE $PORT
CMD [ "node", "dist/main.js"]
