import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // Import du context
import "./Header.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth(); // Récupère l'utilisateur et la fonction logout

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
            {user ? (
              <>
                <Link to="/profile" className="btn-login" onClick={closeMenu}>
                  Profil
                </Link>
                <button className="btn-login" onClick={() => { logout(); closeMenu(); }}>
                  Déconnexion
                </button>
              </>
            ) : (
              // Si pas connecté : bouton connexion
              <Link to="/login" className="btn-login" onClick={closeMenu}>
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
