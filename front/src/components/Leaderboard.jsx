import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Leaderboard.css";

const medalEmoji = (rank) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "#";
};

export default function Leaderboard({ gameSlug, difficulty, compact = true, refreshKey = null }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token, user } = useAuth();

  const [top, setTop] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMeInTop = useMemo(() => {
    if (!me) return false;
    return top.some((r) => r.user_id === me.user_id);
  }, [top, me]);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      if (!gameSlug || !difficulty) return;
      setLoading(true);

      try {
        const resTop = await fetch(
          `${API_URL}/api/scores/leaderboard?game_slug=${encodeURIComponent(gameSlug)}&difficulty=${encodeURIComponent(
            difficulty
          )}&limit=5`
        );
        const jsonTop = await resTop.json();

        if (!cancelled) setTop(Array.isArray(jsonTop?.top) ? jsonTop.top : []);

        // My rank (only if logged)
        if (token) {
          const resMe = await fetch(
            `${API_URL}/api/scores/leaderboard/me?game_slug=${encodeURIComponent(gameSlug)}&difficulty=${encodeURIComponent(
              difficulty
            )}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );
          const jsonMe = await resMe.json();
          if (!cancelled) setMe(jsonMe?.me ?? null);
        } else {
          if (!cancelled) setMe(null);
        }
      } catch (e) {
        if (!cancelled) {
          setTop([]);
          setMe(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // slight delay allows backend to write score before we fetch
    const t = setTimeout(fetchAll, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [API_URL, gameSlug, difficulty, token, refreshKey]);

  const title = useMemo(() => {
    const diff = String(difficulty || "").toLowerCase();
    if (diff.includes("easy") || diff.includes("facile")) return "Classement — Facile";
    if (diff.includes("medium") || diff.includes("moyen")) return "Classement — Moyen";
    if (diff.includes("hard") || diff.includes("difficile")) return "Classement — Difficile";
    if (diff.includes("expert")) return "Classement — Expert";
    return "Classement";
  }, [difficulty]);

  return (
    <div className={`lb ${compact ? "lb-compact" : ""}`}>
      <div className="lb-header">
        <div className="lb-title">
          <span className="lb-title-badge">🏆</span>
          <span>{title}</span>
        </div>
        <div className="lb-sub">
          {loading ? "Chargement..." : top.length ? "Top 5" : "Aucun score"}
        </div>
      </div>

      <div className="lb-card">
        {/* Top list */}
        {top.map((row) => {
          const highlight = me && row.user_id === me.user_id;
          const rankClass = row.rank === 1 ? "lb-rank-1" : row.rank === 2 ? "lb-rank-2" : row.rank === 3 ? "lb-rank-3" : "";

          return (
            <div key={`${row.user_id}-${row.rank}`} className={`lb-row ${highlight ? "lb-row-me" : ""}`}>
              <div className={`lb-rank ${rankClass}`}>
                <span className="lb-rank-emoji">{medalEmoji(row.rank)}</span>
                <span className="lb-rank-num">{row.rank}</span>
              </div>

              <div className="lb-player">
                <div className="lb-avatar" aria-hidden />
                <div className="lb-name">
                  {row.user_name || "Player"}
                  {highlight ? <span className="lb-you-tag">TOI</span> : null}
                </div>
              </div>

              <div className="lb-score">{Number(row.score || 0).toLocaleString("fr-FR")}</div>
            </div>
          );
        })}

        {/* If not in top, show my rank below */}
        {token && me && !isMeInTop ? (
          <div className="lb-me-wrap">
            <div className="lb-divider" />
            <div className="lb-me-label">Ton classement</div>

            <div className="lb-row lb-row-me lb-row-me-outside">
              <div className="lb-rank lb-rank-me">
                <span className="lb-rank-emoji">⭐</span>
                <span className="lb-rank-num">{me.rank}</span>
              </div>

              {/* <div className="lb-player">
                <div className="lb-avatar lb-avatar-me" aria-hidden />
                <div className="lb-name">
                  {me.user_name || user?.name || "Toi"}
                  <span className="lb-you-tag">TOI</span>
                </div>
              </div> */}

              <div className="lb-score">{Number(me.score || 0).toLocaleString("fr-FR")}</div>
            </div>
          </div>
        ) : null}

        {/* Not logged */}
        {!token ? (
          <div className="lb-hint">
            Connecte-toi pour voir ton classement.
          </div>
        ) : null}
      </div>
    </div>
  );
}
