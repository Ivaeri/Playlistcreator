import React, { useState } from 'react';


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const logout = () => {
    sessionStorage.removeItem("jwt");
    localStorage.removeItem("selectedArtists");
    window.location.href = '/';
  }

  const navigateToAbout = () => {
    window.location.href = '/about';
  }

  const navigateToCreatePlaylist = () => {
    window.location.href = '/createPlaylist';
  }

  const navigateToStatistics = () => {
    window.location.href = '/statistics';
  }

  const navigateToLoggedIn = () => {
    window.location.href = '/loggedIn';
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md relative top-4 max-w-4xl mx-auto rounded-lg">
      <h1 className="text-3xl sm:text-4xl font-bold text-black cursor-pointer hover:underline" onClick={navigateToLoggedIn}>Ivar's Spotify App</h1>

      {/* Hamburgermeny för mindre skärmar */}
      <div className="sm:hidden">
        <button
          className="text-black focus:outline-none"
          onClick={toggleMenu}
        >
          {/* Hamburgerikon */}
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Knappval för större skärmar */}
      <nav className="hidden sm:flex space-x-3">
        <button className="text-black py-2 px-4 rounded-md hover:underline" onClick={navigateToStatistics}>
          Statistics
        </button>
        <button className="text-black py-2 px-4 rounded-md hover:underline" onClick={navigateToCreatePlaylist}>
          Create Playlist
        </button>
        <button className="text-black py-2 px-4 rounded-md hover:underline" onClick={navigateToAbout}>
          About
        </button>
        <button className="bg-black hover:bg-red-700 text-white py-2 px-4 rounded-md" onClick={logout}>
          Sign Out
        </button>
      </nav>

      {/* Meny som öppnar sig utanför headern */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 w-44 bg-white shadow-lg rounded-lg mt-2 z-10">
          <ul className="flex flex-col space-y-2 p-4">
            <li>
              <button className="text-black py-2 px-4 rounded-md hover:bg-gray-100 w-full text-left" onClick={navigateToStatistics}>
                Statistics
              </button>
            </li>
            <li>
              <button className="text-black py-2 px-4 rounded-md hover:bg-gray-100 w-full text-left" onClick={navigateToCreatePlaylist}>
                Create Playlist
              </button>
            </li>
            <li>
              <button className="text-black py-2 px-4 rounded-md hover:bg-gray-100 w-full text-left" onClick={navigateToAbout}>
                About
              </button>
            </li>
            <li>
              <button className="bg-black hover:bg-red-700 text-white py-2 px-4 rounded-md w-full text-left" onClick={logout}>
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;