import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { getCategoryByRoute, listBooksByCategory } from "../services/CatalogService";

export default function CategoryPage({ category }) {
  const [books, setBooks] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCategory() {
      setLoading(true);
      const categoryResult = await getCategoryByRoute(category);

      if (!mounted) return;
      if (categoryResult.error) {
        setError(categoryResult.error);
        setCategoryData(null);
        setLoading(false);
        return;
      }

      setCategoryData(categoryResult.data);
      setSelectedFilter("Todos");
      setError("");
    }

    loadCategory();

    return () => {
      mounted = false;
    };
  }, [category]);

  useEffect(() => {
    let mounted = true;
    if (!categoryData) return undefined;

    setLoading(true);

    listBooksByCategory(category, selectedFilter).then((result) => {
      if (!mounted) return;
      if (result.error) {
        setError(result.error);
        setBooks([]);
      } else {
        setBooks(result.data || []);
        setError("");
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [category, categoryData, selectedFilter]);

  if (!categoryData && error) {
    return (
      <div className="page-section">
        <div className="container flex items-center justify-center">
          <div className="panel-card max-w-[560px] px-8 py-12 text-center">
            <h1 className="font-serif text-4xl text-crimson">Categoria nao encontrada</h1>
            <p className="mt-4 text-[#607082]">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="container space-y-7">
        {categoryData && (
          <section className="panel-card overflow-hidden">
            <div className="grid gap-6 bg-gradient-to-r from-[#fffdf9] via-[#f9f3e8] to-[#eef4ff] px-6 py-8 md:px-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-4xl shadow-sm">
                    {categoryData.emoji}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Categoria</p>
                    <h1 className="font-serif text-5xl text-crimson">{categoryData.label}</h1>
                  </div>
                </div>
                <p className="mt-5 max-w-[760px] text-[#5e6b7c]">{categoryData.desc}</p>
              </div>
              <div className="grid min-w-[220px] grid-cols-3 gap-3 text-center">
                {[
                  [categoryData.stats.total || 0, "Titulos"],
                  [categoryData.stats.free || 0, "Gratis"],
                  [categoryData.stats.authors || 0, "Autores"],
                ].map(([value, label]) => (
                  <article key={label} className="rounded-[20px] border border-white/200 bg-white/100 px-3 py-4">
                    <p className="font-serif text-3xl text-crimson">{value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#7a8797]">{label}</p>
                  </article>
                ))}
              </div>
            </div>

            {categoryData.filters?.length > 0 && (
              <div className="border-t border-[#ebe4d6] px-6 py-5 md:px-10">
                <div className="flex flex-wrap gap-2">
                  {categoryData.filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selectedFilter === filter
                          ? "bg-crimson text-white"
                          : "bg-[#f6f1e7] text-[#526071] hover:bg-[#eee6d8]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {loading ? (
          <p className="text-center text-[#64748b]">Carregando livros...</p>
        ) : books.length === 0 ? (
          <div className="panel-card px-8 py-12 text-center text-[#607082]">
            Nenhum livro encontrado para este filtro.
          </div>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
