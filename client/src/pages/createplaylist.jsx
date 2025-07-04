import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ChevronDown, ChevronUp } from "lucide-react";

const CreatePlaylist = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [previewTracks, setPreviewTracks] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("jwt");
      if (!token) {
        navigate("/");
      }
      try {
        const response = await fetch(
          "/api/protected",
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`, // Lägg till token som Bearer
            },
          }
        );
        if (!response.ok) {
          throw new Error("Not authenticated");
        }
      } catch (error) {
        console.error("Not authenticated", error);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const savedArtists = localStorage.getItem("selectedArtists");
    if (savedArtists) {
      setArtists(JSON.parse(savedArtists));
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    if (query.length < 2) return setSuggestions([]);
    const fetchSuggestions = async () => {
      const res = await fetch(
        `/api/search?query=${query}`,
        {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setSuggestions(data.artists || []);
    };
    fetchSuggestions();
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedArtists", JSON.stringify(artists));
  }, [artists]);

  useEffect(() => {
    const updateVisibleCount = () => {
      const height = window.innerHeight;
      if (height < 700) {
        setVisibleCount(3);
      } else if (height < 900) {
        setVisibleCount(4);
      } else {
        setVisibleCount(6);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const addArtist = (artist) => {
    setArtists((prevArtists) => {
      // Kontrollera om artisten redan finns i listan
      if (prevArtists.some((a) => a.id === artist.id)) {
        return prevArtists;
      }
      setSuggestions([]); // Töm förslag när en artist läggs till
      // Lägg till artisten med ett standardvärde för trackCount
      setQuery("");
      return [...prevArtists, { ...artist, trackCount: 5 }];
    });
  };
  const removeArtist = (id) => {
    setArtists((prev) => prev.filter((a) => a.id !== id));
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };
  const handleCreatePreview= async () => {
    const token = sessionStorage.getItem("jwt");
    if (!playlistName.trim()) {
      alert("Please choose a name for your playlist!");
      return;
    }
    const data = { artists };


    closeModal();
    try {
      const response = await fetch(
        "/api/generatePreview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate preview");
      }

      const result = await response.json();
      console.log("Preview result:", result);
      setPreviewTracks(result.tracks || []);
      setShowPreviewModal(true);
    } catch (error) {
      console.error("Error creating playlist preview:", error);
    }
  };

  const handleSaveToSpotify = async () => {
    const token = sessionStorage.getItem("jwt");
    if (!token) {
      alert("You need to be logged in to save to Spotify.");
      return;
    }

    const data = { playlistName, tracks: previewTracks };
    console.log("Saving playlist to Spotify with data:", data);

    try {
      const response = await fetch(
        "/api/generatePlaylists",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save playlist to Spotify");
      }

      const result = await response.json();
      alert("Playlist saved successfully!");
      setPlaylistName("");
      setShowPreviewModal(false);
      setPreviewTracks([]);
      setArtists([]);
      setPlaylistName("");
      setQuery("");
      localStorage.removeItem("selectedArtists");
    } catch (error) {
      console.error("Error saving playlist to Spotify:", error);
      alert("Failed to save playlist. Please try again.");
    }
  }
  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Create Playlist</h1>
        <p className="text-gray-600 mb-6">
          Search for your favorite artists below. Select them and choose how
          many songs you want from each.
        </p>

        {/* Artist Search Input */}
        <div className="relative mb-4" ref={wrapperRef}>
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder="Sök efter artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="absolute bg-white shadow-md border w-full mt-1 z-10 max-h-60 overflow-y-auto">
              {suggestions.map((artist) => (
                <li
                  key={artist.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => addArtist(artist)}
                >
                  {artist.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chosen Artists */}
        {artists.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Chosen Artists:</h2>
            <ul className="space-y-2">
              {(expanded
                ? [...artists].reverse()
                : [...artists].slice(-visibleCount).reverse()
              ).map((artist) => (
                <li
                  key={artist.id}
                  className="flex items-center justify-between bg-gray-100 p-3 rounded"
                >
                  <span className="font-medium">{artist.name}</span>
                  <div className="flex items-center space-x-2">
                    <label
                      htmlFor={`trackCount-${artist.id}`}
                      className="text-sm"
                    >
                      Tracks:
                    </label>
                    <input
                      id={`trackCount-${artist.id}`}
                      type="number"
                      min="1"
                      max="20"
                      value={artist.trackCount}
                      onChange={(e) =>
                        setArtists((prev) =>
                          prev.map((a) =>
                            a.id === artist.id
                              ? {
                                  ...a,
                                  trackCount: parseInt(e.target.value, 10),
                                }
                              : a
                          )
                        )
                      }
                      className="w-16 border rounded px-2 py-1"
                    />
                    {/* Remove Button */}
                    <button
                      onClick={() => removeArtist(artist.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="Remove artist"
                    >
                      ❌
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Expand/Collapse */}
            {artists.length > visibleCount && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={toggleExpand}
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  {expanded ? (
                    <>
                      Show less <ChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show all <ChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Generate Playlist Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => openModal()}
                className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition"
              >
                Generate Playlist
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Name your playlist</h3>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className="border p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePreview}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {showPreviewModal && previewTracks.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 max-w-2xl w-full shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Playlist Preview
            </h2>
            <h4 className="text-lg text-gray-700 mb-4 text-center italic">
              "{playlistName}"
            </h4>
            <ul className="space-y-4">
              {previewTracks.map((track, index) => (
                <li
                  key={`${track.trackName}-${track.artistName}-${index}`}
                  className="flex items-center space-x-4"
                >
                  <div>
                    <p className="font-medium">{track.trackName}</p>
                    <p className="text-sm text-gray-600">{track.artistName}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                onClick={() => setShowPreviewModal(false)}
              >
                Close
              </button>
              <button
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                onClick={handleSaveToSpotify}
              >
                Save to Spotify
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePlaylist;
