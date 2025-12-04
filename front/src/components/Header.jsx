import { Link, NavLink } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        {/* LOGO */}
        <Link to="/" className="logo">
          Logic<span className="logo-accent">Games</span>.
        </Link>

        {/* NAVIGATION */}
        <nav className="nav-menu">
          <NavLink to="/" className="nav-link">
            Accueil
          </NavLink>
          
          <NavLink to="/jeux" className="nav-link">
            Jeux
          </NavLink>

          {/* BOUTON CONNEXION */}
          {/* J'ai changé la classe en 'btn-login' pour être plus précis */}
          <Link to="/login" className="btn-login">
            Connexion
          </Link>
        </nav>
      </div>
    </header>
  );
}