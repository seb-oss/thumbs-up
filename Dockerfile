FROM node:12.16-alpine
WORKDIR /app

COPY package-lock.json package.json .npmrc* ./


COPY lib ./lib
COPY public ./public
COPY settings.js ./

RUN npm ci

CMD [ "npm", "start" ]
