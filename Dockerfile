FROM node:lts-alpine as dependencies

COPY package.json .
RUN apk add --no-cache build-base make autoconf automake libtool libsodium python3
RUN npm install --verbose 

FROM node:lts-alpine as compilation

COPY --from=dependencies node_modules/ node_modules/
COPY . .
RUN npm install -g --verbose typescript
RUN tsc

FROM node:lts-alpine

COPY . .
WORKDIR /app

ENV TOKEN=${TOKEN}
ENV NODE_ENV=prod

COPY --from=dependencies node_modules/ node_modules/
COPY --from=compilation dist/ dist/

CMD [ "node", "./dist/app.js" ]
