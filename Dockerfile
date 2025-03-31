FROM node:23

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .
