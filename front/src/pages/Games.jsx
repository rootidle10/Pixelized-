import { Link } from "react-router-dom";
import "./Games.css";

export default function Games() {
  return (
    <main className="games-page-container">
      <div className="games-page-header">
        <h1>Tous nos jeux</h1>
        <p>Choisis ton défi et commence à jouer !</p>
      </div>

      <div className="games-grid">
        {/* CARD SUDOKU */}
        <article className="game-card">
          <div className="game-thumb">
            <img src="/sudoku.png" alt="Sudoku" />
          </div>
          <div className="game-info">
            <h3>Sudoku</h3>
            <p className="game-desc">
              Remplis la grille de 1 à 9 sans doublons.
            </p>
            <div className="game-tags">
              <span className="tag">Chiffres</span>
              <span className="tag">Logique</span>
            </div>
            {/* Lien vers le jeu (page à créer plus tard ou lien existant) */}
            <Link to="/sudoku" className="btn-card">Jouer</Link>
          </div>
        </article>

        {/* CARD MOTS FLÉCHÉS */}
        <article className="game-card">
          <div className="game-thumb">
            <img src="/mot-fleche.png" alt="Mots fléchés" />
          </div>
          <div className="game-info">
            <h3>Mots fléchés</h3>
            <p className="game-desc">
              Retrouve le bon mot pour chaque flèche.
            </p>
            <div className="game-tags">
              <span className="tag">Lettres</span>
              <span className="tag">Vocabulaire</span>
            </div>
            <Link to="/mots-fleches" className="btn-card">Jouer</Link>
          </div>
        </article>
      </div>
    </main>
  );
}