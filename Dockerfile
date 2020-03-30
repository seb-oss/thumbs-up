FROM node:12.16-alpine
WORKDIR /app

COPY package.json .npmrc* ./

COPY lib ./lib
COPY public ./public
COPY settings.js ./

RUN npm i

COPY wait_for_postgres.sh /
ENTRYPOINT [ "/wait_for_postgres.sh" ]
CMD [ "npm", "start" ]
