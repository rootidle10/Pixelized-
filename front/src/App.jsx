import { Routes, Route } from "react-router-dom";
import Header from "./components/Header"; 
import Footer from "./components/Footer"; 
import Home from "./pages/Home";
import Games from "./pages/Games";
import AuthPage from "./pages/AuthPage"; 
import Sudoku from "./pages/Sudoku"; 
import MotFleches from "./pages/Mots-fleches";
import Profile from "./pages/Profile";
import "./App.css";

function App() {
  return (
    <div className="layout">
      <Header />
      <div className="main-container-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jeux" element={<Games />} />
          <Route path="/mots-fleches" element={<MotFleches />} />
          <Route path="/sudoku" element={<Sudoku />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;