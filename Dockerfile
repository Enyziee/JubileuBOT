FROM node:lts-alpine

WORKDIR /usr/app

COPY package.json ./

RUN apk add build-base make autoconf automake libtool libsodium python3

RUN yarn install --production 

COPY out/ .

CMD [ "node", "./app.js" ]