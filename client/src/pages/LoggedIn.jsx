import React from "react";
import Header from "../components/Header.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LoggedIn = () => {
  const [userName, setUsername] = useState("");
  const [topSongs, setTopSongs] = useState([]);

  const navigate = useNavigate();
  useEffect(() => {
    const urlHash = window.location.hash;
    const token = new URLSearchParams(urlHash.substring(1)).get("token") || sessionStorage.getItem("jwt");
    if (token) {
      sessionStorage.setItem("jwt", token);
      console.log("✅ Token saved to sessionStorage", `Bearer ${token}`);
    }

    fetch("/api/user", {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    })
      .then( (res) => {
        if (!res.ok) {
          console.error("Non-OK response:", res.status);
          throw new Error("Not authenticated");
        }
        return res.json(); // bara denna gång – ta bort res.text()
      })
      .then((data) => {
        console.log("✅ User data:", data);
        setUsername(data.name);
        setTopSongs(data.topSongs || []);
      })
      .catch((err) => {
        console.error("Authentication failed, redirecting to homepage", err);
        navigate("/");
      });
  }, [navigate]);

  return (
    <>
      <Header />
      <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-8 sm:py-12 overflow-x-hidden">
        {/* Hälsning */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center break-words">
          Hi {userName}!
        </h1>

        {/* Topplåtar */}
        <div className="w-full max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">
            Your top 5 songs right now:
          </h2>

          <div className="flex flex-col space-y-4 overflow-y-auto max-h-[70vh] px-2">
            {topSongs.map((song, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-full"
              >
                <h3 className="text-base sm:text-lg font-semibold truncate">
                  {song.lattitel}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 truncate">
                  {song.artist}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoggedIn;
