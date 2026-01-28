import { Link } from "react-router-dom";
import { useAuth, user, token, authFetch } from "../context/AuthContext.jsx";
import { useEffect, useMemo, useState } from "react";
import "./Profile.css";

const GAME_LABELS = {
  "sudoku-classique": { title: "Sudoku", subtitle: "Grille 9x9", accent: "blue" },
  "crossword-culture": { title: "Mots fléchés", subtitle: "Culture & Nature", accent: "purple" },
};



function formatResultLabel(result) {
  if (!result) return "partie";
  if (result === "won") return "gagné ✅";
  if (result === "lost_time") return "temps écoulé ⏱️";
  if (result === "lost_score") return "score à 0 💥";
  if (result === "solved_bot") return "solution (bot) 🤖";
  return result;
}

function normalizeDifficulty(diff) {
  if (!diff) return "—";
  const d = String(diff).toLowerCase();

  // compat anciens enregistrements éventuels
  if (d === "simple") return "easy";
  if (d === "facile") return "easy";

  if (d === "moyen") return "medium";
  if (d === "intermediaire" || d === "intermédiaire") return "medium";

  if (d === "difficile") return "hard";

  if (d === "easy" || d === "medium" || d === "hard") return d;
  return d;
}

function difficultyLabel(diff) {
  const d = normalizeDifficulty(diff);
  if (d === "easy") return "Facile";
  if (d === "medium") return "Moyen";
  if (d === "hard") return "Difficile";
  return d;
}

export default function Profile() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user, token, authFetch } = useAuth();

  const [loading, setLoading] = useState(false);
  const [best, setBest] = useState({});
  const [history, setHistory] = useState([]);

  const [historyFilter, setHistoryFilter] = useState("all"); 
  const [visibleHistory, setVisibleHistory] = useState(20);

  const pseudo = useMemo(() => user?.name || "Joueur", [user]);
  const email = useMemo(() => user?.email || "", [user]);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_URL}/api/profile`, { method: "GET" });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.ok) {
          setBest(data.best || {});
          setHistory(Array.isArray(data.history) ? data.history : []);
        } else {
          console.error("Profile API error:", res.status, data);
          setBest({});
          setHistory([]);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setBest({});
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const bestScores = useMemo(() => {
    const gameSlugs = ["sudoku-classique", "crossword-culture"];

    return gameSlugs.map((slug) => {
      const meta = GAME_LABELS[slug] || { title: slug, subtitle: "", accent: "blue" };
      const perDiffRaw = best?.[slug] || {};

      // Normalize keys: easy/medium/hard (and support older ones)
      const perDiff = {
        easy: perDiffRaw.easy ?? perDiffRaw.simple ?? null,
        medium: perDiffRaw.medium ?? null,
        hard: perDiffRaw.hard ?? null,
      };

      const allVals = Object.values(perDiff).filter((v) => typeof v === "number");
      const bestOverall = allVals.length ? Math.max(...allVals) : null;

      return {
        key: slug,
        title: meta.title,
        subtitle: meta.subtitle,
        accent: meta.accent,
        bestOverall,
        perDiff,
      };
    });
  }, [best]);

  const historyFiltered = useMemo(() => {
    if (!history?.length) return [];
    if (historyFilter === "all") return history;
    return history.filter((h) => h.game_slug === historyFilter);
  }, [history, historyFilter]);

  const historyRows = useMemo(() => {
    if (!historyFiltered.length) return [];

    return historyFiltered.slice(0, visibleHistory).map((h) => {
      const d = h.achieved_at ? new Date(h.achieved_at) : null;
      const dateLabel = d ? d.toLocaleString("fr-FR") : "—";

      const diff = difficultyLabel(h.difficulty);
      const resLabel = formatResultLabel(h.result);

      const slug = h.game_slug || "unknown";
      const meta = GAME_LABELS[slug];
      const gameName = meta?.title || h.game_name || slug;

      return {
        id: h.id,
        game: gameName,
        detail: `${diff} • ${resLabel}`,
        date: dateLabel,
        score: typeof h.score === "number" ? h.score : "—",
        isHigh: !!h.is_highscore,
      };
    });
  }, [historyFiltered, visibleHistory]);

  const canLoadMore = historyFiltered.length > visibleHistory;

  if (!user) {
    return (
      <main className="profile-page">
        <div className="hero-glow"></div>

        <div className="profile-header">
          <h1 className="profile-title">
            <span className="text-gradient">Profil</span>
          </h1>
          <p className="profile-subtitle">Connecte-toi pour voir tes meilleurs scores et ton historique.</p>
        </div>

        <div className="profile-empty-card">
          <div className="empty-icon">🔒</div>
          <div className="empty-title">Tu n’es pas connecté</div>
          <div className="empty-text">Pour enregistrer tes scores, il faut un compte.</div>

          <div className="empty-actions">
            <Link className="btn-primary" to="/login">
              Se connecter
            </Link>
            <Link className="btn-ghost" to="/register">
              Créer un compte
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="hero-glow"></div>

      <div className="profile-header">
        <div className="avatar">
          <span>{pseudo?.slice(0, 1)?.toUpperCase()}</span>
        </div>

        <div className="profile-head-text">
          <div className="pill-badge">Espace joueur</div>
          <h1 className="profile-title">
            Salut <span className="text-gradient">{pseudo}</span>
          </h1>
          <p className="profile-subtitle">{email}</p>
        </div>
      </div>

      {/* HISTORY FIRST */}
      <section className="profile-section">
        <div className="section-top">
          <h2>Historique</h2>
          <p>Tous tes scores enregistrés (les meilleurs sont marqués ⭐).</p>
        </div>

        <div className="activity-card">
          <div className="activity-footer filterbar">
            <div className="filter-left">
              <span className="activity-note">Filtrer :</span>
              <select
                value={historyFilter}
                onChange={(e) => {
                  setHistoryFilter(e.target.value);
                  setVisibleHistory(20);
                }}
                className="filter-select"
              >
                <option value="all">Tous les jeux</option>
                <option value="sudoku-classique">Sudoku</option>
                <option value="crossword-culture">Mots fléchés</option>
              </select>
            </div>

            <div className="activity-note">{loading ? "Chargement..." : `${historyFiltered.length} partie(s)`}</div>
          </div>

          <div className="activity-table">
            <div className="activity-row head">
              <div>Jeu</div>
              <div>Détail</div>
              <div>Date</div>
              <div>Score</div>
            </div>

            {historyRows.length ? (
              historyRows.map((item) => (
                <div className="activity-row" key={item.id}>
                  <div className="activity-game">
                    {item.game}{" "}
                    {item.isHigh ? (
                      <span title="Meilleur score" style={{ marginLeft: 6 }}>
                        ⭐
                      </span>
                    ) : null}
                  </div>
                  <div className="activity-detail">{item.detail}</div>
                  <div className="activity-date">{item.date}</div>
                  <div className="activity-score">{item.score}</div>
                </div>
              ))
            ) : (
              <div className="activity-row">
                <div className="activity-game">—</div>
                <div className="activity-detail">Aucune partie enregistrée pour le moment.</div>
                <div className="activity-date">—</div>
                <div className="activity-score">—</div>
              </div>
            )}
          </div>

          {canLoadMore ? (
            <div className="activity-footer" style={{ justifyContent: "center" }}>
              <button className="btn-ghost" onClick={() => setVisibleHistory((v) => v + 20)} type="button">
                Afficher plus
              </button>
            </div>
          ) : null}


        </div>
      </section>

      {/* BEST SCORES */}
      <section className="profile-section">
        <div className="section-top">
          <h2>Meilleurs scores</h2>
          <p>Ton meilleur score par jeu + par niveau.</p>
        </div>

        <div className="score-grid">
          {bestScores.map((g) => (
            <div key={g.key} className={`score-card accent-${g.accent}`}>
              <div className="score-card-top">
                <div>
                  <div className="score-title">{g.title}</div>
                  <div className="score-subtitle">{g.subtitle}</div>
                </div>

                <div className="score-big">{g.bestOverall !== null ? g.bestOverall : "—"}</div>
              </div>

              <div className="score-split">
                <div>
                  Facile : <strong>{g.perDiff?.easy ?? "—"}</strong>
                </div>
                <div>
                  Moyen : <strong>{g.perDiff?.medium ?? "—"}</strong>
                </div>
                <div>
                  Difficile : <strong>{g.perDiff?.hard ?? "—"}</strong>
                </div>
              </div>

              <div className="score-card-bottom">
                <div className="score-hint">⭐ = meilleur score enregistré pour ce niveau</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}