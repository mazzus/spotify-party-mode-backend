import express from "express";
import { Issuer } from "openid-client";
import querystring from "querystring";
import request from "request";
import btoa from "btoa";

const app = express();

const { CLIENT_ID, CLIENT_SECRET } = process.env;

if(!CLIENT_ID || !CLIENT_SECRET)
  {
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
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
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

app.listen(3001);
