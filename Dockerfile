FROM node:alpine

WORKDIR /usr/src/chat

RUN apk add yarn

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY ./ ./

EXPOSE 8001

CMD ["yarn", "start"]
