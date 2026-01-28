import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Mots-fleches.css";

const GRID_SIZE = 10;
const TOTAL_SECONDS = 10 * 60;
const BASE_SCORE = 1000;

const WORD_POINTS_GOOD = 80;
const WORD_POINTS_BAD = 40;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function MotFleches() {
  const { user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL;

  const [level, setLevel] = useState("easy");
  const [gameId, setGameId] = useState(null);

  // grille joueur ("" / "$" / "#")
  const [grid, setGrid] = useState(null);

  // solution complète
  const [solution, setSolution] = useState(null);

  // indices
  const [clueMapByIndex, setClueMapByIndex] = useState({});

  // timer
  const [remainingSec, setRemainingSec] = useState(TOTAL_SECONDS);
  const timerRef = useRef(null);

  // score
  const [wordDelta, setWordDelta] = useState(0);
  const [isGameAbandoned, setIsGameAbandoned] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  // saisie
  const [typingDir, setTypingDir] = useState("right"); // "right" | "down"
  const inputRefs = useRef({}); // "r-c" -> element

  // Helpers
  const getOrientation = (dir) =>
    dir === "right" || dir === "left" ? "Horizontal" : "Vertical";

  const uniqByKey = (arr, getKey) => {
    const seen = new Set();
    return arr.filter((item) => {
      const k = getKey(item);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  // grille à plat
  const flatGrid = useMemo(() => (grid ? grid.flat() : []), [grid]);

  // score temps
  const timeScore = useMemo(() => {
    const ratio = remainingSec / TOTAL_SECONDS;
    return Math.round(BASE_SCORE * ratio);
  }, [remainingSec]);

  // score total
  const totalScore = useMemo(() => {
    if (isGameAbandoned) return 0;
    if (isGameFinished && finalResult) {
      return finalResult.totalScore;
    }
    // score temps
    return clamp(timeScore, 0, BASE_SCORE);
  }, [timeScore, isGameAbandoned, isGameFinished, finalResult]);

  // Timer
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Démarre / arrête le timer
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // Lance le timer
  const startTimer = () => {
    stopTimer();
    setRemainingSec(TOTAL_SECONDS);

    timerRef.current = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cases
  const isLetterCell = (r, c, g = grid) => {
    const cell = g?.[r]?.[c];
    return cell !== undefined && cell !== "$" && cell !== "#";
  };

  // Focus
  const focusCell = (r, c) => {
    const el = inputRefs.current[`${r}-${c}`];
    if (el) el.focus();
  };

  // Navigation
  const stepFrom = (r, c, dir) => {
    if (dir === "right") return [r, c + 1];
    if (dir === "left") return [r, c - 1];
    if (dir === "down") return [r + 1, c];
    if (dir === "up") return [r - 1, c];
    return [r, c];
  };

  // Trouve la prochaine case lettre dans une direction
  const findNextCell = (r, c, dir, g = grid) => {
    let [nr, nc] = stepFrom(r, c, dir);
    while (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
      if (isLetterCell(nr, nc, g)) return { r: nr, c: nc };
      [nr, nc] = stepFrom(nr, nc, dir);
    }
    return null;
  };

  // Trouve la case lettre précédente dans une direction
  const findPrevCell = (r, c, dir, g = grid) => {
    const opposite =
      dir === "right"
        ? "left"
        : dir === "left"
          ? "right"
          : dir === "down"
            ? "up"
            : "down";
    return findNextCell(r, c, opposite, g);
  };

  // Mots
  const getWordCellsFrom = (startIndex, dir) => {
    const cells = [];
    const sr = Math.floor(startIndex / GRID_SIZE);
    const sc = startIndex % GRID_SIZE;

    let [r, c] = stepFrom(sr, sc, dir);

    while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
      const cell = grid?.[r]?.[c];
      if (cell === "$" || cell === "#") break;
      cells.push([r, c]);
      [r, c] = stepFrom(r, c, dir);
    }

    return cells;
  };

  // Tous les mots de la grille
  const allWords = useMemo(() => {
    if (!grid || !solution) return [];

    const words = [];
    Object.entries(clueMapByIndex || {}).forEach(([idxStr, clue]) => {
      const startIndex = Number(idxStr);
      (clue?.directions || []).forEach((d) => {
        const dir = d.dir;
        const cells = getWordCellsFrom(startIndex, dir);
        if (cells.length === 0) return;

        const key = `${clue.number}|${dir}`;
        words.push({
          key,
          number: clue.number,
          dir,
          orientation: getOrientation(dir),
          text: d.text,
          cells,
        });
      });
    });

    return uniqByKey(words, (w) => w.key);
  }, [grid, solution, clueMapByIndex]);

  // Vérification quand toutes les cases sont remplies
  const isGridComplete = useMemo(() => {
    if (!grid) return false;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = grid[r][c];
        // Si c'est une case lettre (ni $ ni #) et qu'elle est vide
        if (cell !== "$" && cell !== "#" && (!cell || cell.length === 0)) {
          return false;
        }
      }
    }
    return true;
  }, [grid]);

  // Déclenche la vérification finale quand la grille est complète
  useEffect(() => {
    if (!isGridComplete || !gameId || isGameFinished || isGameAbandoned) return;
    if (remainingSec <= 0) return;

    // Petite pause pour l'UX
    const timer = setTimeout(() => {
      validateFinalGrid();
    }, 300);

    return () => clearTimeout(timer);
  }, [isGridComplete, gameId, isGameFinished, isGameAbandoned]);

  // Validation finale
  const validateFinalGrid = async () => {
    if (!gameId || !grid) return;

    setLoading(true);
    setStatusText("Vérification...");

    try {
      const res = await fetch(`${API_URL}/api/crossword/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gameId, grid }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("VALIDATE failed:", res.status, body);
        setStatusText(`Erreur API (${res.status}).`);
        return;
      }

      const data = await res.json();
      if (!data.ok) {
        setStatusText(data.error || "Erreur serveur.");
        return;
      }

      // Calcul du score final
      let correctWords = 0;
      let wrongWords = 0;

      for (const w of allWords) {
        const userLetters = w.cells.map(([r, c]) => grid?.[r]?.[c] || "");
        const solLetters = w.cells.map(([r, c]) => solution?.[r]?.[c] || "");

        const isComplete = userLetters.every((ch) => ch && ch.length === 1);
        if (!isComplete) continue;

        const userWord = userLetters.join("").toUpperCase();
        const solWord = solLetters.join("").toUpperCase();

        if (userWord === solWord) {
          correctWords++;
        } else {
          wrongWords++;
        }
      }

      const bonus = correctWords * WORD_POINTS_GOOD;
      const malus = wrongWords * WORD_POINTS_BAD;
      const finalScore = clamp(
        timeScore + bonus - malus,
        0,
        BASE_SCORE + bonus,
      );

      setFinalResult({
        correct: correctWords,
        wrong: wrongWords,
        totalScore: finalScore,
      });

      setIsGameFinished(true);
      stopTimer();
      try {
        const res = await fetch(`${API_URL}/api/SaveScore`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            game_slug: "mots-fleches",
            score: parseInt(finalScore) || 0,
            time_left: parseInt(remainingSec) || 0,
            difficulty: level,
            result: String(totalScore),
            user_id: user?.id || null,
          }),
        });

        const data = await res.json();
        if (data.ok) {
          if (data.guest) console.log("Guest : score non enregistré");
          else
            console.log(
              "Utilisateur connecté : score enregistré id",
              data.score_id,
            );
        }
      } catch (err) {
        console.error("Erreur envoi score:", err);
      }

      if (data.correct) {
        setStatusText(
          `🎉 Grille complète ! ${correctWords} mots corrects, ${wrongWords} erreurs`,
        );
      } else {
        setStatusText(
          `Grille terminée. ${correctWords} mots corrects, ${wrongWords} erreurs`,
        );
      }
    } catch (e) {
      console.error(e);
      setStatusText("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  // API
  const startNewGame = async () => {
    setLoading(true);
    setStatusText("");
    setIsGameAbandoned(false);
    setIsGameFinished(false);
    setFinalResult(null);

    try {
      const res = await fetch(`${API_URL}/api/crossword/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("NEW GAME failed:", res.status, body);
        setStatusText(`Erreur API (${res.status}).`);
        return;
      }

      const data = await res.json();
      if (!data.ok) {
        setStatusText(data.error || "Erreur serveur.");
        return;
      }

      setGameId(data.id);
      setGrid(data.grid);
      setSolution(data.solution);
      setClueMapByIndex(data.clueMapByIndex || {});
      setWordDelta(0);
      startTimer();

      // focus première lettre
      const first = (() => {
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (data.grid?.[r]?.[c] !== "$" && data.grid?.[r]?.[c] !== "#")
              return { r, c };
          }
        }
        return null;
      })();

      setTypingDir("right");
      setStatusText("Nouvelle partie ✅");

      setTimeout(() => {
        if (first) focusCell(first.r, first.c);
      }, 0);
    } catch (e) {
      console.error(e);
      setStatusText("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  // Abandon
  const abandonGame = () => {
    if (!gameId) return;

    if (!window.confirm("Abandonner la partie ? Votre score sera de 0.")) {
      return;
    }

    setIsGameAbandoned(true);
    setWordDelta(0);
    stopTimer();
    setStatusText("Partie abandonnée");
  };

  //Saisie rapide
  const writeSequence = (startR, startC, text, dir) => {
    if (!grid) return;

    const letters = (text || "").toUpperCase().replace(/[^A-Z]/g, "");
    if (!letters) return;

    setGrid((prev) => {
      const copy = prev.map((r) => [...r]);

      let r = startR;
      let c = startC;
      let lastPos = { r, c };

      for (let i = 0; i < letters.length; i++) {
        if (!isLetterCell(r, c, copy)) break;
        copy[r][c] = letters[i];
        lastPos = { r, c };

        const nxt = findNextCell(r, c, dir, copy);
        if (!nxt) break;
        r = nxt.r;
        c = nxt.c;
      }

      setTimeout(() => {
        const next = findNextCell(lastPos.r, lastPos.c, dir, copy);
        if (next) {
          focusCell(next.r, next.c);
        }
      }, 0);

      return copy;
    });
  };

  // Saisie d'une lettre
  const onInputChange = (row, col, value) => {
    if (!grid) return;
    if (remainingSec <= 0) return;
    if (isGameAbandoned || isGameFinished) return;

    const clean = (value || "").toUpperCase().replace(/[^A-Z]/g, "");

    if (clean.length > 1) {
      writeSequence(row, col, clean, typingDir);
      return;
    }

    const v = clean.slice(0, 1);

    setGrid((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[row][col] = v;
      return copy;
    });

    if (v) {
      const next = findNextCell(row, col, typingDir);
      if (next) {
        setTimeout(() => focusCell(next.r, next.c), 0);
      }
    }
  };


  // Gestion des touches
  const onKeyDown = (row, col, e) => {
    if (!grid) return;
    if (remainingSec <= 0) return;
    if (isGameAbandoned || isGameFinished) return;

    // flèches déplacement
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = findNextCell(row, col, "right");
      if (next) {
        focusCell(next.r, next.c);
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = findPrevCell(row, col, "right");
      if (prev) {
        focusCell(prev.r, prev.c);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = findNextCell(row, col, "down");
      if (next) {
        focusCell(next.r, next.c);
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = findPrevCell(row, col, "down");
      if (prev) {
        focusCell(prev.r, prev.c);
      }
      return;
    }

    // espace toggle direction
    if (e.key === " ") {
      e.preventDefault();
      setTypingDir((d) => (d === "right" ? "down" : "right"));
      return;
    }

    // backspace
    if (e.key === "Backspace") {
      const current = grid?.[row]?.[col] || "";
      if (current) {
        setGrid((prev) => {
          const copy = prev.map((r) => [...r]);
          copy[row][col] = "";
          return copy;
        });
      } else {
        const prevCell = findPrevCell(row, col, typingDir);
        if (prevCell) {
          e.preventDefault();
          focusCell(prevCell.r, prevCell.c);
          setGrid((prev) => {
            const copy = prev.map((r) => [...r]);
            copy[prevCell.r][prevCell.c] = "";
            return copy;
          });
        }
      }
    }
  };

  // Défs list
  const allClues = useMemo(() => {
    const values = Object.values(clueMapByIndex || {});
    return values.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
  }, [clueMapByIndex]);

  const normalizedUnique = useMemo(() => {
    const normalized = allClues.flatMap((c) =>
      (c.directions || []).map((d) => ({
        number: c.number,
        dir: d.dir,
        orientation: getOrientation(d.dir),
        text: d.text,
      })),
    );
    return uniqByKey(
      normalized,
      (x) => `${x.number}|${x.orientation}|${x.text}`,
    );
  }, [allClues]);

  const horizontals = useMemo(
    () => normalizedUnique.filter((x) => x.orientation === "Horizontal"),
    [normalizedUnique],
  );
  const verticals = useMemo(
    () => normalizedUnique.filter((x) => x.orientation === "Vertical"),
    [normalizedUnique],
  );

  return (
    <main className="mot-fleche-page">
      <div className="hero-glow"></div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-container">
            <div className="loading-grid">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="loading-cell"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
            <h2 className="loading-title">Préparation de votre grille...</h2>
            <p className="loading-subtitle">Patientez un instant</p>
          </div>
        </div>
      )}

      <div className="game-header animate-fade-in">
        <h1 className="game-title">
          <span className="text-gradient">Mots</span> Fléchés
        </h1>
        <p className="game-subtitle">Édition : Culture & Nature</p>
      </div>

      <div className="game-layout">
        {/* LEFT */}
        <div className="side-panel panel-left animate-fade-in delay-2">
          <div className="control-card">
            <div className="card-header">
              <h3>Options</h3>
              <div className="decorative-line"></div>
            </div>

            <div className="control-group">
              <label className="info-label">Niveau</label>
              <div className="select-wrapper">
                <select
                  className="game-select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={loading || !!gameId}
                  title={
                    gameId ? "Relance une partie pour changer de niveau" : ""
                  }
                >
                  <option value="simple">Débutant</option>
                  <option value="medium">Intermédiaire</option>
                  <option value="hard">Difficile</option>
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </div>
            <div className="control-group">
              <label className="info-label">Niveau de difficulté</label>
              <div className="select-wrapper">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)} 
                  className="game-select"
                >
                  <option value="easy">🟢 Facile </option>
                  <option value="medium">🟡 Moyen </option>
                  <option value="hard">🔴 Difficile </option>
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </div>

            {/* Direction */}
            <div className="control-group">
              <label className="info-label">Direction de saisie</label>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => setTypingDir("right")}
                  disabled={!gameId}
                  style={{
                    width: "50%",
                    borderColor:
                      typingDir === "right" ? "rgba(59,130,246,.6)" : undefined,
                    color: typingDir === "right" ? "#2563eb" : undefined,
                    background: typingDir === "right" ? "#eff6ff" : undefined,
                  }}
                >
                  Horizontal
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => setTypingDir("down")}
                  disabled={!gameId}
                  style={{
                    width: "50%",
                    borderColor:
                      typingDir === "down" ? "rgba(59,130,246,.6)" : undefined,
                    color: typingDir === "down" ? "#2563eb" : undefined,
                    background: typingDir === "down" ? "#eff6ff" : undefined,
                  }}
                >
                  Vertical
                </button>
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: 700,
                }}
              >
                Astuce : espace = switch horizontal/vertical
              </div>
            </div>

            <button
              className={`btn-primary ${!loading ? "start-btn-pulse" : ""}`}
              onClick={startNewGame}
              disabled={loading}
            >
              {loading ? "Chargement..." : "NOUVELLE PARTIE"}
            </button>

            <button
              className="btn-secondary"
              onClick={abandonGame}
              disabled={loading || !gameId || isGameAbandoned || isGameFinished}
            >
              Abandonner
            </button>

            {statusText ? (
              <div className="status-badge info" style={{ marginTop: 12 }}>
                {statusText}
              </div>
            ) : null}
          </div>

          <div className="rules-box">
            <div className="rules-header">Règles</div>

            <div className="rule-item">
              <div className="rule-icon info">⏱️</div>
              <div className="rule-text">
                <strong>Chrono : 10 minutes</strong>
                <p>Quand le temps tombe à 0, la partie est terminée.</p>
              </div>
            </div>

            <div className="rule-item">
              <div className="rule-icon success">🏁</div>
              <div className="rule-text">
                <strong>Score de base</strong>
                <p>
                  Tu démarres à <b>1000</b> points, et ça descend
                  automatiquement jusqu'à <b>0</b> à la fin du temps.
                </p>
              </div>
            </div>

            <div className="rule-item">
              <div className="rule-icon success">✅</div>
              <div className="rule-text">
                <strong>Vérification finale uniquement</strong>
                <p>
                  Remplis toutes les cases, puis la grille est automatiquement
                  vérifiée. <br />
                  <b>+{WORD_POINTS_GOOD} pts</b> par mot correct,{" "}
                  <b>-{WORD_POINTS_BAD} pts</b> par mot faux.
                </p>
              </div>
            </div>

            <div className="rule-item">
              <div className="rule-icon info">🧠</div>
              <div className="rule-text">
                <strong>Pas de vérification en cours de jeu</strong>
                <p>
                  Aucune indication de bon/mauvais avant la fin. Concentre-toi
                  sur les définitions !
                </p>
              </div>
            </div>

            <div className="rule-item">
              <div className="rule-icon info">⌨️</div>
              <div className="rule-text">
                <strong>Saisie rapide</strong>
                <p>
                  Tu tapes une lettre → ça avance tout seul. <br />
                  Tu peux <b>coller un mot</b> d'un coup. <br />
                  Espace = switch <b>Horizontal</b> / <b>Vertical</b>.
                </p>
              </div>
            </div>

            <div className="rule-item">
              <div className="rule-icon danger">💡</div>
              <div className="rule-text">
                <strong>Bouton "Abandonner"</strong>
                <p>
                  Arrête la partie et ton score passe à <b>0</b>.
                </p>
              </div>
            </div>

            <div className="rule-item">
              <div className="rule-icon info">📌</div>
              <div className="rule-text">
                <strong>Score final</strong>
                <p>
                  Score final = <b>score temps restant</b> + <b>bonus/malus</b>{" "}
                  des mots (calculé à la fin).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="mot-fleche-card animate-fade-in delay-1">
          <div className="board-container">
            {!grid ? (
              <div className="empty-state-container">
                <div className="empty-state-icon">🎮</div>
                <h3 className="empty-state-title">Prêt à jouer?</h3>
                <p className="empty-state-text">
                  Clique sur <strong>"NOUVELLE PARTIE"</strong> pour lancer une
                  grille de Mots Fléchés
                </p>
                <div className="empty-state-hints">
                  <div className="hint-item">
                    <span className="hint-emoji">⚡</span>
                    <span>Choisis ton niveau</span>
                  </div>
                  <div className="hint-item">
                    <span className="hint-emoji">⏱️</span>
                    <span>10 minutes chrono</span>
                  </div>
                  <div className="hint-item">
                    <span className="hint-emoji">🏆</span>
                    <span>Maximise ton score!</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="mf-board"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, var(--cell-size))`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, var(--cell-size))`,
                  }}
                >
                  {flatGrid.map((cell, i) => {
                    if (cell === "$")
                      return <div key={i} className="mf-cell block" />;

                    if (cell === "#") {
                      const clue = clueMapByIndex?.[i];
                      if (!clue)
                        return <div key={i} className="mf-cell clue empty" />;

                      const rawArrows = uniqByKey(
                        (clue?.directions ?? [{ dir: "right" }]).map((d) => ({
                          dir: d.dir,
                        })),
                        (x) => x.dir,
                      );
                      const hArrows = rawArrows.filter(
                        (d) => d.dir === "right" || d.dir === "left",
                      );
                      const vArrows = rawArrows.filter(
                        (d) => d.dir === "down" || d.dir === "up",
                      );

                      const colIndex = i % GRID_SIZE;
                      const rowIndex = Math.floor(i / GRID_SIZE);
                      const isRightSide = colIndex >= Math.floor(GRID_SIZE / 2);
                      const isBottomSide = rowIndex >= 7;

                      return (
                        <div key={i} className="mf-cell clue">
                          <div className="clue-top">
                            <div
                              className={`clue-number-wrap ${isRightSide ? "pop-left" : "pop-right"} ${
                                isBottomSide ? "pop-top" : ""
                              }`}
                              tabIndex={0}
                            >
                              <span className="clue-number">{clue.number}</span>

                              <div className="clue-tooltip" role="tooltip">
                                <div className="tooltip-title">
                                  Indice {clue.number}
                                </div>
                                {clue.directions.map((d, idx) => (
                                  <div className="tooltip-line" key={idx}>
                                    <span className="tooltip-tag">
                                      {getOrientation(d.dir)}
                                    </span>
                                    <span className="tooltip-text">
                                      {d.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="clue-arrows-row">
                              {hArrows.map((d, idx) => (
                                <span
                                  key={idx}
                                  className={`clue-arrow dir-${d.dir}`}
                                >
                                  ➤
                                </span>
                              ))}
                            </div>
                          </div>

                          {vArrows.length > 0 && (
                            <div className="clue-arrows-col">
                              {vArrows.map((d, idx) => (
                                <span
                                  key={idx}
                                  className={`clue-arrow dir-${d.dir}`}
                                >
                                  ➤
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="clue-text">Indice</div>
                        </div>
                      );
                    }

                    const row = Math.floor(i / GRID_SIZE);
                    const col = i % GRID_SIZE;

                    return (
                      <div
                        key={i}
                        className="mf-cell letter"
                        onMouseDown={() => {
                          setTimeout(() => focusCell(row, col), 0);
                        }}
                      >
                        <input
                          ref={(el) => {
                            if (el) inputRefs.current[`${row}-${col}`] = el;
                          }}
                          className="mf-input"
                          value={cell || ""}
                          onChange={(e) =>
                            onInputChange(row, col, e.target.value)
                          }
                          onKeyDown={(e) => onKeyDown(row, col, e)}
                          disabled={
                            remainingSec <= 0 ||
                            isGameAbandoned ||
                            isGameFinished
                          }
                        />
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
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="side-panel panel-right animate-fade-in delay-2">
          <div className="info-card">
            <div className="info-row">
              <span className="info-label">Chrono</span>
              <span className="info-value">{formatTime(remainingSec)}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Score</span>
              <span
                className={`info-value ${totalScore >= 500 ? "score-good" : "score-bad"}`}
              >
                {totalScore}
              </span>
            </div>

            {isGameFinished && finalResult ? (
              <div className="status-badge won">
                ✅ Fini ! {finalResult.correct} bons, {finalResult.wrong} faux
              </div>
            ) : remainingSec === 0 ? (
              <div className="status-badge lost">Temps écoulé ⏱️</div>
            ) : isGameAbandoned ? (
              <div className="status-badge lost">Partie abandonnée </div>
            ) : gameId ? (
              <div className="status-badge info">
                Direction :{" "}
                <strong>
                  {typingDir === "right" ? "Horizontal" : "Vertical"}
                </strong>
              </div>
            ) : (
              <div className="status-badge info">Lance une partie</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
