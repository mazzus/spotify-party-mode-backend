#!/bin/bash

sudo docker build -t spotify-party-mode:dev .
sudo docker run -e "CLIENT_SECRET=${CLIENT_SECRET}" -e "CLIENT_ID=${CLIENT_ID}" -p 3000:3000 -it spotify-party-mode:dev
