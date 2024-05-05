import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Auth } from "./pages/auth/index";
import { Main } from "./pages/main/index";
import { User } from "./pages/user/index";
import { Search } from "./pages/search/index";
import { Leaderboards } from './pages/leaderboards/index';
import { Help } from './pages/help/index';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" exact element={<Auth />} />
          <Route path="/main" exact element={<Main />} />
          <Route path="/user" exact element={<User />} />
          <Route path="/search" exact element={<Search />} />
          <Route path="/leaderboards" exact element={<Leaderboards />} />
          <Route path="/help" exact element={<Help />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
