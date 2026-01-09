import React from "react";
import "./Mots-fleches.css";

export default function MotFleches() {
  // ✅ CONFIGURATION : Grille (10x10)
  const gridLayout = [
    ["#", "A", "S", "T", "R", "E", "$", "#", "O", "R"],
    ["$", "M", "$", "$", "$", "$", "#", "E", "C", "U"],
    ["#", "O", "C", "E", "A", "N", "A", "#", "N", "U"],
    ["C", "U", "$", "$", "$", "$", "N", "N", "$", "$"],
    ["H", "R", "#", "P", "I", "A", "N", "O", "$", "#"],
    ["A", "$", "$", "$", "$", "$", "E", "$", "#", "I"],
    ["T", "$", "#", "J", "A", "R", "D", "I", "N", "L"],
    ["$", "$", "L", "$", "$", "$", "$", "$", "E", "E"],
    ["#", "C", "I", "E", "L", "$", "$", "$", "R", "$"],
    ["$", "$", "T", "$", "$", "$", "$", "$", "D", "$"],
  ];

  const flatGrid = gridLayout.flat();

  // ✅ CONFIGURATION : Indices
  const clueMapByIndex = {
    0: {
      number: 1,
      directions: [
        { dir: "right", text: "Corps céleste" },
        { dir: "down", text: "Sentiment passionné" },
      ],
    },
    7: {
      number: 2,
      directions: [
        { dir: "right", text: "Métal précieux" },
        { dir: "down", text: "Point cardinal" },
      ],
    },
    16: {
      number: 3,
      directions: [
        { dir: "right", text: "Monnaie du Moyen Âge" },
        { dir: "down", text: "Prénom féminin" },
      ],
    },
    20: {
      number: 4,
      directions: [
        { dir: "right", text: "Atlantique ou Pacifique" },
        { dir: "down", text: "Félin domestique" },
      ],
    },
    27: {
      number: 5,
      directions: [
        { dir: "right", text: "En tenue d'Adam" },
        { dir: "down", text: "Symbole du Nobélium" },
      ],
    },
    42: {
      number: 6,
      directions: [
        { dir: "right", text: "Instrument à cordes" },
      ],
    },
    58: {
      number: 7,
      directions: [
        { dir: "right", text: "Un chiffre romain" },
        { dir: "down", text: "Passionné d'informatique" },
      ],
    },
    62: {
      number: 8,
      directions: [
        { dir: "right", text: "Espace vert aménagé" },
        { dir: "down", text: "Meuble de repos" },
      ],
    },
    80: {
      number: 9,
      directions: [
        { dir: "right", text: "La voûte étoilée" },
      ],
    },
    49: {
      number: 10,
      directions: [
        { dir: "down", text: "Paradisiaque" },
      ],
    },
  };

  // Helpers
  const getOrientation = (dir) => (dir === "right" || dir === "left" ? "Horizontal" : "Vertical");

  const uniqByKey = (arr, getKey) => {
    const seen = new Set();
    return arr.filter((item) => {
      const k = getKey(item);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const allClues = Object.values(clueMapByIndex).sort((a, b) => a.number - b.number);
  const normalized = allClues.flatMap((c) =>
    (c.directions || []).map((d) => ({
      number: c.number,
      dir: d.dir,
      orientation: getOrientation(d.dir),
      text: d.text,
    }))
  );
  const normalizedUnique = uniqByKey(normalized, (x) => `${x.number}|${x.orientation}|${x.text}`);
  const horizontals = normalizedUnique.filter((x) => x.orientation === "Horizontal");
  const verticals = normalizedUnique.filter((x) => x.orientation === "Vertical");

  return (
    <main className="mot-fleche-page">
      <div className="hero-glow"></div>

      <div className="game-header animate-fade-in">
        <h1 className="game-title">
          <span className="text-gradient">Mots</span> Fléchés
        </h1>
        <p className="game-subtitle">Édition : Culture & Nature</p>
      </div>

      <div className="game-layout">
        <div className="side-panel panel-left animate-fade-in delay-2">
          <div className="control-card">
            <div className="card-header">
              <h3>Options</h3>
              <div className="decorative-line"></div>
            </div>
            <div className="control-group">
              <label className="info-label">Niveau</label>
              <div className="select-wrapper">
                <select className="game-select" disabled>
                  <option>Expérimenté</option>
                  <option>Débutant</option>
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </div>
            <button className="btn-primary start-btn-pulse" disabled>NOUVELLE PARTIE</button>
            <button className="btn-secondary" disabled>Pause</button>
          </div>
          <div className="rules-box">
            <div className="rules-header">Règles</div>
            <div className="rule-item">
              <div className="rule-icon info">?</div>
              <div className="rule-text"><strong>Survole les cases</strong><p>Indices interactifs.</p></div>
            </div>
            <div className="rule-item">
              <div className="rule-icon success">A</div>
              <div className="rule-text"><strong>Complète la grille</strong><p>Horizontal & Vertical.</p></div>
            </div>
          </div>
        </div>

        <div className="mot-fleche-card animate-fade-in delay-1">
          <div className="board-container">
            <div
              className="mf-board"
              style={{
                gridTemplateColumns: "repeat(10, var(--cell-size))",
                gridTemplateRows: "repeat(10, var(--cell-size))",
              }}
            >
              {flatGrid.map((cell, i) => {
                if (cell === "$") return <div key={i} className="mf-cell block" />;

                if (cell === "#") {
                  const clue = clueMapByIndex[i];
                  if (!clue) return <div key={i} className="mf-cell clue empty" />;

                  // ✅ SÉPARATION DES FLÈCHES (Horizontale vs Verticale)
                  const rawArrows = uniqByKey(
                    (clue?.directions ?? [{ dir: "right" }]).map((d) => ({ dir: d.dir })),
                    (x) => x.dir
                  );
                  const hArrows = rawArrows.filter(d => d.dir === 'right' || d.dir === 'left');
                  const vArrows = rawArrows.filter(d => d.dir === 'down' || d.dir === 'up');

                  // Calcul responsive (pour le tooltip)
                  const colIndex = i % 10;
                  const rowIndex = Math.floor(i / 10);
                  const isRightSide = colIndex >= 5;
                  const isBottomSide = rowIndex >= 7;

                  return (
                    <div key={i} className="mf-cell clue">
                      {/* LIGNE DU HAUT : Numéro + Flèche Droite */}
                      <div className="clue-top">
                        <div 
                          className={`clue-number-wrap ${isRightSide ? 'pop-left' : 'pop-right'} ${isBottomSide ? 'pop-top' : ''}`} 
                          tabIndex={0}
                        >
                          <span className="clue-number">{clue.number}</span>
                          <div className="clue-tooltip" role="tooltip">
                            <div className="tooltip-title">Indice {clue.number}</div>
                            {clue.directions.map((d, idx) => (
                              <div className="tooltip-line" key={idx}>
                                <span className="tooltip-tag">{getOrientation(d.dir)}</span>
                                <span className="tooltip-text">{d.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Flèches horizontales à côté du numéro */}
                        <div className="clue-arrows-row">
                          {hArrows.map((d, idx) => (
                            <span key={idx} className={`clue-arrow dir-${d.dir}`}>➤</span>
                          ))}
                        </div>
                      </div>

                      {/* LIGNE DU DESSOUS : Flèche Bas */}
                      {vArrows.length > 0 && (
                        <div className="clue-arrows-col">
                          {vArrows.map((d, idx) => (
                            <span key={idx} className={`clue-arrow dir-${d.dir}`}>➤</span>
                          ))}
                        </div>
                      )}

                      <div className="clue-text">Indice</div>
                    </div>
                  );
                }
                return (
                  <div key={i} className="mf-cell letter">
                    <span className="letter-value">{cell}</span>
                  </div>
                );
              })}
            </div>

            <section className="clues-panel">
              <div className="clues-panel-header">
                <h3>Définitions</h3>
                <div className="decorative-line"></div>
              </div>
              <div className="clues-columns">
                <div className="clues-col">
                  <div className="clues-col-title">Horizontal</div>
                  <ul className="clues-list">
                    {horizontals.map((c, idx) => (
                      <li key={idx} className="clue-item">
                        <span className="clue-badge">{c.number}</span>
                        <span className="clue-question">{c.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="clues-col">
                  <div className="clues-col-title">Vertical</div>
                  <ul className="clues-list">
                    {verticals.map((c, idx) => (
                      <li key={idx} className="clue-item">
                        <span className="clue-badge">{c.number}</span>
                        <span className="clue-question">{c.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="side-panel panel-right animate-fade-in delay-2">
          <div className="info-card">
            <div className="info-row">
              <span className="info-label">Chrono</span>
              <span className="info-value">04:20</span>
            </div>
            <div className="info-row">
              <span className="info-label">Progression</span>
              <span className="info-value score-good">100%</span>
            </div>
            <div className="status-badge won">Grille Complète !</div>
          </div>
        </div>
      </div>
    </main>
  );
}