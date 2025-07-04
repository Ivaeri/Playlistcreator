require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const querystring = require("querystring");
const axios = require("axios");
const protectedRoutes = require("./routes/protectedRoutes");
const app = express();
const PORT = process.env.PORT || 4000;
const session = require("express-session");
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 
const { encryptToken, decryptToken } = require("./methods/encryptionMethods");
const redis = require('./redisClient');
const fs = require('fs');

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
    ? 'din-render-url.com' 
    : process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: "secret-string",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  })
);
const expressListEndpoints = require('express-list-endpoints');
console.log(expressListEndpoints(app));
// Define API routes FIRST (before static files and catch-all)
app.use("/api", protectedRoutes);

app.get("/login", (req, res) => {
  var client_id = process.env.CLIENT_ID;
  var client_secret = process.env.CLIENT_SECRET;
  var redirect_uri = process.env.REDIRECT_URI;

  var state = generateRandomString(16);
  req.session.state = state;
  var scope = "user-read-private user-read-email user-top-read user-follow-read user-library-read playlist-read-private playlist-modify-public playlist-modify-private";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get("/callback", async (req, res) => {
  const responseData = req.query;

  if (responseData.error)
    return res.status(500).send("Spotify authentication failed");

  console.log(req.session.state, responseData.state);

  if (responseData.state !== req.session.state) {
    return res.status(500).send("State mismatch");
  }

  try {
    const authOptions = {
      data: new URLSearchParams({
        code: responseData.code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
          ).toString("base64"),
      },
    };
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      authOptions.data,
      { headers: authOptions.headers }
    );

    try {
      let { access_token, refresh_token, expires_in } = response.data;
      access_token = encryptToken(access_token);
      refresh_token = encryptToken(refresh_token);

      const userResponse = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${decryptToken(access_token)}` },
      });

      const userEmail = userResponse.data.email;
      const userName = userResponse.data.display_name;
      const userId = userResponse.data.id;

      await redis.setEx(`spotify_access:${userId}`, expires_in, access_token);
      await redis.set(`spotify_refresh:${userId}`, refresh_token); 

      const userPayload = {
        id: userId,
        email: userEmail,
        display_name: userName,
      };

      const sessionToken = jwt.sign(userPayload, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.redirect(`/loggedIn#token=${sessionToken}`);
    } catch (error) {
      console.error("Error saving tokens:", error);
      return res.status(500).send("Internal server error");
    }
  } catch (error) {
    console.error("Error generating auth options:", error);
    return res.status(500).send("Internal server error");
  }
});

function generateRandomString(length) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Serve static files from the React build directory (AFTER API routes)
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all handler for React Router (must be LAST)
app.use((req, res) => {
  const filePath = path.join(__dirname, '../client/build', req.path === '/' ? 'index.html' : req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html')); // fallback för SPA
  }
});

app.listen(PORT, () => {
  console.log(`Server körs på http://localhost:${PORT}`);
});