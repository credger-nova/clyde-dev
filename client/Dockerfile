FROM node:20.11-alpine

ARG build_mode=production

WORKDIR /usr/src/app

COPY . .

RUN npm install -g serve

RUN npm install

RUN npm run build:${build_mode}

CMD ["serve", "-s", "-l", "3000", "./dist"]