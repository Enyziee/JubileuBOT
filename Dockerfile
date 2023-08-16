FROM node:lts-alpine

WORKDIR /usr/app

COPY package.json ./
RUN apk add build-base make autoconf automake libtool libsodium python3
RUN yarn install

COPY src/ src/
COPY tsconfig.json .
RUN yarn global add typescript
RUN tsc

ENV NODE_ENV=production

CMD [ "node", "./dist/app.js" ]