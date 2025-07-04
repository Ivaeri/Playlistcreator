import React, { useState, useEffect } from "react";
import Header from "../components/Header";

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      const token = sessionStorage.getItem("jwt");
      setLoading(true);
      try {
        // Replace with your API call
        const response = await fetch(
          "/api/statistics",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`, // Lägg till token som Bearer
            },
          }
        );
        const data = await response.json();
        console.log("Statistics data:", data);
        setStats(data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="statistics-loading">Loading your statistics...</div>;
  }

  if (!stats) {
    return <div className="statistics-error">Failed to load statistics.</div>;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">
          Your Spotify Statistics
        </h1>
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-lg font-medium text-gray-700">
              <p>Followers:</p>
              <p className="text-gray-900 font-semibold">{stats.followers}</p>
            </div>
            <div className="text-lg font-medium text-gray-700">
              <p>Your top three artists:</p>
              <p className="text-gray-900 font-semibold">
                {stats.topThreeArtists.map((artist, index) => (
                  <React.Fragment key={index}>
                    <span>{artist.name}</span>
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>
            <div className="text-lg font-medium text-gray-700">
              <p>Total Playlists:</p>
              <p className="text-gray-900 font-semibold">
                {stats.playlists.length}
              </p>
            </div>
            <div className="text-lg font-medium text-gray-700">
              <p>Total saved tracks:</p>
              <p className="text-gray-900 font-semibold">{stats.savedTracks.length}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;
