import { useEffect, useState, useRef } from "react";
import "./Sudoku.css";

export default function Sudoku() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [grid, setGrid] = useState([]); 
  const [initialGrid, setInitialGrid] = useState([]); 
  
  // NOUVEAU : Grille "mémoire" pour savoir si une case a déjà donné des points
  const [solvedCells, setSolvedCells] = useState([]);

  const [level, setLevel] = useState("easy");
  const [gameId, setGameId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600); 
  const [penaltyPoints, setPenaltyPoints] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0); 
  const [gameState, setGameState] = useState("playing"); 

  const timerRef = useRef(null);

  const maxTime = 600;
  const maxScore = 1000;
  
  const timeScore = Math.floor((timeLeft / maxTime) * maxScore);
  const currentScore = Math.max(0, timeScore - penaltyPoints + bonusPoints);

  useEffect(() => {
      if (gameState === 'playing') {
          if (currentScore <= 0 && timeLeft > 0) {
               stopTimers();
               setGameState("lost_score");
          } else if (timeLeft === 0) {
              stopTimers();
              setGameState("lost_time");
          }
      }
  }, [timeLeft, penaltyPoints, gameState, currentScore]);

  const isValidMove = (board, row, col, value) => {
    for (let x = 0; x < 9; x++) if (x !== col && board[row][x] === value) return false;
    for (let x = 0; x < 9; x++) if (x !== row && board[x][col] === value) return false;
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const currentRow = startRow + i;
            const currentCol = startCol + j;
            if ((currentRow !== row || currentCol !== col) && board[currentRow][currentCol] === value) return false;
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

  const startNewGame = (selectedLevel = level) => {
    setLoading(true);
    setGameState("playing");
    setTimeLeft(600);
    setPenaltyPoints(0);
    setBonusPoints(0);
    setGrid([]); 
    
    // Initialiser la grille des cases résolues avec des "false"
    // On crée une grille 9x9 vide
    const emptyBoolGrid = Array(9).fill().map(() => Array(9).fill(false));
    setSolvedCells(emptyBoolGrid);

    fetch(`${API_URL}/api/sudoku/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: selectedLevel }) 
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.puzzle) {
            setGameId(data.id);
            setGrid(JSON.parse(JSON.stringify(data.puzzle)));
            setInitialGrid(JSON.parse(JSON.stringify(data.puzzle)));
        }
        setLoading(false);
      })
      .catch(err => {
          console.error("Erreur chargement:", err);
          setLoading(false);
      });
  };

  const stopTimers = () => clearInterval(timerRef.current);

  useEffect(() => { startNewGame(); return () => stopTimers(); }, []);

  useEffect(() => {
    if (gameState !== "playing") { stopTimers(); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const handleChange = (row, col, value) => {
    if (gameState !== "playing") return;

    if (value === "") {
        const newGrid = [...grid]; newGrid[row][col] = 0; setGrid(newGrid); return;
    }

    const val = parseInt(value);
    if (isNaN(val) || val < 1 || val > 9) return;

    const isMistake = !isValidMove(grid, row, col, val);
    
    if (isMistake) {
        let penaltyAmount = level === 'hard' ? 200 : (level === 'medium' ? 100 : 50);
        setPenaltyPoints(prev => prev + penaltyAmount);
    } else {
        // === CORRECTION ICI ===
        // On vérifie si la case a DÉJÀ été résolue auparavant
        if (!solvedCells[row][col]) {
            setBonusPoints(prev => prev + 50);
            
            // On marque cette case comme "payée" dans notre mémoire
            const newSolvedCells = solvedCells.map(arr => [...arr]); // Copie propre du tableau
            newSolvedCells[row][col] = true;
            setSolvedCells(newSolvedCells);
        }
    }

    const newGrid = [...grid]; newGrid[row][col] = val; setGrid(newGrid);

    let filledCount = 0;
    newGrid.forEach(row => row.forEach(c => { if(c !== 0) filledCount++ }));
    
    if (filledCount === 81 && isBoardValid(newGrid)) setGameState("won");
  };

  const handleSolve = () => {
    if (!gameId) return;
    fetch(`${API_URL}/api/sudoku/solve/${gameId}`)
      .then(res => res.json())
      .then(data => {
        if(data.ok && data.solution) {
            setGrid(data.solution); 
            setPenaltyPoints(10000); 
            setGameState("solved_bot");
        }
      })
      .catch(err => console.error(err));
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (loading) return <div className="sudoku-page">Chargement du jeu...</div>;

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
        
        {/* === COLONNE GAUCHE === */}
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
                            onChange={(e) => { setLevel(e.target.value); startNewGame(e.target.value); }}
                            className="game-select" 
                            disabled={gameState === "loading"}
                        >
                            <option value="easy">🟢 Facile (-50pts)</option>
                            <option value="medium">🟡 Moyen (-100pts)</option>
                            <option value="hard">🔴 Difficile (-200pts)</option>
                        </select>
                        <div className="select-arrow">▼</div>
                    </div>
                </div>

                <button className="btn-primary" onClick={() => startNewGame(level)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
                    Nouvelle Partie
                </button>
                
                <button className="btn-secondary" onClick={handleSolve} disabled={gameState !== 'playing'}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
                    Abandonner
                </button>
            </div>

            <div className="rules-box">
                <div className="rules-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span>Règles du jeu</span>
                </div>
                <ul>
                    <li>🔢 Remplis les cases de <strong>1 à 9</strong>.</li>
                    <li>🚫 <strong>Pas de doublons</strong> (ligne, colonne, carré).</li>
                    <li>⏳ <strong>Vitesse = Points</strong> (le temps file !).</li>
                    <li>✅ <strong>+50 pts</strong> par bon chiffre placé.</li>
                </ul>
            </div>
        </div>

        {/* === COLONNE CENTRALE === */}
        <div className="sudoku-card animate-fade-in delay-1">
            <div className="sudoku-board">
                {grid && grid.map((row, rowIndex) => (
                    row.map((cell, colIndex) => {
                        const isInitial = initialGrid[rowIndex][colIndex] !== 0;
                        let isError = !isInitial && cell !== 0 && !isValidMove(grid, rowIndex, colIndex, cell);
                        
                        let borderBottomStyle = '1px solid #e2e8f0'; 
                        if ((rowIndex + 1) % 3 === 0 && rowIndex !== 8) {
                            borderBottomStyle = '2px solid #94a3b8'; 
                        } else if (rowIndex === 8) {
                            borderBottomStyle = 'none';
                        }

                        return (
                            <div key={`${rowIndex}-${colIndex}`} 
                                 className={`cell ${isInitial ? "initial" : ""} ${isError ? "error" : ""}`}
                                 style={{ borderBottom: borderBottomStyle }}>
                                {isInitial ? cell : (
                                    <input type="text" maxLength="1" value={cell === 0 ? "" : cell}
                                        onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                                        disabled={gameState !== "playing"} autoComplete="off" />
                                )}
                            </div>
                        );
                    })
                ))}
            </div>
        </div>

        {/* === COLONNE DROITE === */}
        <div className="side-panel panel-right animate-fade-in delay-2">
            <div className="info-card">
                <div className="info-row">
                    <span className="info-label">Temps Restant</span>
                    <span className="info-value">{formatTime(timeLeft)}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Score Actuel</span>
                    <span className={`info-value ${currentScore > 200 ? 'score-good' : 'score-bad'}`}>
                        {currentScore}
                    </span>
                </div>
                
                {gameState === "lost_time" && <div className="status-badge lost">Temps écoulé !</div>}
                {gameState === "lost_score" && <div className="status-badge lost">Score épuisé !</div>}
                {gameState === "won" && <div className="status-badge won">VICTOIRE !</div>}
                {gameState === "solved_bot" && <div className="status-badge info">Solution dévoilée</div>}
            </div>
        </div>

      </div>
    </main>
  );
}