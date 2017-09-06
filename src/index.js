import express from "express";
import { Issuer } from "openid-client";
import querystring from "querystring";
import request from "request";
import btoa from "btoa";
import uuid from "uuid/v4";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import Login from "./models/login";
import fetch from "isomorphic-fetch";
import SpotifyApi from "spotify-web-api-node"

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://mongo/test", { useMongoClient: true });

const app = express();

const { CLIENT_ID, CLIENT_SECRET } = process.env;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing required env vars!");
  process.exit(1);
}

const redirectURI = "http://localhost:3000/spotify-callback";

app.get("/sign-in/initiate", (req, res) => {
  const login = new Login({
    initiated: new Date(),
    redirect_uri: redirectURI
  });

  login
    .save()
    .then(() => {
      const authURL =
        "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
          redirect_uri: redirectURI,
          client_id: CLIENT_ID,
          response_type: "code",
          state: "" + login._id,
          scope: [
            "playlist-read-private",
            "playlist-read-collaborative",
            "user-read-playback-state",
            "user-modify-playback-state",
            "user-read-currently-playing"
          ]
        });
      return res.json({ authURL, session: login._id });
    })
    .catch(err => {
      console.error(err);
      res.status(500).end("Sorry, an error occured!");
    });
});

function getTokens(code) {
  return new Promise((resolve, reject) => {
    request.post(
      "https://accounts.spotify.com/api/token",
      {
        form: {
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectURI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        },
        json: true
      },
      (error, response, body) => {
        if (error || response.statusCode != 200) {
          return reject(error);
        }

        const { access_token, refresh_token } = body;

        return resolve({ access_token, refresh_token });
      }
    );
  });
}

function getUser(access_token) {
  return new Promise((resolve, reject) => {
    request.get(
      "https://api.spotify.com/v1/me",
      {
        json: true,
        headers: {
          Authorization: "Bearer " + access_token
        }
      },
      (error, response, body) => {
        if (error || response.statusCode != 200) {
          return reject(error);
        }

        return resolve(body);
      }
    );
  });
}

app.post("/sign-in/complete", bodyParser.json(), (req, res) => {
  const { code, state } = req.body;
  console.log({code, state});
  Login.findById(state)
    .then(login => {
      getTokens(code).then(({ access_token, refresh_token }) => {


        var spotifyApi = new SpotifyApi({
          clientId : CLIENT_ID,
          clientSecret : CLIENT_SECRET
        });

        spotifyApi.getMe(access_token).then(user => {
          console.log(user)
          login.set({
            completed: new Date(),
            access_token,
            refresh_token,
            spotifyId: user.id
          });

          return res.send("Ok");
        });
      });
    })
    .catch(error => {
      console.error(error);
    });
});

app.listen(3001);
