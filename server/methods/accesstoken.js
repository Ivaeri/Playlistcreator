const {decryptToken, encryptToken} = require('../methods/encryptionMethods'); // importera decryptToken
const redis = require('../redisClient');
const axios = require('axios');


const getAccessToken = async (userId) => {
    let encryptedToken = await redis.get(`spotify_access:${userId}`);
  
    if (!encryptedToken) {
      console.log("Access token missing or expired. Attempting refresh...");
      const refreshed = await refreshAccessToken(userId);
      if (!refreshed) {
        throw new Error("Unable to refresh access token.");
      }
      return refreshed; // already decrypted inside refreshAccessToken
    }
  
    return decryptToken(encryptedToken);
  };


  const refreshAccessToken = async (userId) => {
    const encryptedRefreshToken = await redis.get(`spotify_refresh:${userId}`);
    if (!encryptedRefreshToken) {
      console.error("No refresh token found for user.");
      return null;
    }
  
    const refreshToken = decryptToken(encryptedRefreshToken);
  
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              Buffer.from(
                `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
              ).toString("base64"),
          },
        }
      );
  
      let newAccessToken = encryptToken(response.data.access_token);
      const expiresIn = response.data.expires_in;
  
      await redis.setEx(`spotify_access:${userId}`, expiresIn, newAccessToken);
  
      return decryptToken(newAccessToken);
    } catch (error) {
      console.error("Error refreshing token:", error.response?.data || error.message);
      return null;
    }
  };
  

module.exports = {
    getAccessToken,
}