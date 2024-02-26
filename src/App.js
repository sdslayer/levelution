import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Auth } from "./pages/auth/index";
import { Main } from "./pages/main/index";
import { User } from "./pages/user/index";
import { Search } from "./pages/search/index";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" exact element={<Auth />} />
          <Route path="/main" exact element={<Main />} />
          <Route path="/user" exact element={<User />} />
          <Route path="/search" exact element={<Search />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
