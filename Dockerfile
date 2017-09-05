FROM node:6.10.3

RUN npm install -g yarn

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]

