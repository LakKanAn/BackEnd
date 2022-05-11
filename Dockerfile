FROM node:16.15.0

WORKDIR /usr/src/app

COPY package*.json ./

COPY [".env", "./.env"]

RUN npm install

COPY . .

EXPOSE 5000


CMD ["npm", "run", "dev"]