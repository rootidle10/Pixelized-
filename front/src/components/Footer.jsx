import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          {/* Modification ici : logo image */}
          <img src="/pixelized.png" alt="Pixelized Logo" className="footer-logo" />
          <p>La plateforme de jeux de logique nouvelle génération.</p>
        </div>
        <div className="footer-links">
          <a href="#">Mentions Légales</a>
          <a href="#">Contact</a>
          <a href="#">Twitter</a>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Pixelized. Tous droits réservés.
      </div>
    </footer>
  );
}