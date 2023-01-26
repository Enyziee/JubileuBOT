FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json ./

RUN apk add build-base make autoconf automake libtool libsodium python3
RUN npm install

COPY . .

CMD [ "node", "./src/app.js" ]