FROM node:16.15.0-alpine

WORKDIR /usr/src/app

ENV  NODE_ENV = Production

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]