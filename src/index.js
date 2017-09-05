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

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://mongo/test", { useMongoClient: true });

const app = express();

const { CLIENT_ID, CLIENT_SECRET } = process.env;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing required env vars!");
  process.exit(1);
}

const redirectURI = "http://localhost:3001/spotify-callback";

app.get("/login", (req, res) => {
  const authURL =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      redirect_uri: redirectURI,
      client_id: CLIENT_ID,
      response_type: "code",
      scope: [
        "playlist-read-private",
        "playlist-read-collaborative",
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing"
      ].reduce((prev, current) => prev + " " + current)
    });

  //const authURL = "google.com"

  res.redirect(authURL);
});

app.get("/spotify-callback", (req, res) => {
  const { code, error, state } = req.query;
  if (error) {
    console.error(error);
    return res.status(500).end("Something went wrong");
  }

  console.log({ code });
  getTokens(code).then(tokenset => {
    console.log({tokenset});
    getUser(tokenset.access_token).then(user => {
      console.log({user});
    })
  })
});

app.get("/backend/sign-in/initiate", (req, res) => {
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
          state: login._id,
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

app.post("/backend/sign-in/complete", bodyParser.json(), (req, res) => {
  const { code, state } = req.body;

  Login.findById(state).then(login => {
    getTokens(code).then(({ access_token, refresh_token }) => {
      getUser.then(user => {
        login.set({
          completed: new Date(),
          access_token,
          refresh_token,
          spotifyId: user.id
        });
      });
    });
  });
});

app.listen(3001);
