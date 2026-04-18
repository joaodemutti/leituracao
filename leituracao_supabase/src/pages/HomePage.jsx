import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/AuthService";
import { getGoalSummary } from "../services/GoalsService";
import { listCategories, listFeaturedBooks } from "../services/CatalogService.js";
import {
  getCurrentReading,
  getLeaderboard,
  getReadingAnalytics,
  getUserStats,
  getBadgeLabel,
} from "../services/ReadingService";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentReading, setCurrentReading] = useState(null);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
  const [goalSummary, setGoalSummary] = useState(null);
  const [pagesToday, setPagesToday] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadHome() {
      const [categoryResult, featuredResult, currentUser] = await Promise.all([
        listCategories(),
        listFeaturedBooks(4),
        getCurrentUser(),
      ]);

      if (!mounted) return;
      setCategories(categoryResult.data || []);
      setFeaturedBooks(featuredResult.data || []);
      setUser(currentUser || null);

      if (!currentUser) return;

      const todayKey = new Date().toISOString().split("T")[0];
      const [statsResult, progressResult, leaderboardResult, goalsResult, analyticsResult] =
        await Promise.all([
          getUserStats(currentUser.id),
          getCurrentReading(currentUser.id),
          getLeaderboard(5, "weekly"),
          getGoalSummary(currentUser.id),
          getReadingAnalytics(currentUser.id, 1),
        ]);

      if (!mounted) return;

      setStats(statsResult.data || null);
      setCurrentReading(progressResult.data || null);
      setWeeklyLeaderboard(leaderboardResult.data || []);
      setGoalSummary(goalsResult.data || null);
      setPagesToday(analyticsResult.data?.[todayKey]?.pages || 0);
    }

    loadHome();

    return () => {
      mounted = false;
    };
  }, []);

  const achievementBadges = (stats?.badges || []).slice(0, 4).map((badgeId) => ({
    title: getBadgeLabel(badgeId),
    desc: `Conquista desbloqueada: ${badgeId}`,
  }));

  return (
    <main className="min-h-screen bg-cream px-4 py-8 md:py-10">
      <div className="container space-y-6">
        {!user && (
          <section className="bg-gradient-to-r from-navy via-navy-mid to-navy rounded-xl p-6 md:p-8 text-white shadow-lg">
            <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-2">
              Continue sua jornada de leitura
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-2xl">
              Registre leituras, ganhe XP, acompanhe metas e retome seus EPUBs do ponto salvo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => (window.location.hash = "register")}
                className="px-5 py-2.5 rounded-full bg-gold text-navy font-semibold text-sm hover:bg-[#cf9a45] transition-colors"
              >
                Criar conta gratuita
              </button>
              <button
                onClick={() => (window.location.hash = "login")}
                className="px-5 py-2.5 rounded-full border border-white/40 text-white font-medium text-sm hover:bg-white/10 transition-colors"
              >
                Entrar na minha conta
              </button>
            </div>
          </section>
        )}

        {user && stats && (
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              ["Livros lidos", stats.total_books_read],
              ["Pontos XP", stats.xp_points],
              ["Dias seguidos", stats.current_streak],
              ["Nivel", stats.level],
              ["Metas ativas", goalSummary?.activeCount || 0],
              ["Paginas hoje", pagesToday],
            ].map(([label, value]) => (
              <article
                key={label}
                className="bg-white rounded-lg border border-gray-100 shadow-xs p-4 min-h-[92px]"
              >
                <p className="text-xl font-serif text-navy leading-none mt-1">
                  {value}
                </p>
                <p className="text-xs uppercase tracking-wide text-gray-500 mt-2">
                  {label}
                </p>
              </article>
            ))}
          </section>
        )}

        {user && currentReading && (
          <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-2xl text-navy">Continue lendo</h2>
              <button
                onClick={() => (window.location.hash = "acervo")}
                className="text-sm text-blue font-semibold hover:underline"
              >
                Ver acervo
              </button>
            </div>
            <div className="rounded-lg bg-cream-dark p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
              <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-xl">
                {currentReading.book?.emoji || "Livro"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-navy">{currentReading.book?.title}</p>
                <p className="text-sm text-gray-600">
                  {currentReading.book?.author} · Pag. {currentReading.current_page || 0}
                  {currentReading.estimated_pages ? ` de ${currentReading.estimated_pages}` : ""}
                </p>
                <div className="h-2 bg-white rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue rounded-full"
                    style={{ width: `${currentReading.completion_percentage || 0}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  window.location.hash = `reader?book=${currentReading.book_id}`;
                }}
                className="px-5 py-2 rounded-full bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-colors"
              >
                Continuar
              </button>
            </div>
          </section>
        )}

        <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
          <h2 className="font-serif text-2xl text-navy mb-4">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.route}
                onClick={() => (window.location.hash = cat.route)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-4 hover:border-gold hover:shadow-sm transition-all text-left"
              >
                <div className="text-2xl mb-1">{cat.emoji}</div>
                <p className="text-sm font-semibold text-navy">{cat.label}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl text-navy">Sugestoes para voce</h2>
            <button
              onClick={() => (window.location.hash = "acervo")}
              className="text-sm text-blue font-semibold hover:underline"
            >
              Ver mais
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {featuredBooks.map((book) => (
              <article
                key={book.id}
                className="rounded-lg border border-gray-100 bg-gradient-to-b from-[#f8fbff] to-white p-4"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{book.emoji || "Livro"}</span>
                  <span className="text-[10px] font-semibold uppercase bg-navy text-white px-2 py-1 rounded-full">
                    Destaque
                  </span>
                </div>
                <h3 className="font-semibold text-navy mt-3">{book.title}</h3>
                <p className="text-sm text-gray-500">{book.author}</p>
                <button
                  onClick={() => {
                    window.location.hash = `reader?book=${book.id}`;
                  }}
                  className="mt-3 text-sm font-semibold text-blue hover:underline"
                >
                  Ler agora
                </button>
              </article>
            ))}
          </div>
        </section>

        {user && stats && (
          <section className="grid lg:grid-cols-5 gap-4">
            <article className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
              <h2 className="font-serif text-2xl text-navy">Progresso</h2>
              <p className="text-sm text-gray-600 mb-4">
                Voce esta no nivel {stats.level} e tem {stats.xp_points} XP acumulados.
              </p>
              <div className="h-3 bg-cream-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold"
                  style={{ width: `${Math.min(100, (stats.xp_points % 1000) / 10)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                <span>{stats.xp_points} XP</span>
                <span>Nivel {stats.level}</span>
              </div>
            </article>
            <article className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
              <h2 className="font-serif text-2xl text-navy mb-3">Ranking semanal</h2>
              <ol className="space-y-2 text-sm">
                {weeklyLeaderboard.map((entry) => (
                  <li
                    key={`${entry.user_id}-${entry.rank}`}
                    className="flex items-center justify-between rounded-md bg-cream-dark px-3 py-2 text-navy"
                  >
                    <span>
                      <strong>{entry.rank}º</strong> {entry.display_name}
                    </span>
                    <span className="font-semibold text-gold">{entry.xp_points} XP</span>
                  </li>
                ))}
              </ol>
            </article>
          </section>
        )}

        {user && (
          <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
            <h2 className="font-serif text-2xl text-navy mb-4">Conquistas</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(achievementBadges.length ? achievementBadges : [{ title: "Sem badges ainda", desc: "Conclua leituras para desbloquear conquistas." }]).map((achievement) => (
                <article
                  key={achievement.title}
                  className="rounded-lg border border-gray-200 bg-cream-dark/55 p-4"
                >
                  <p className="font-semibold text-navy">{achievement.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{achievement.desc}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
