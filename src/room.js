import express from "express";
import bodyParser from "body-parser";
import Room from "./models/room";
import Login from "./models/login";
import { createSpotifyApi } from "./utils";

const router = express.Router();

router.post(
  "/create",
  bodyParser.json(),
  (req, res, next) => {
    Login.findById(req.body.session)
      .then(login => {
        req.login = login;
        next();
      })
      .catch(error => {
        console.error(error);
        res.status(500).end("Error fetching login information");
      });
  },
  (req, res) => {
    const room = new Room({
      name: req.body.name,
      created: new Date(),
      admin: req.login
    });
    room
      .save()
      .then(() => {
        res.status(200).end();
      })
      .catch((error) => {
        console.error(error);
        res.status(500).end("An error occured when creating the room!");
      });
  }
);

// TODO: Verify that sender is owner

router.put(
  "/:name/play",
  (req, res, next) => {
    Room.findOne({ name: req.params.name })
      .then(room => {
        req.room = room;
      })
      .then(() => {
        console.log({room:req.room});
        Login.findById(req.room.admin).then(login => {
          console.log({login})
          req.login = login;
          next();
        });
      });
  },
  (req, res) => {
    const spotifyApi = createSpotifyApi();
    spotifyApi.setAccessToken(req.login.access_token);
    spotifyApi.setRefreshToken(req.login.refresh_token);

    spotifyApi.play();
    res.status(200).end();
  }
);

// TODO: Verify that sender is owner
router.put(
  "/:name/pause",
  (req, res, next) => {
    Room.findOne({ name: req.params.name })
      .then(room => {
        req.room = room;
      })
      .then(() => {
        console.log({room:req.room});
        Login.findById(req.room.admin).then(login => {
          console.log({login})
          req.login = login;
          next();
        });
      });
  },
  (req, res) => {
    const spotifyApi = createSpotifyApi();
    spotifyApi.setAccessToken(req.login.access_token);
    spotifyApi.setRefreshToken(req.login.refresh_token);

    spotifyApi.pause();
    res.status(200).end();
  }
);

export default router;
