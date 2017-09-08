import SpotifyApi from "spotify-web-api-node";

const redirectURI = "http://localhost:3000/spotify-callback";

function createSpotifyApi() {
  
  const { CLIENT_ID, CLIENT_SECRET } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing required env vars!");
  }
  const spotifyBaseConfig = {
    redirectUri: redirectURI,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET
  };
  return new SpotifyApi(spotifyBaseConfig);
}

export { createSpotifyApi , redirectURI};