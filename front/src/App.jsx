import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Games from "./pages/Games";
// import Login from "./pages/Login"; // À créer plus tard
import "./App.css"; // Généralement vide si tout est dans index.css, mais garde-le

function App() {
  return (
    <div className="app-layout">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jeux" element={<Games />} />
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
      <Footer />
    </div>
  );
}

export default App;