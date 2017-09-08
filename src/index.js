import express from "express";
import { Issuer } from "openid-client";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import Login from "./models/login";
import fetch from "isomorphic-fetch";
import SpotifyApi from "spotify-web-api-node";

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://mongo/test", { useMongoClient: true });

const app = express();

const { CLIENT_ID, CLIENT_SECRET } = process.env;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing required env vars!");
  process.exit(1);
}

const redirectURI = "http://localhost:3000/spotify-callback";

const spotifyScopes = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing"
];

const spotifyBaseConfig = {
  redirectUri: redirectURI,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET
};

app.get("/sign-in/initiate", (req, res) => {
  var spotifyApi = new SpotifyApi(spotifyBaseConfig);

  const login = new Login({
    initiated: new Date(),
    redirect_uri: redirectURI
  });

  login
    .save()
    .then(() => {
      const authURL = spotifyApi.createAuthorizeURL(spotifyScopes, login._id);
      return res.json({ authURL, session: login._id });
    })
    .catch(err => {
      console.error(err);
      res.status(500).end("Sorry, an error occured!");
    });
});

app.post("/sign-in/complete", bodyParser.json(), (req, res) => {
  const { code, state } = req.body;
  console.log({ code, state });
  Login.findById(state)
    .then(login => {
      var spotifyApi = new SpotifyApi(spotifyBaseConfig);
      spotifyApi.authorizationCodeGrant(code).then(({ body }) => {
        const { access_token, refresh_token } = body;

        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        spotifyApi.getMe().then(data => {
          
          const user = data.body;
          console.log(user);
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
