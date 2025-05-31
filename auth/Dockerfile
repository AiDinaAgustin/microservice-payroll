FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm cache clean --force
RUN npm i
RUN npm rebuild bcrypt

COPY . .

EXPOSE 5001
CMD [ "npm", "start" ]
