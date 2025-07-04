
const loginSpotify = async () => {
    window.location.href = '/login';
}

function HomePage() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-10 sm:py-16 md:py-24 text-gray-900">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-10 sm:mb-14 md:mb-20 max-w-[90vw] text-center">
          Ivar's Spotify App
        </h1>
  
        <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 mb-12">
          <p className="text-center text-base sm:text-lg md:text-xl font-semibold mb-8 sm:mb-10 text-gray-700 max-w-[90vw] mx-auto">
            Connect your Spotify account and then:
          </p>
  
          <ul className="space-y-5 sm:space-y-6 md:space-y-8 max-w-[90vw] mx-auto">
            {[
              "Create playlists with your favorite artists",
              "See your statistics",
              "Export your playlists to Spotify",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center space-x-3 sm:space-x-4 bg-gray-100 rounded-md p-3 sm:p-4 hover:bg-gray-200 transition"
              >
                <svg
                  className="w-6 sm:w-7 h-6 sm:h-7 text-green-500 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="font-medium text-gray-800 text-sm sm:text-base md:text-lg">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
  
        <button
          className="bg-green-500 text-white font-semibold py-3 px-6 sm:py-4 sm:px-10 rounded-full shadow-md hover:bg-green-600 transition transform hover:-translate-y-1 max-w-[90vw] sm:max-w-xs text-sm sm:text-base md:text-lg truncate"
          aria-label="Connect your Spotify account"
            onClick={loginSpotify}>
          Connect your Spotify account
        </button>
      </div>
    );
  }
  
  export default HomePage;