import { Routes, Route } from "react-router-dom";
import Header from "./components/Header"; // Assure-toi que le chemin est bon
import Footer from "./components/Footer"; // Assure-toi que le chemin est bon
import Home from "./pages/Home";
import Games from "./pages/Games";
import AuthPage from "./pages/AuthPage"; // Import de la nouvelle page
import "./App.css";

function App() {
  return (
    <div className="layout">
      <Header />
      
      {/* Container principal qui change selon l'URL */}
      <div className="main-container-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jeux" element={<Games />} />
          
          {/* Nouvelle route pour la connexion/inscription */}
          <Route path="/login" element={<AuthPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;