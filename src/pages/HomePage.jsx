import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { refreshCurrentUser } from "../services/AuthService";
import { getPublicStats, listCategories, listFeaturedBooks } from "../services/CatalogService";
import { getGoalSummary } from "../services/GoalsService";
import { getCurrentReading, getLeaderboard, getUserStats } from "../services/ReadingService";
import { getSuggestions } from "../services/ExperienceService";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [goalSummary, setGoalSummary] = useState(null);
  const [currentReading, setCurrentReading] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      try {
        const [userResult, categoriesResult, featuredResult, leaderboardResult, platformStatsResult] = await Promise.all([
          refreshCurrentUser(),
          listCategories(),
          listFeaturedBooks(5),
          getLeaderboard(5, "weekly"),
          getPublicStats(),
        ]);

        if (!mounted) return;

        const firstError = categoriesResult.error || featuredResult.error || leaderboardResult.error;
        if (firstError) {
          setLoadError(firstError);
        }

        const currentUser = userResult || null;
        setUser(currentUser);
        setCategories(categoriesResult.data || []);
        setFeaturedBooks(featuredResult.data || []);
        setLeaderboard(leaderboardResult.data || []);
        setPlatformStats(platformStatsResult.data || null);

        if (!currentUser) return;

        const [statsResult, goalsResult, currentReadingResult, suggestionsResult] = await Promise.all([
          getUserStats(currentUser.id),
          getGoalSummary(currentUser.id),
          getCurrentReading(currentUser.id),
          getSuggestions(currentUser.id, 4),
        ]);

        if (!mounted) return;

        const userDataError = statsResult.error || goalsResult.error || currentReadingResult.error || suggestionsResult.error;
        if (userDataError) {
          setLoadError(userDataError);
        }

        setStats(statsResult.data || null);
        setGoalSummary(goalsResult.data || null);
        setCurrentReading(currentReadingResult.data || null);
        setSuggestions(suggestionsResult.data?.books || []);
      } catch (error) {
        if (!mounted) return;
        console.error("Failed to load home page", error);
        setLoadError(error.message || "Não foi possível carregar os dados.");
      }
    }

    loadPage();

    return () => {
      mounted = false;
    };
  }, []);

  if (!user) {
    return (
      <div className="page-section">
        <div className="container space-y-8">
          <section className="hero-shadow overflow-hidden rounded-[34px] bg-crimson-dark text-white">
            <div className="grid gap-10 px-6 py-12 md:px-10 md:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="max-w-[640px]">
                <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80">
                  Mais de 4.200 livros gratuitos para você
                </div>
                <h1 className="mt-6 max-w-[11ch] text-balance font-serif text-5xl font-semibold leading-[0.95] text-white md:text-7xl">
                  Bem-vindo a <span className="text-secondary">LeiturAção</span>
                </h1>
                <p className="mt-6 max-w-[580px] text-lg text-white/76">
                  Sua biblioteca digital gratuita para ler, salvar progresso, ganhar pontos e subir de nível em uma jornada de leitura consistente.
                </p>

                <div className="mt-10 grid max-w-[560px] grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    [platformStats ? `${platformStats.totalBooks.toLocaleString("pt-BR")}+` : "...", "Livros"],
                    [platformStats ? String(platformStats.totalAuthors) : "...", "Autores"],
                    [platformStats ? `${platformStats.freePercent}%` : "...", "Gratuito"],
                    ["12k+", "Leitores"],
                  ].map(([value, label]) => (
                    <article key={label} className="rounded-[22px] border border-white/20 bg-white/10 px-4 py-5">
                      <p className="font-serif text-3xl">{value}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/60">{label}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid gap-5">
                <article className="rounded-[30px] bg-white p-6 text-crimson shadow-xl">
                  <div className="mb-3 inline-flex rounded-full bg-secondary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                    Recomendado
                  </div>
                  <h2 className="font-serif text-3xl font-bold">Criar conta grátis</h2>
                  <p className="mt-3 text-sm text-[#5d6979]">
                    Salve favoritos, acompanhe histórico, mantenha sua sequência e participe do ranking.
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-[#415065]">
                    <li>Salvar favoritos e histórico</li>
                    <li>Ganhar pontos e subir de nível</li>
                    <li>Registrar metas e streak</li>
                    <li>Participar do ranking semanal</li>
                  </ul>
                  <button
                    onClick={() => {
                      navigate("/register");
                    }}
                    className="mt-6 w-full rounded-full bg-secondary px-5 py-3 font-semibold text-white transition-colors hover:bg-[#d45f00]"
                  >
                    Criar conta gratuita
                  </button>
                </article>

                <article className="rounded-[30px] bg-white px-6 py-6 text-crimson shadow-xl">
                  <h2 className="font-serif text-3xl font-bold">Já tenho conta</h2>
                  <p className="mt-3 text-sm text-[#5d6979]">
                    Entre com seu e-mail e senha para continuar sua jornada.
                  </p>
                  <button
                    onClick={() => {
                      navigate("/login");
                    }}
                    className="mt-6 w-full rounded-full bg-crimson px-5 py-3 font-semibold text-white transition-colors hover:bg-crimson-mid"
                  >
                    Entrar na minha conta
                  </button>
                </article>
              </div>
            </div>
          </section>

          {loadError && (
            <p className="rounded-[18px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              Não foi possível carregar todos os dados: {loadError}
            </p>
          )}

          <section id="landing-about" className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="panel-card p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Explore o acervo</p>
              <h2 className="mt-3 font-serif text-4xl text-crimson">Comece lendo sem fricção</h2>
              <p className="mt-3 text-[#5e6b7c]">
                O acervo está organizado por categoria, com materiais gratuitos, clássicos e trilhas para estudo, literatura e formação pessoal.
              </p>
              <button
                onClick={() => {
                  navigate("/acervo");
                }}
                className="mt-6 rounded-full border border-[#d9cfbf] px-5 py-3 text-sm font-semibold text-crimson transition-colors hover:bg-[#f6f1e8]"
              >
                Navegar pelo acervo
              </button>
            </article>

            <div className="grid gap-4 sm:grid-cols-2">
              {categories.slice(0, 4).map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    navigate(`/${category.route}`);
                  }}
                  className="panel-card p-6 text-left transition-transform hover:-translate-y-0.5"
                >
                  <div className="text-3xl">{category.emoji}</div>
                  <h3 className="mt-4 font-serif text-2xl text-crimson">{category.label}</h3>
                  <p className="mt-2 text-sm text-[#5e6b7c]">{category.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const currentRank = leaderboard.find((item) => item.user_id === user.id)?.rank;

  return (
    <div className="page-section">
      <div className="container space-y-7">
        <section className="overflow-hidden rounded-[34px] bg-crimson-dark text-white hero-shadow">
          <div className="grid gap-6 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1fr_220px] lg:items-center">
            <div>
              <p className="text-sm text-white/68">☀️ Bom dia, {user.name?.split(" ")[0] || user.username}</p>
              <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">Continue sua jornada de leitura</h1>
              <div className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-secondary">
                🔥 {stats?.current_streak || 0} dias seguidos — não perca sua sequência!
              </div>
              <div className="mt-6 max-w-[430px]">
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-secondary"
                    style={{ width: `${Math.min(100, ((stats?.xp_points || 0) % 1000) / 10)}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-white/65">
                  {stats?.xp_points || 0} / {(stats?.level || 1) * 1000} XP rumo ao próximo nível
                </p>
              </div>
            </div>

            <article className="ml-auto flex h-[150px] w-[150px] flex-col items-center justify-center rounded-[28px] border border-white/20 bg-white/10 text-center">
              <p className="font-serif text-5xl text-secondary">{stats?.level || 1}</p>
              <p className="mt-1 text-base text-secondary">Explorador</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/55">Nível atual</p>
            </article>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["📚", "Livros lidos", stats?.total_books_read || 0],
            ["⭐", "Pontos XP", stats?.xp_points || 0],
            ["🔥", "Dias seguidos", stats?.current_streak || 0],
            ["🏆", "Ranking", currentRank ? `${currentRank}o` : "--"],
            ["🎯", "Metas ativas", `${goalSummary?.activeCount || 0}/${(goalSummary?.activeCount || 0) + (goalSummary?.completedCount || 0)}`],
          ].map(([emoji, label, value]) => (
            <article key={label} className="panel-card p-6">
              <p className="text-3xl">{emoji}</p>
              <p className="mt-3 font-serif text-4xl text-crimson">{value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#7a8797]">{label}</p>
            </article>
          ))}
        </section>

        {currentReading && (
          <section className="panel-card p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-serif text-4xl text-crimson">Continue lendo</h2>
              <button
                onClick={() => {
                  navigate("/registrar-leitura");
                }}
                className="text-sm font-semibold text-secondary"
              >
                Registrar leitura
              </button>
            </div>
            <div className="flex flex-col gap-4 rounded-[24px] bg-[#fcfaf5] p-5 md:flex-row md:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#ecf2ff] text-4xl">
                {currentReading.book?.emoji || "Livro"}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-semibold text-crimson">{currentReading.book?.title}</h3>
                <p className="text-sm text-[#667587]">
                  {currentReading.book?.author} - Pag. {currentReading.current_page || 0}
                  {currentReading.estimated_pages ? ` de ${currentReading.estimated_pages}` : ""}
                </p>
                <div className="mt-4 h-2.5 rounded-full bg-[#e9e2d5]">
                  <div
                    className="h-full rounded-full bg-crimson"
                    style={{ width: `${currentReading.completion_percentage || 0}%` }}
                  />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8893a2]">
                  {currentReading.completion_percentage || 0}% concluído
                </p>
              </div>
              <button
                onClick={() => {
                  navigate(`/reader?book=${currentReading.book_id}`);
                }}
                className="rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crimson-mid"
              >
                Continuar
              </button>
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="panel-card p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="font-serif text-4xl text-crimson">Sugestões para você</h2>
              <button
                onClick={() => {
                  navigate("/sugestoes");
                }}
                className="text-sm font-semibold text-secondary"
              >
                Ver tudo
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {(suggestions.length ? suggestions : featuredBooks).slice(0, 4).map((book) => (
                <article key={book.id} className="overflow-hidden rounded-[24px] border border-[#e8dfcf] bg-white">
                  <div className="flex min-h-[144px] items-center justify-center bg-[#eef4ff] px-4 py-6 text-4xl">
                    {book.emoji || "Livro"}
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8796]">
                      {"match" in book ? `${book.match}% match` : "Destaque"}
                    </p>
                    <h3 className="text-lg font-semibold text-crimson">{book.title}</h3>
                    <p className="text-sm text-[#6c7a8c]">{book.author}</p>
                    <p className="min-h-[60px] text-sm text-[#5c6a7b]">
                      {"reason" in book ? book.reason : book.summary}
                    </p>
                    <button
                      onClick={() => {
                        navigate(`/reader?book=${book.id}`);
                      }}
                      className="mt-2 w-full rounded-full bg-crimson px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Ler agora
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <div className="grid gap-5">
            <article className="panel-card p-6">
              <h2 className="font-serif text-3xl text-crimson">Ranking semanal</h2>
              <ol className="mt-5 space-y-3">
                {leaderboard.slice(0, 5).map((entry) => (
                  <li key={`${entry.user_id}-${entry.rank}`} className="flex items-center justify-between rounded-[20px] bg-[#fbf8f2] px-4 py-3">
                    <div>
                      <p className="font-semibold text-crimson">{entry.rank}o {entry.display_name}</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-[#8090a0]">Nível {entry.level}</p>
                    </div>
                    <p className="font-serif text-2xl text-secondary">{entry.xp_points}</p>
                  </li>
                ))}
              </ol>
            </article>

            <article className="panel-card p-6">
              <h2 className="font-serif text-3xl text-crimson">Acessos rápidos</h2>
              <div className="mt-4 grid gap-3">
                {[
                  ["Registrar leitura", "registrar-leitura"],
                  ["Ver progresso", "progresso"],
                  ["Responder quiz", "quiz"],
                  ["Gerenciar metas", "metas"],
                ].map(([label, route]) => (
                  <button
                    key={route}
                    onClick={() => {
                      navigate(`/${route}`);
                    }}
                    className="rounded-[20px] border border-[#e8dfcf] bg-[#fcfaf5] px-4 py-4 text-left font-semibold text-crimson transition-colors hover:bg-white"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
