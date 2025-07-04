import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const About = () => {
  const navigate = useNavigate();
  const loading = false; // Placeholder for loading state
  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    fetch("/api/protected", {
      method: "GET",
      credentials: "include",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error("Not authenticated");
        }
      })
      .then((data) => {
        console.log("Protected data:", data);
      })
      .catch(() => {
        navigate("/");
      });
  }, [navigate]);
  return (
    <>
      <Header />
      <div className="bg-white shadow-md rounded-2xl max-w-3xl mx-auto mt-20 p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">About</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Welcome to{" "}
          <span className="font-semibold text-black">Ivar's Spotify App</span>,
          a summer 2025 coding project. This app lets you explore your top
          tracks, create personalized playlists, and discover new music based on
          your listening habits.
        </p>
      </div>
      {/*<div className="max-w-xl mx-auto mt-12 text-center">
      <button
        className="bg-black text-white px-6 py-3 rounded-xl shadow hover:bg-gray-800 transition"
      >
        {loading ? 'Generating…' : '🎵 Press here to generate 5 songs based on your listening habits'}
      </button>

    </div>*/}
    </>
  );
};

export default About;
