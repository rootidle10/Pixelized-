import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Mots-fleches.css";

const GRID_SIZE = 10;
const TOTAL_SECONDS = 10 * 60; // 10 minutes
const BASE_SCORE = 1000;

const WORD_POINTS_GOOD = 80;
const WORD_POINTS_BAD = 40;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function MotFleches() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [level, setLevel] = useState("simple");
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
  const [isSolutionShown, setIsSolutionShown] = useState(false);

  // status par mot
  const [wordStatus, setWordStatus] = useState({});

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  // saisie
  const [activeCell, setActiveCell] = useState(null);
  const [typingDir, setTypingDir] = useState("right"); // "right" | "down"
  const inputRefs = useRef({}); // "r-c" -> element

  // ---------- Helpers ----------
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

  const flatGrid = useMemo(() => (grid ? grid.flat() : []), [grid]);

  const timeScore = useMemo(() => {
    const ratio = remainingSec / TOTAL_SECONDS;
    return Math.round(BASE_SCORE * ratio);
  }, [remainingSec]);

  const totalScore = useMemo(() => {
    if (isSolutionShown) return 0;
    return clamp(timeScore + wordDelta, 0, BASE_SCORE);
  }, [timeScore, wordDelta, isSolutionShown]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

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

  const isLetterCell = (r, c, g = grid) => {
    const cell = g?.[r]?.[c];
    return cell !== undefined && cell !== "$" && cell !== "#";
  };

  const focusCell = (r, c) => {
    const el = inputRefs.current[`${r}-${c}`];
    if (el) el.focus();
  };

  const stepFrom = (r, c, dir) => {
    if (dir === "right") return [r, c + 1];
    if (dir === "left") return [r, c - 1];
    if (dir === "down") return [r + 1, c];
    if (dir === "up") return [r - 1, c];
    return [r, c];
  };

  const findNextCell = (r, c, dir, g = grid) => {
    let [nr, nc] = stepFrom(r, c, dir);
    while (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
      if (isLetterCell(nr, nc, g)) return { r: nr, c: nc };
      [nr, nc] = stepFrom(nr, nc, dir);
    }
    return null;
  };

  const findPrevCell = (r, c, dir, g = grid) => {
    const opposite =
      dir === "right" ? "left" : dir === "left" ? "right" : dir === "down" ? "up" : "down";
    return findNextCell(r, c, opposite, g);
  };

  // ---------- Mots (depuis clueMapByIndex) ----------
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

  // ---------- Couleurs par mot ----------
  const correctCellSet = useMemo(() => {
    const set = new Set();
    for (const w of allWords) {
      if (wordStatus[w.key] !== "correct") continue;
      w.cells.forEach(([r, c]) => set.add(`${r}-${c}`));
    }
    return set;
  }, [wordStatus, allWords]);

  const wrongCellSet = useMemo(() => {
    const set = new Set();
    for (const w of allWords) {
      if (wordStatus[w.key] !== "wrong") continue;
      w.cells.forEach(([r, c]) => set.add(`${r}-${c}`));
    }
    return set;
  }, [wordStatus, allWords]);

  // ---------- Détection + scoring par mot ----------
  useEffect(() => {
    if (!grid || !solution) return;
    if (isSolutionShown) return;

    const nextStatus = {};

    for (const w of allWords) {
      const userLetters = w.cells.map(([r, c]) => (grid?.[r]?.[c] || ""));
      const solLetters = w.cells.map(([r, c]) => (solution?.[r]?.[c] || ""));

      const isComplete = userLetters.every((ch) => ch && ch.length === 1);
      if (!isComplete) {
        nextStatus[w.key] = "incomplete";
        continue;
      }

      const userWord = userLetters.join("").toUpperCase();
      const solWord = solLetters.join("").toUpperCase();
      nextStatus[w.key] = userWord === solWord ? "correct" : "wrong";
    }

    setWordStatus((prev) => {
      const prevStatus = prev || {};
      let delta = 0;

      for (const [key, after] of Object.entries(nextStatus)) {
        const before = prevStatus[key] || "incomplete";
        if (before === after) continue;

        if (after === "correct") delta += WORD_POINTS_GOOD;
        if (after === "wrong") delta -= WORD_POINTS_BAD;
      }

      if (delta !== 0) setWordDelta((d) => d + delta);
      return nextStatus;
    });
  }, [grid, solution, allWords, isSolutionShown]);

  // ---------- API ----------
  const startNewGame = async () => {
    setLoading(true);
    setStatusText("");
    setIsSolutionShown(false);

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
      setWordStatus({});
      startTimer();

      // focus première lettre
      const first = (() => {
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (data.grid?.[r]?.[c] !== "$" && data.grid?.[r]?.[c] !== "#") return { r, c };
          }
        }
        return null;
      })();

      setActiveCell(first);
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

  const showSolution = async () => {
    if (!gameId) return;

    setLoading(true);
    setStatusText("");

    try {
      const res = await fetch(`${API_URL}/api/crossword/solve/${gameId}`);
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("SOLVE failed:", res.status, body);
        setStatusText(`Erreur API (${res.status}).`);
        return;
      }

      const data = await res.json();
      if (!data.ok) {
        setStatusText(data.error || "Erreur serveur.");
        return;
      }

      setGrid(data.solution);
      setIsSolutionShown(true);
      setWordDelta(0);
      setWordStatus({});
      stopTimer();
      setStatusText("Solution affichée → score = 0 ✅");
    } catch (e) {
      console.error(e);
      setStatusText("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Saisie rapide ----------
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
          setActiveCell(next);
          focusCell(next.r, next.c);
        }
      }, 0);

      return copy;
    });
  };

  const onInputChange = (row, col, value) => {
    if (!grid) return;
    if (remainingSec <= 0) return;
    if (isSolutionShown) return;

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
        setActiveCell(next);
        setTimeout(() => focusCell(next.r, next.c), 0);
      }
    }
  };

  const onKeyDown = (row, col, e) => {
    if (!grid) return;
    if (remainingSec <= 0) return;
    if (isSolutionShown) return;

    // flèches : déplacement
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = findNextCell(row, col, "right");
      if (next) {
        setActiveCell(next);
        focusCell(next.r, next.c);
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = findPrevCell(row, col, "right");
      if (prev) {
        setActiveCell(prev);
        focusCell(prev.r, prev.c);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = findNextCell(row, col, "down");
      if (next) {
        setActiveCell(next);
        focusCell(next.r, next.c);
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = findPrevCell(row, col, "down");
      if (prev) {
        setActiveCell(prev);
        focusCell(prev.r, prev.c);
      }
      return;
    }

    // espace : toggle direction
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
          setActiveCell(prevCell);
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

  // ---------- Défs list ----------
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
      }))
    );
    return uniqByKey(normalized, (x) => `${x.number}|${x.orientation}|${x.text}`);
  }, [allClues]);

  const horizontals = useMemo(
    () => normalizedUnique.filter((x) => x.orientation === "Horizontal"),
    [normalizedUnique]
  );
  const verticals = useMemo(
    () => normalizedUnique.filter((x) => x.orientation === "Vertical"),
    [normalizedUnique]
  );

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
                  title={gameId ? "Relance une partie pour changer de niveau" : ""}
                >
                  <option value="simple">Débutant</option>
                  <option value="medium">Intermédiaire</option>
                  <option value="hard">Difficile</option>
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
                    borderColor: typingDir === "right" ? "rgba(59,130,246,.6)" : undefined,
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
                    borderColor: typingDir === "down" ? "rgba(59,130,246,.6)" : undefined,
                    color: typingDir === "down" ? "#2563eb" : undefined,
                    background: typingDir === "down" ? "#eff6ff" : undefined,
                  }}
                >
                  Vertical
                </button>
              </div>

              <div style={{ marginTop: 8, fontSize: 12, color: "#64748b", fontWeight: 700 }}>
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

            <button className="btn-secondary" onClick={showSolution} disabled={loading || !gameId}>
              Solution (score 0)
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
              <p>Tu démarres à <b>1000</b> points, et ça descend automatiquement jusqu’à <b>0</b> à la fin du temps.</p>
            </div>
          </div>

          <div className="rule-item">
            <div className="rule-icon success">✅</div>
            <div className="rule-text">
              <strong>Gagner des points (par mot)</strong>
              <p>
                Quand un <b>mot complet</b> est correct (horizontal ou vertical) : <br />
                <b>+{WORD_POINTS_GOOD} pts</b> et le mot devient <b>bleu</b>.
              </p>
            </div>
          </div>

          <div className="rule-item">
            <div className="rule-icon danger">❌</div>
            <div className="rule-text">
              <strong>Perdre des points (par mot)</strong>
              <p>
                Quand un <b>mot complet</b> est faux (horizontal ou vertical) : <br />
                <b>-{WORD_POINTS_BAD} pts</b> et le mot devient <b>rouge</b>.
              </p>
            </div>
          </div>

          <div className="rule-item">
            <div className="rule-icon info">🧠</div>
            <div className="rule-text">
              <strong>Important : c’est “par mot”, pas par lettre</strong>
              <p>
                Tant qu’un mot n’est pas entièrement rempli, il n’est ni validé ni pénalisé.
              </p>
            </div>
          </div>

          <div className="rule-item">
            <div className="rule-icon info">⌨️</div>
            <div className="rule-text">
              <strong>Saisie rapide</strong>
              <p>
                Tu tapes une lettre → ça avance tout seul. <br />
                Tu peux <b>coller un mot</b> d’un coup. <br />
                Espace = switch <b>Horizontal</b> / <b>Vertical</b>.
              </p>
            </div>
          </div>

          <div className="rule-item">
            <div className="rule-icon danger">💡</div>
            <div className="rule-text">
              <strong>Bouton “Solution”</strong>
              <p>
                Affiche la grille complète, bloque la saisie, et ton score passe à <b>0</b>.
              </p>
            </div>
          </div>

          <div className="rule-item">
            <div className="rule-icon info">📌</div>
            <div className="rule-text">
              <strong>Score final</strong>
              <p>
                Score final = <b>score temps restant</b> + <b>bonus/malus</b> des mots (minimum 0).
              </p>
            </div>
          </div>
        </div>
      </div>


        {/* CENTER */}
        <div className="mot-fleche-card animate-fade-in delay-1">
          <div className="board-container">
            <div
              className="mf-board"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, var(--cell-size))`,
                gridTemplateRows: `repeat(${GRID_SIZE}, var(--cell-size))`,
              }}
            >
              {!grid ? (
                <div style={{ padding: 20, color: "#64748b", fontWeight: 700 }}>
                  Clique sur “NOUVELLE PARTIE” pour charger la grille.
                </div>
              ) : (
                flatGrid.map((cell, i) => {
                  if (cell === "$") return <div key={i} className="mf-cell block" />;

                  if (cell === "#") {
                    const clue = clueMapByIndex?.[i];
                    if (!clue) return <div key={i} className="mf-cell clue empty" />;

                    // ✅ flèches à afficher
                    const rawArrows = uniqByKey(
                      (clue?.directions ?? [{ dir: "right" }]).map((d) => ({ dir: d.dir })),
                      (x) => x.dir
                    );
                    const hArrows = rawArrows.filter((d) => d.dir === "right" || d.dir === "left");
                    const vArrows = rawArrows.filter((d) => d.dir === "down" || d.dir === "up");

                    // placement tooltip (responsive)
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
                              <div className="tooltip-title">Indice {clue.number}</div>
                              {clue.directions.map((d, idx) => (
                                <div className="tooltip-line" key={idx}>
                                  <span className="tooltip-tag">{getOrientation(d.dir)}</span>
                                  <span className="tooltip-text">{d.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ✅ flèches horizontales à côté du numéro */}
                          <div className="clue-arrows-row">
                            {hArrows.map((d, idx) => (
                              <span key={idx} className={`clue-arrow dir-${d.dir}`}>
                                ➤
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* ✅ flèches verticales sous la ligne du haut */}
                        {vArrows.length > 0 && (
                          <div className="clue-arrows-col">
                            {vArrows.map((d, idx) => (
                              <span key={idx} className={`clue-arrow dir-${d.dir}`}>
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

                  const keyCell = `${row}-${col}`;
                  const isCorrect = correctCellSet.has(keyCell);
                  const isWrong = wrongCellSet.has(keyCell);

                  return (
                    <div
                      key={i}
                      className={`mf-cell letter ${isCorrect ? "word-correct" : ""} ${
                        !isCorrect && isWrong ? "word-wrong" : ""
                      }`}
                      onMouseDown={() => {
                        setActiveCell({ r: row, c: col });
                        setTimeout(() => focusCell(row, col), 0);
                      }}
                    >
                      <input
                        ref={(el) => {
                          if (el) inputRefs.current[`${row}-${col}`] = el;
                        }}
                        className="mf-input"
                        value={cell || ""}
                        onFocus={() => setActiveCell({ r: row, c: col })}
                        onChange={(e) => onInputChange(row, col, e.target.value)}
                        onKeyDown={(e) => onKeyDown(row, col, e)}
                        disabled={remainingSec <= 0 || isSolutionShown}
                      />
                    </div>
                  );
                })
              )}
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

        {/* RIGHT */}
        <div className="side-panel panel-right animate-fade-in delay-2">
          <div className="info-card">
            <div className="info-row">
              <span className="info-label">Chrono</span>
              <span className="info-value">{formatTime(remainingSec)}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Score</span>
              <span className={`info-value ${totalScore >= 500 ? "score-good" : "score-bad"}`}>
                {totalScore}
              </span>
            </div>

            {remainingSec === 0 ? (
              <div className="status-badge lost">Temps écoulé ⏱️</div>
            ) : isSolutionShown ? (
              <div className="status-badge lost">Solution affichée → 0</div>
            ) : gameId ? (
              <div className="status-badge info">
                Direction : <strong>{typingDir === "right" ? "Horizontal" : "Vertical"}</strong>
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
