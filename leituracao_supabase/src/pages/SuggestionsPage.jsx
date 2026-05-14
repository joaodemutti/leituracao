import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/AuthService";
import { getSuggestions } from "../services/ExperienceService";

export default function SuggestionsPage() {
  const navigate = useNavigate();
  const [payload, setPayload] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSuggestions() {
      const user = await getCurrentUser();
      if (!mounted || !user) return;

      const result = await getSuggestions(user.id, 8);
      if (!mounted) return;

      if (result.error) {
        setError(result.error);
      } else {
        setPayload(result.data || null);
      }
      setLoading(false);
    }

    loadSuggestions();

    return () => {
      mounted = false;
    };
  }, []);

  const books = (payload?.books || []).filter((book) =>
    activeFilter === "all" ? true : book.categoryId === activeFilter,
  );

  return (
    <div className="page-section">
      <div className="container space-y-7">
        <section className="hero-shadow overflow-hidden rounded-[34px] bg-crimson-dark px-6 py-10 text-white md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Sugestoes para voce</p>
          <h1 className="mt-4 font-serif text-5xl">Livros alinhados ao seu perfil</h1>
          <p className="mt-4 max-w-[740px] text-white/72">
            As recomendacoes abaixo usam seu historico recente, categoria em andamento e destaques do acervo para priorizar o que faz mais sentido agora.
          </p>
          {!!payload?.filters?.length && (
            <div className="mt-6 flex flex-wrap gap-2">
              {payload.filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    activeFilter === filter.id ? "bg-secondary text-crimson" : "bg-white/10 text-white/80"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </section>

        {loading && <p className="text-center text-[#64748b]">Carregando sugestoes...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <section className="panel-card px-6 py-5">
              <p className="text-sm text-crimson">
                {payload?.explanation || "Recomendacoes selecionadas para o seu perfil."}
              </p>
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {books.map((book) => (
                <article key={book.id} className="panel-card overflow-hidden">
                  <div className="relative flex min-h-[180px] items-center justify-center bg-gradient-to-br from-[#eef4ff] via-[#fdf7e2] to-[#f9efe8] text-5xl">
                    {book.emoji || "Livro"}
                    <span className="absolute right-4 top-4 rounded-full bg-crimson px-3 py-1 text-xs font-semibold text-white">
                      {book.match}% match
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">{book.categoryLabel}</p>
                    <h2 className="mt-3 text-2xl font-semibold text-crimson">{book.title}</h2>
                    <p className="mt-1 text-sm text-[#6e7b8d]">{book.author}</p>
                    <p className="mt-4 min-h-[74px] text-sm leading-6 text-[#5f6c7c]">{book.reason}</p>
                    <button
                      onClick={() => {
                        navigate(`/reader?book=${book.id}`);
                      }}
                      className="mt-5 w-full rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-white"
                    >
                      Ler agora
                    </button>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
