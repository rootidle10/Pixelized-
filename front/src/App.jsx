import { Routes, Route } from "react-router-dom"; // Import des outils de routing
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Games from "./pages/Games"; // Import de ta nouvelle page
import "./App.css";

function App() {
  return (
    <div className="layout">
      {/* Le Header est visible sur toutes les pages */}
      <Header /> 
      
      {/* Zone de contenu qui change selon l'URL */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jeux" element={<Games />} />
        
        {/* Tu pourras ajouter tes jeux ici plus tard */}
        {/* <Route path="/sudoku" element={<SudokuGame />} /> */}
      </Routes>

      <Footer />
    </div>
  );
}

export default App;