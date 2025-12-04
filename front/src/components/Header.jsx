import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // Ferme le menu quand on clique sur un lien
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="header-glass">
      <div className="header-container">
        {/* LOGO */}
        <Link to="/" className="brand-link" onClick={closeMenu}>
          <img src="/pixelized.png" alt="Pixelized" className="brand-logo" />
        </Link>

        {/* BURGER ICON (Visible seulement sur mobile) */}
        <button 
          className={`burger-btn ${isOpen ? "open" : ""}`} 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* NAV & ACTIONS (Cachés sur mobile sauf si isOpen) */}
        <div className={`nav-wrapper ${isOpen ? "is-active" : ""}`}>
          <nav className="nav-desktop">
            <NavLink to="/" className="nav-item" onClick={closeMenu}>Accueil</NavLink>
            <NavLink to="/jeux" className="nav-item" onClick={closeMenu}>Nos Jeux</NavLink>
          </nav>

          <div className="header-actions">
            <Link to="/login" className="btn-login" onClick={closeMenu}>Connexion</Link>
          </div>
        </div>
      </div>
    </header>
  );
}