import express from "express";
import bodyParser from "body-parser";
import Login from "./models/login";
import { createSpotifyApi, redirectURI } from "./utils";


const router = express.Router();

const spotifyScopes = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing"
];

router.get("/initiate", (req, res) => {
  var spotifyApi = createSpotifyApi();

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

router.post("/complete", bodyParser.json(), (req, res) => {
  const { code, state } = req.body;
  console.log({ code, state });
  Login.findById(state)
    .then(login => {
      var spotifyApi = createSpotifyApi();
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
          login.save().then();
          return res.send("Ok");
        });
      });
    })
    .catch(error => {
      console.error(error);
    });
});


export default router;