import "./Footer.css"

export default function Footer() {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} Pixelized — Site de jeux de logique
    </footer>
  );
}
