import express from "express";
import { Issuer } from "openid-client";
import querystring from "querystring";
import request from "request";
import btoa from "btoa";

const app = express();

const client_id = "";
const client_secret = "";



const redirectURI = "http://localhost:3000/spotify-callback";

app.get("/login", (req, res) => {

  const authURL =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      redirect_uri: redirectURI,
      client_id,
      response_type: "code",
      scope: [
        "playlist-read-private",
        "playlist-read-collaborative",
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing"
      ]
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

  console.log({code});

  request.post("https://accounts.spotify.com/api/token", {
    form: {
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectURI,
      client_id,
      client_secret
    }
  }, (error, response, body) => {
    if(error)
      {
        console.error(error);
        return res.status(500).end("Something went wrong 2");
      }

      return res.json(body);

  })
});

app.listen(3000);
