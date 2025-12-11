import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <main className="main-content">
      {/* SECTION HERO */}
      <section className="hero-section">
        {/* CORRECTION ICI : On retire animate-fade-in du parent */}
        <div className="hero-content">
          
          {/* On ajoute animate-fade-in sur chaque enfant */}
          <span className="pill-badge animate-fade-in delay-1">
            ✨ Nouvelle Version
          </span>
          
          <h1 className="hero-title animate-fade-in delay-1">
            Muscle ton cerveau <br /> avec <span className="text-gradient">Pixelized</span>.
          </h1>
          
          <p className="hero-desc animate-fade-in delay-2">
            Rejoins la communauté et améliore ta logique quotidienne grâce à nos jeux conçus pour stimuler ta concentration.
          </p>
          
          <div className="hero-btns animate-fade-in delay-3">
            <Link to="/jeux" className="btn-primary">Jouer maintenant</Link>
            <a href="#features" className="btn-secondary">Découvrir</a>
          </div>
        </div>

        {/* CERCLE DE FOND POUR EFFET GLOW */}
        <div className="hero-glow"></div>

        {/* Celui-ci fonctionnait déjà, mais c'est bien de vérifier */}
<div className="hero-visual animate-fade-in delay-2">
          
          {/* CARTE FLOTTANTE 1 : SUDOKU (Devenue un Link) */}
          <Link to="/sudoku" className="floating-card c-sudoku interactive-float">
            <img src="/sudoku.png" alt="Sudoku" />
            <span className="card-label">Sudoku</span>
          </Link>

          {/* CARTE FLOTTANTE 2 : MOTS FLÉCHÉS (Devenue un Link) */}
          <Link to="/mots-fleches" className="floating-card c-words interactive-float">
             <img src="/mot-fleche.png" alt="Mots fléchés" />
             <span className="card-label">Mots Fléchés</span>
          </Link>

        </div>
      </section>

      {/* SECTION BENTO GRID */}
      <section id="features" className="featured-section animate-fade-in delay-3">
        <div className="section-header">
          <h2>À toi de jouer</h2>
          <Link to="/jeux" className="link-arrow">Tout voir →</Link>
        </div>

        <div className="bento-grid">
          {/* CARTE 1 : SUDOKU (Cliquable grâce à Link) */}
          <Link to="/sudoku" className="bento-card large-card interactive-card">
            <div className="bento-text">
              <span className="bento-tag">Populaire</span>
              <h3>Sudoku Classique</h3>
              <p>Logique pure. 3 niveaux de difficulté pour progresser à ton rythme.</p>
              {/* Petit indicateur visuel pour le clic */}
              <span className="fake-link">Lancer une partie &rarr;</span>
            </div>
            <img src="/sudoku.png" alt="Sudoku" className="bento-img" />
          </Link>

          {/* CARTE 2 : MOTS FLÉCHÉS (Cliquable grâce à Link) */}
          <Link to="/mots-fleches" className="bento-card standard-card interactive-card">
            <div className="bento-text">
              <h3>Mots Fléchés</h3>
              <p>Enrichis ton vocabulaire.</p>
              <span className="fake-link">Jouer &rarr;</span>
            </div>
            <div className="icon-wrapper">Aa</div>
          </Link>

          {/* CARTE 3 : BIENTÔT (Non cliquable) */}
          <div className="bento-card disabled-card">
            <div className="bento-text">
              <h3>Bientôt...</h3>
              <p>D'autres jeux arrivent.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}