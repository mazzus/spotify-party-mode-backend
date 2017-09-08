FROM node:6.10.3-slim as builder

RUN npm install -g yarn

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

EXPOSE 3001

RUN yarn build

FROM node:6.10.3-slim

COPY --from=builder dist/ dist/
COPY --from=builder node_modules/ node_modules/

CMD ["node", "dist"]