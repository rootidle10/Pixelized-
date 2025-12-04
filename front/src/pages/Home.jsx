import { Link } from "react-router-dom"; // IMPORTANT
import "./Home.css";

export default function Home() {
  return (
    <main className="home-container">
      {/* HERO TOP */}
      <section className="hero">
        <div className="hero-text">
          <p className="hero-badge">Jeux de logique</p>
          <h1>
            Entraîne ton cerveau <br />
            en t&apos;amusant.
          </h1>
          <p className="hero-subtitle">
            Sudoku, mots fléchés et bientôt d&apos;autres jeux pour booster ta
            logique et ta concentration.
          </p>

          <div className="hero-actions">
            {/* MODIFICATION ICI : Lien vers la page jeux */}
            <Link to="/jeux" className="btn-primary">
              Découvrir les jeux
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-tag">Sudoku</div>
            <img src="/sudoku.png" alt="Grille de sudoku" className="hero-image" />
            <button type="button" className="hero-play">Jouer</button>
          </div>
        </div>
      </section>

      {/* SECTION JEUX (Aperçu) */}
      <section id="games" className="games-section">
        <div className="games-header">
          <h2>Nos jeux populaires</h2>
          <p>Choisis un jeu et lance une partie en un clic.</p>
        </div>

        <div className="games-list">
          {/* CARD SUDOKU */}
          <article className="game-card">
            <div className="game-thumb">
              <img src="/sudoku.png" alt="Sudoku" />
            </div>
            <div className="game-info">
              <h3>Sudoku</h3>
              <p className="game-desc">Remplis la grille de 1 à 9...</p>
              <div className="game-tags">
                <span className="tag">Chiffres</span>
              </div>
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
              <p className="game-desc">Lis les définitions...</p>
              <div className="game-tags">
                <span className="tag">Lettres</span>
              </div>
              <Link to="/mots-fleches" className="btn-card">Jouer</Link>
            </div>
          </article>

          {/* CARD VOIR TOUS */}
          <article className="game-card game-card-seeall">
            {/* MODIFICATION ICI : Lien vers la page jeux */}
            <Link to="/jeux" className="seeall-content">
                Explorer tous les jeux
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}