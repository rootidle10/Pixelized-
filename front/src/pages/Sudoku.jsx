import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Leaderboard from "../components/Leaderboard";
import "./Sudoku.css";

export default function Sudoku() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token, authFetch } = useAuth(); // ✅ IMPORTANT

  const [grid, setGrid] = useState([]);
  const [initialGrid, setInitialGrid] = useState([]);
  const [solvedCells, setSolvedCells] = useState([]);

  const [level, setLevel] = useState("easy");
  const [gameId, setGameId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [penaltyPoints, setPenaltyPoints] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);

  const [gameState, setGameState] = useState("idle"); // idle | playing | won | lost_time | lost_score | solved_bot

  const timerRef = useRef(null);
  const scoreSentRef = useRef(false); // ✅ évite double envoi

  const maxTime = 600;
  const maxScore = 1000;

  const timeScore = Math.floor((timeLeft / maxTime) * maxScore);
  const currentScore = Math.max(0, timeScore - penaltyPoints + bonusPoints);

  const stopTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // ----- RULES / VALIDATION -----
  const isValidMove = (board, row, col, value) => {
    for (let x = 0; x < 9; x++) if (x !== col && board[row][x] === value) return false;
    for (let x = 0; x < 9; x++) if (x !== row && board[x][col] === value) return false;

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const rr = startRow + i;
        const cc = startCol + j;
        if ((rr !== row || cc !== col) && board[rr][cc] === value) return false;
      }
    }
    return true;
  };

  const isBoardValid = (board) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = board[r][c];
        if (val === 0 || val === null || val === "") return false;
        if (!isValidMove(board, r, c, val)) return false;
      }
    }
    return true;
  };

  // ----- START NEW GAME -----
  const startNewGame = (selectedLevel = level) => {
    setLoading(true);
    scoreSentRef.current = false; // ✅ reset envoi score à chaque partie
    setGameState("playing");
    setTimeLeft(600);
    setPenaltyPoints(0);
    setBonusPoints(0);
    setGrid([]);
    setGameId(null);

    const emptyBoolGrid = Array(9)
      .fill(null)
      .map(() => Array(9).fill(false));
    setSolvedCells(emptyBoolGrid);

    fetch(`${API_URL}/api/sudoku/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: selectedLevel }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.puzzle) {
          setGameId(data.id);
          setGrid(JSON.parse(JSON.stringify(data.puzzle)));
          setInitialGrid(JSON.parse(JSON.stringify(data.puzzle)));
        } else {
          setGameState("idle");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement:", err);
        setGameState("idle");
        setLoading(false);
      });
  };

  // ----- CLEANUP TIMER ON UNMOUNT -----
  useEffect(() => {
    return () => stopTimers();
  }, []);

  // ----- TIMER -----
  useEffect(() => {
    if (gameState !== "playing") {
      stopTimers();
      return;
    }

    stopTimers();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => stopTimers();
  }, [gameState]);

  // ----- LOSE CONDITIONS -----
  useEffect(() => {
    if (gameState !== "playing") return;

    if (currentScore <= 0 && timeLeft > 0) {
      stopTimers();
      setGameState("lost_score");
      return;
    }

    if (timeLeft === 0) {
      stopTimers();
      setGameState("lost_time");
      return;
    }
  }, [timeLeft, penaltyPoints, bonusPoints, currentScore, gameState]);

  // ----- INPUT -----
  const handleChange = (row, col, value) => {
    if (gameState !== "playing") return;

    // effacer
    if (value === "") {
      const newGrid = grid.map((r) => [...r]);
      newGrid[row][col] = 0;
      setGrid(newGrid);
      return;
    }

    const val = parseInt(value, 10);
    if (isNaN(val) || val < 1 || val > 9) return;

    const isInitial = initialGrid?.[row]?.[col] !== 0;
    if (isInitial) return; // sécurité

    const isMistake = !isValidMove(grid, row, col, val);

    if (isMistake) {
      const penaltyAmount = level === "hard" ? 200 : level === "medium" ? 100 : 50;
      setPenaltyPoints((prev) => prev + penaltyAmount);
    } else {
      if (!solvedCells?.[row]?.[col]) {
        setBonusPoints((prev) => prev + 50);
        const newSolvedCells = solvedCells.map((arr) => [...arr]);
        newSolvedCells[row][col] = true;
        setSolvedCells(newSolvedCells);
      }
    }

    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = val;
    setGrid(newGrid);

    // check win
    let filledCount = 0;
    newGrid.forEach((rr) => rr.forEach((c) => c !== 0 && filledCount++));
    if (filledCount === 81 && isBoardValid(newGrid)) {
      stopTimers();
      setGameState("won");
    }
  };

  // ----- SOLVE -----
  const handleSolve = () => {
    if (!gameId) return;

    fetch(`${API_URL}/api/sudoku/solve/${gameId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.solution) {
          setGrid(data.solution);
          setPenaltyPoints(10000);
          stopTimers();
          setGameState("solved_bot");
        }
      })
      .catch((err) => console.error(err));
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // ✅ SEND SCORE (token + /api/scores)
  const sendScoreToApi = async (finalState) => {
    if (scoreSentRef.current) return;
    scoreSentRef.current = true;

    // If not logged-in, don't save (profile is user-based anyway)
    if (!token) {
      console.log("Not logged in -> score not saved");
      return;
    }

    try {
      const res = await authFetch(`${API_URL}/api/scores`, {
        method: "POST",
        body: JSON.stringify({
          game_slug: "sudoku-classique",
          score: currentScore,
          time_left: timeLeft,
          difficulty: level,
          result: finalState,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Save score failed:", res.status, data);
        return;
      }

      console.log("Score saved:", data);
    } catch (err) {
      console.error("Erreur envoi score:", err);
    }
  };

  useEffect(() => {
    if (["won", "lost_time", "lost_score", "solved_bot"].includes(gameState)) {
      sendScoreToApi(gameState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  return (
    <main className="sudoku-page">
      <div className="hero-glow"></div>

      <div className="game-header animate-fade-in">
        <h1 className="game-title">
          <span className="text-gradient">Sudoku</span> Classique
        </h1>
        <p className="game-subtitle">Logique pure. Concentre-toi et remplis la grille.</p>
      </div>

      <div className="game-layout">
        {/* COLONNE GAUCHE */}
        <div className="side-panel panel-left animate-fade-in delay-2">
          <div className="control-card">
            <div className="card-header">
              <h3>Paramètres</h3>
              <div className="decorative-line"></div>
            </div>

            <div className="control-group">
              <label className="info-label">Niveau de difficulté</label>
              <div className="select-wrapper">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="game-select"
                  disabled={gameState === "playing" || loading}
                >
                  <option value="easy">🟢 Facile (-50pts)</option>
                  <option value="medium">🟡 Moyen (-100pts)</option>
                  <option value="hard">🔴 Difficile (-200pts)</option>
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </div>

            {gameState === "idle" ? (
              <button className="btn-primary start-btn-pulse" onClick={() => startNewGame(level)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                COMMENCER
              </button>
            ) : (
              <button className="btn-primary" onClick={() => startNewGame(level)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20" />
                </svg>
                Nouvelle Partie
              </button>
            )}

            <button className="btn-secondary" onClick={handleSolve} disabled={gameState !== "playing"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
              </svg>
              Abandonner
            </button>
          </div>

          <div className="rules-box">
            <div className="rules-header">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span>Guide du Score</span>
            </div>

            <div className="rule-item">
              <div className="rule-icon success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="rule-text">
                <strong>Bonus de Précision</strong>
                <p>+50 points pour chaque case vide correctement remplie.</p>
              </div>
            </div>

            <div className="rule-item">
              <div className="rule-icon danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div className="rule-text">
                <strong>Pénalité d'Erreur</strong>
                <p>Une erreur coûte cher (-50 à -200 pts) selon la difficulté.</p>
              </div>
            </div>

            <div className="rule-item">
              <div className="rule-icon info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="rule-text">
                <strong>Le Temps Presse</strong>
                <p>Le score maximal diminue chaque seconde. Sois rapide !</p>
              </div>
            </div>

            <div className="rule-footer">
              ⚠️ 0 point ou 0 seconde = <strong>Game Over</strong>
            </div>
          </div>
        </div>

        {/* COLONNE CENTRALE */}
        <div className="sudoku-card animate-fade-in delay-1">
          <div className="board-container" style={{ position: "relative" }}>
            <div className={`sudoku-board ${(gameState === "idle" || loading) ? "blurred" : ""}`}>
              {grid.length > 0 ? (
                grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isInitial = initialGrid?.[rowIndex]?.[colIndex] !== 0;
                    const isError = !isInitial && cell !== 0 && !isValidMove(grid, rowIndex, colIndex, cell);

                    let borderBottomStyle = "1px solid #e2e8f0";
                    if ((rowIndex + 1) % 3 === 0 && rowIndex !== 8) borderBottomStyle = "2px solid #94a3b8";
                    else if (rowIndex === 8) borderBottomStyle = "none";

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`cell ${isInitial ? "initial" : ""} ${isError ? "error" : ""}`}
                        style={{ borderBottom: borderBottomStyle }}
                      >
                        {isInitial ? (
                          cell
                        ) : (
                          <input
                            type="text"
                            maxLength="1"
                            value={cell === 0 ? "" : cell}
                            onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                            disabled={gameState !== "playing"}
                            autoComplete="off"
                          />
                        )}
                      </div>
                    );
                  })
                )
              ) : (
                Array(9)
                  .fill(0)
                  .map((_, r) =>
                    Array(9)
                      .fill(0)
                      .map((_, c) => (
                        <div
                          key={`empty-${r}-${c}`}
                          className="cell"
                          style={{
                            borderBottom:
                              (r + 1) % 3 === 0 && r !== 8 ? "2px solid #94a3b8" : "1px solid #e2e8f0",
                          }}
                        ></div>
                      ))
                  )
              )}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div className="side-panel panel-right animate-fade-in delay-2">
          <div className="info-card">
            <div className="info-row">
              <span className="info-label">Temps Restant</span>
              <span className="info-value">{formatTime(timeLeft)}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Score Actuel</span>
              <span className={`info-value ${currentScore > 200 ? "score-good" : "score-bad"}`}>
                {currentScore}
              </span>
            </div>

            {gameState === "idle" && <div className="status-badge info">En attente...</div>}
            {gameState === "lost_time" && <div className="status-badge lost">Temps écoulé !</div>}
            {gameState === "lost_score" && <div className="status-badge lost">Score épuisé !</div>}
            {gameState === "won" && <div className="status-badge won">VICTOIRE !</div>}
            {gameState === "solved_bot" && <div className="status-badge info">Solution dévoilée</div>}
          </div>
                {/* Leaderboard (Top 5 + toi) */}
<Leaderboard gameSlug="sudoku-classique" difficulty={level} refreshKey={gameState} />
        </div>
      </div>
    </main>
  );
}
