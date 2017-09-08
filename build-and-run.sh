#!/bin/bash

sudo docker build -t spotify-party-mode:dev .
sudo docker run --add-host "mongo:172.17.0.1" -e "MONGO_CONNECTION_STRING=mongodb://mongo/test" -e "CLIENT_SECRET=${CLIENT_SECRET}" -e "CLIENT_ID=${CLIENT_ID}" -p 3001:3001 -it spotify-party-mode:dev
