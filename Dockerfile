FROM node:6.10.3

RUN npm install -g yarn

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

EXPOSE 3001

CMD ["yarn", "start"]

