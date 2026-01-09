import { Link } from "react-router-dom";
import "./Games.css";

const gamesData = [
  {
    id: "sudoku",
    title: "Sudoku",
    subtitle: "Le classique des chiffres",
    desc: "Un jeu de logique pure pour stimuler ta concentration et ta déduction.",
    img: "/sudoku.png", // Assure-toi que l'image est bien dans public/
    link: "/sudoku",
    color: "#e0f2fe", // Bleu très doux (cohérent avec le thème Sudoku)
    rules: [
      "La grille est composée de 9 carrés de 3x3 cases.",
      "Remplis les cases vides avec des chiffres de 1 à 9.",
      "Chaque chiffre ne doit apparaître qu'une seule fois par ligne.",
      "Chaque chiffre ne doit apparaître qu'une seule fois par colonne.",
      "Chaque chiffre ne doit apparaître qu'une seule fois par carré de 3x3."
    ]
  },
  {
    id: "mots-fleches",
    title: "Mots Fléchés",
    subtitle: "Culture et vocabulaire",
    desc: "Déchiffre les définitions et remplis la grille avec les bons mots.",
    img: "/mot-fleche.png", // Assure-toi que l'image est bien dans public/
    link: "/mots-fleches",
    color: "#fef3c7", // Jaune/Or très doux
    rules: [
      "Observe la flèche : elle t'indique le sens du mot (horizontal ou vertical).",
      "Lis la définition inscrite dans la case de départ.",
      "Trouve le mot correspondant au nombre de cases vides.",
      "Une lettre par case. Les accents sont souvent ignorés.",
      "Les mots se croisent : aide-toi des lettres déjà trouvées !"
    ]
  }
];

export default function Games() {
  return (
    <main className="games-page">
      <div className="games-header animate-fade-in delay-1">
        <h1>Les Règles du Jeu</h1>
        <p>Prends le temps de comprendre avant de te lancer.</p>
      </div>

      <div className="games-list-detailed">
        {gamesData.map((game, index) => (
          <article 
            key={game.id} 
            className="game-row animate-fade-in"
            style={{ animationDelay: `${(index + 2) * 0.1}s` }}
          >
            {/* PARTIE VISUELLE (GAUCHE) */}
            <div className="game-visual" style={{ backgroundColor: game.color }}>
              <img src={game.img} alt={game.title} />
              <Link to={game.link} className="btn-play-overlay">
                Lancer une partie
              </Link>
            </div>

            {/* PARTIE CONTENU (DROITE) */}
            <div className="game-details">
              <div className="details-header">
                <h2>{game.title}</h2>
                <span className="subtitle">{game.subtitle}</span>
              </div>
              
              <p className="game-description">{game.desc}</p>

              <div className="rules-container">
                <h3>Comment jouer ?</h3>
                <ul className="rules-list">
                  {game.rules.map((rule, i) => (
                    <li key={i}>
                      {/* Le numéro stylisé (correspond à ta classe .rule-number du CSS précédent) */}
                      <span className="rule-number">{i + 1}</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mobile-action">
                 <Link to={game.link} className="btn-primary-small">Jouer maintenant</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}