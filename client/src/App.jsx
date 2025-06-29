import HomePage from "./pages/Homepage";
import LoggedIn from "./pages/LoggedIn";
import About from "./pages/About";
import Statistics from "./pages/statistics";
import CreatePlaylist from "./pages/createplaylist";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/loggedIn" element={<LoggedIn />} />
        <Route path="/about" element={<About />} />
        <Route path="/createPlaylist" element={<CreatePlaylist />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </Router>
  );
}

export default App;
