const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getAccessToken } = require('../methods/accesstoken'); // Importera getAccessToken-funktionen


const requireAuth = require('../middleware/requireAuth'); // middleware

router.get('/user', requireAuth, async (req, res) => {
  console.log('User ID:', req.user.id); // Logga användar-ID för felsökning
  try {
    const accessToken = await getAccessToken(req.user.id);
    const topTracks = await extractTopTracks(accessToken);
    console.log(req.user.id)

    res.json({
      message: 'Skyddad användardata',
      name: req.user.id,
      topSongs: topTracks,
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/protected', requireAuth, (req, res) => {
  res.json({ message: 'Du är inloggad!' });
});

router.get('/statistics', requireAuth, async (req, res) => {
  console.log('Statistics request for user ID:', req.user.id); // Logga användar-ID för felsökning
  try{
    const accessToken = await getAccessToken(req.user.id);
    const TopThreeArtists = await getTopThreeArtists(accessToken);
    const followers = await getFollowers(accessToken, req.user.id);
    const savedTracks = await getSavedTracks(accessToken);
    const playlists = await getPlaylists(accessToken);

    res.json({
      message: 'Skyddad statistikdata',
      topThreeArtists: TopThreeArtists,
      followers: followers,
      savedTracks: savedTracks,
      playlists: playlists
    });
  }
  catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }

  
});

router.get('/search', requireAuth, async (req, res) => {
  const query = req.query.query;
  const accessToken = await getAccessToken(req.user.id);

  try {
    const response = await axios.get(`https://api.spotify.com/v1/search`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        q: query,
        type: 'artist',
        limit: 5
      }
    });

    const artists = response.data.artists.items.map(artist => ({
      name: artist.name,
      id: artist.id
    }));

    res.json({ artists });
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

});

router.post('/generatePreview', requireAuth, async (req, res) => {
  console.log('Generating preview for user:', req.user.id);
  const accessToken = await getAccessToken(req.user.id);

  const { artists } = req.body;
  if ( !artists || !Array.isArray(artists)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    let allTracks = [];

    for (const artist of artists) {
      const { id: artistId, trackCount } = artist;

      // Hämta artistens top tracks (Spotify API)
      const response = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            market: "SE", // Använd valfri marknad eller 'US' etc
          },
        }
      );

      const tracks = response.data.tracks;
      console.log("Tracks", tracks)

      // Slumpa trackCount låtar (om det finns färre än trackCount, ta alla)
      const shuffled = tracks.sort(() => 0.5 - Math.random());
      const selectedTracks = shuffled.slice(0, trackCount);

      const simpleTracks = selectedTracks.map(track => ({
        artistName: track.artists.map(a => a.name).join(", "),
        trackName: track.name,
        uri: track.uri,
      }));

      allTracks = allTracks.concat(simpleTracks);
    }

    console.log('Generated tracks:', allTracks);

    // Returnera spellistans namn och tracks som preview
    return res.json({
      tracks: allTracks,
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

})

router.post('/generatePlaylists', requireAuth, async (req, res) => {
  const accessToken = await getAccessToken(req.user.id);
  const userId = req.user.id;
  const playlistData = req.body;
  console.log('Generating playlists for user:', userId, "with playlist data:", playlistData);

  try{
  const playlist = await axios.post(
    `https://api.spotify.com/v1/users/${userId}/playlists`, 
    {
      name: playlistData.playlistName,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log('Playlist created:', playlist.data.id);

  const playlistId = playlist.data.id;
  const trackUris = playlistData.tracks.map(track => track.uri);
  console.log('Track URIs:', trackUris);

  try{
    const response = await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      uris: trackUris,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
    )
    if (!response || !response.data) {
      console.error('No response data received from Spotify API');
      return res.status(500).json({ message: 'Failed to save tracks to playlist' });
    }

    return res.json({
      message: 'Playlist created successfully',
    });
  }
  catch (error) {
    console.error('Error saving tracks to playlist', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
  }
  catch (error) {
    console.error('Error creating playlist:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

  });

router.post('/logout', (req, res) => {
    res.json({ message: 'Utloggad' });
  });

  async function extractTopTracks(token) {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response?.data?.items) return [];
  
    // Hämta de första 5 låtarna och mappa till ett enklare format
    return response.data.items.slice(0, 5).map(item => ({
      artist: item.artists.map(artist => artist.name).join(" & "),
      lattitel: item.name
    }));
  }

  const getTopThreeArtists = async (accessToken) => {
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=3&time_range=long_term', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response?.data?.items) return [];
    console.log('Top Three Artists:', response.data);
    return response.data.items.map(artist => ({
      name: artist.name,
    }));
  }

  const getFollowers = async (accessToken, userId) => {
    const response = await axios.get(`https://api.spotify.com/v1/users/${userId}`, {
      headers: {
      Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response?.data?.followers) return 0;
    console.log('Followers:', response.data.followers.total);
    return response.data.followers.total;
  }

  const getSavedTracks = async (accessToken) => {
    const response = await axios.get('https://api.spotify.com/v1/me/tracks?limit=50', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response?.data?.items) return [];
    console.log('Saved Tracks:', response.data.items.length);
    return response.data.items.map(item => ({
      title: item.track.name,
      artist: item.track.artists.map(artist => artist.name).join(" & ")
    }));
  }

  const getPlaylists = async (accessToken) => {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response?.data?.items) return [];
    console.log('Playlists:', response.data.items.length);
    return response.data.items.map(playlist => ({
      name: playlist.name,
      id: playlist.id
    }));
  }

module.exports = router;