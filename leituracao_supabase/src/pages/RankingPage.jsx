import { useEffect, useMemo, useState } from "react";
import { refreshCurrentUser } from "../services/AuthService";
import { getLeaderboard } from "../services/ReadingService";

export default function RankingPage() {
  const [scope, setScope] = useState("weekly");
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([refreshCurrentUser(), getLeaderboard(20, scope)]).then(([currentUser, result]) => {
      if (!mounted) return;
      setUser(currentUser || null);
      if (result.error) {
        setError(result.error);
        setEntries([]);
      } else {
        setError("");
        setEntries(result.data || []);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [scope]);

  const podium = useMemo(() => entries.slice(0, 3), [entries]);
  const currentUserRow = useMemo(
    () => entries.find((entry) => entry.user_id === user?.id),
    [entries, user?.id],
  );

  return (
    <div className="page-section">
      <div className="container space-y-7">
        <section className="hero-shadow overflow-hidden rounded-[34px] bg-crimson-dark px-6 py-10 text-white md:px-10">
          <div className="text-center">
            <p className="font-serif text-5xl text-white">
              Ranking {scope === "weekly" ? "Semanal" : scope === "monthly" ? "Mensal" : "Geral"}
            </p>
            <p className="mt-3 text-white/66">Acompanhe quem mais acumulou XP e consistencia de leitura.</p>
            <div className="mt-6 flex justify-center gap-3">
              {[
                ["weekly", "Semanal"],
                ["monthly", "Mensal"],
                ["all_time", "Geral"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setScope(value)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold ${
                    scope === value ? "bg-white text-crimson" : "bg-white/10 text-white/78"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {!loading && !error && podium.length > 0 && (
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {podium.map((entry, index) => (
                <article
                  key={entry.user_id}
                  className={`rounded-[28px] border border-white/20 px-6 py-6 text-center ${
                    index === 0 ? "bg-white/10" : "bg-white/10"
                  }`}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-xl font-semibold text-crimson">
                    {getInitials(entry.display_name)}
                  </div>
                  <p className="mt-4 text-sm uppercase tracking-[0.16em] text-secondary">{entry.rank} lugar</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{entry.display_name}</h2>
                  <p className="mt-2 font-serif text-4xl text-secondary">{entry.xp_points}</p>
                  <p className="mt-1 text-sm text-white/65">XP</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {loading && <p className="text-center text-[#64748b]">Carregando ranking...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <section className="panel-card overflow-hidden">
            <div className="grid grid-cols-[72px_1fr_120px] border-b border-[#ebe3d6] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a96a4]">
              <span>#</span>
              <span>Leitor</span>
              <span className="text-right">XP</span>
            </div>
            {entries.map((entry) => (
              <div
                key={`${entry.user_id}-${entry.rank}`}
                className={`grid grid-cols-[72px_1fr_120px] items-center gap-4 border-b border-[#f1ece1] px-6 py-5 last:border-b-0 ${
                  entry.user_id === user?.id ? "bg-[#fff5cf]" : "bg-white"
                }`}
              >
                <div className="text-lg font-serif text-secondary">{entry.rank}</div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-crimson text-sm font-semibold text-white">
                    {getInitials(entry.display_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-crimson">
                      {entry.display_name}
                      {entry.user_id === user?.id ? " (voce)" : ""}
                    </p>
                    <p className="text-sm text-[#748395]">Nivel {entry.level} - @{entry.username}</p>
                  </div>
                </div>
                <div className="text-right font-serif text-3xl text-secondary">{entry.xp_points}</div>
              </div>
            ))}
          </section>
        )}

        {currentUserRow && (
          <section className="panel-card px-6 py-6 text-center">
            <h2 className="font-serif text-3xl text-crimson">Suba no ranking</h2>
            <p className="mt-3 text-[#627183]">
              Voce esta em {currentUserRow.rank} lugar. Registre mais leitura e responda quizzes para ganhar mais XP.
            </p>
            <button
              onClick={() => {
                window.location.hash = "registrar-leitura";
              }}
              className="mt-5 rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-white"
            >
              Registrar leitura agora
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

function getInitials(value) {
  return (value || "LA")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
