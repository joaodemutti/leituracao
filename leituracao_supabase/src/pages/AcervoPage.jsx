import { useEffect, useState } from "react";
import { listCategories } from "../services/CatalogService";

export default function AcervoPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    listCategories().then((result) => {
      if (!mounted) return;
      if (result.error) {
        setError(result.error);
      } else {
        setCategories(result.data || []);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page-section">
      <div className="container space-y-7">
        <section className="hero-shadow overflow-hidden rounded-[32px] bg-navy px-6 py-10 text-white md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Acervo gratuito</p>
          <h1 className="mt-4 max-w-[12ch] font-serif text-5xl leading-[0.98] md:text-6xl">
            Explore a biblioteca por categoria
          </h1>
          <p className="mt-4 max-w-[620px] text-base text-white/72">
            Materiais de educacao, literatura, filosofia, ciencias e outras trilhas de formacao disponiveis para leitura gratuita.
          </p>
        </section>

        {loading && <p className="text-center text-[#64748b]">Carregando categorias...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  window.location.hash = category.route;
                }}
                className="panel-card group p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#f3f7ff] text-3xl">
                  {category.emoji}
                </div>
                <h2 className="mt-5 font-serif text-3xl text-navy">{category.label}</h2>
                <p className="mt-3 text-sm leading-6 text-[#5e6b7c]">{category.desc}</p>
                <div className="mt-6 flex gap-4 text-xs uppercase tracking-[0.16em] text-[#8693a2]">
                  <span>{category.stats.total} titulos</span>
                  <span>{category.stats.authors} autores</span>
                </div>
                <div className="mt-6 text-sm font-semibold text-blue">Abrir categoria</div>
              </button>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
