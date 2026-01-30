import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Header.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="header-glass">
      <div className="header-container">
        <Link to="/" className="brand-link" onClick={closeMenu}>
          <img src="/pixelized.png" alt="Pixelized" className="brand-logo" />
        </Link>

        <button
          className={`burger-btn ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-wrapper ${isOpen ? "is-active" : ""}`}>
          <nav className="nav-desktop">
            <NavLink to="/" className="nav-item" onClick={closeMenu}>
              Accueil
            </NavLink>
            <NavLink to="/jeux" className="nav-item" onClick={closeMenu}>
              Nos Jeux
            </NavLink>

            {user ? (
              <NavLink to="/profil" className="nav-item" onClick={closeMenu}>
                Profil
              </NavLink>
            ) : null}
          </nav>

          <div className="header-actions">
            {user ? (
              <button
                className="btn-login"
                onClick={async () => {
                  await logout(API_URL);
                  closeMenu();
                }}
              >
                Déconnexion
              </button>
            ) : (
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
