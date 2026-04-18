import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/ReadingService";

export default function RankingPage() {
  const [scope, setScope] = useState("weekly");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getLeaderboard(20, scope).then((result) => {
      if (!mounted) return;
      if (result.error) {
        setError(result.error);
        setEntries([]);
      } else {
        setEntries(result.data || []);
        setError("");
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [scope]);

  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="container max-w-4xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-navy">Ranking</h1>
            <p className="text-gray-600 text-sm mt-1">
              Acompanhe a disputa por XP e consistencia de leitura.
            </p>
          </div>
          <div className="flex gap-2">
            {[
              ["weekly", "Semanal"],
              ["all_time", "Geral"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setScope(value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  scope === value ? "bg-navy text-white" : "bg-white text-navy border border-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-gray-500">Carregando ranking...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            {entries.map((entry) => (
              <div
                key={`${entry.user_id}-${entry.rank}`}
                className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-navy">
                    #{entry.rank} {entry.display_name}
                  </p>
                  <p className="text-sm text-gray-500">@{entry.username} · Nivel {entry.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gold">{entry.xp_points} XP</p>
                  <p className="text-sm text-gray-500">{entry.total_books_read} livros</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
