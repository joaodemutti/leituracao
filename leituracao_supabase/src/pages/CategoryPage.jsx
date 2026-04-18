import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { isAdminUser, refreshCurrentUser } from "../services/AuthService";
import { getCategoryByRoute, listBooksByCategory } from "../services/CatalogService.js";

export default function CategoryPage({ category }) {
  const [books, setBooks] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    let mounted = true;
    refreshCurrentUser().then((user) => {
      if (mounted) {
        setCanEdit(isAdminUser(user));
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadCategory() {
      setLoading(true);
      setError("");

      const categoryResult = await getCategoryByRoute(category);
      if (!mounted) return;

      if (categoryResult.error) {
        setError(categoryResult.error);
        setCategoryData(null);
        setBooks([]);
        setLoading(false);
        return;
      }

      setCategoryData(categoryResult.data);
      setSelectedFilter("Todos");

      const booksResult = await listBooksByCategory(category, "Todos");
      if (!mounted) return;

      if (booksResult.error) {
        setError(booksResult.error);
        setBooks([]);
      } else {
        setBooks(booksResult.data || []);
      }

      setLoading(false);
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
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [category, categoryData, selectedFilter]);

  if (loading && !categoryData) {
    return <div className="p-8 text-center">Carregando categoria...</div>;
  }

  if (error && !categoryData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">Categoria nao encontrada</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => (window.location.hash = "home")}
            className="px-6 py-2 bg-blue text-white rounded font-semibold"
          >
            Voltar ao inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="container">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{categoryData?.emoji}</span>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-navy">
                {categoryData?.label}
              </h1>
            </div>
            {canEdit && categoryData?.id && (
              <button
                onClick={() => {
                  window.location.hash = `admin?category=${encodeURIComponent(categoryData.id)}`;
                }}
                className="px-4 py-2 rounded border border-blue text-blue text-sm font-semibold hover:bg-blue-soft transition-colors"
              >
                Editar categoria
              </button>
            )}
          </div>
          <p className="text-gray-600 mb-4">{categoryData?.desc}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="font-semibold text-navy">Total:</span>{" "}
              {categoryData?.stats.total || 0}
            </div>
            <div>
              <span className="font-semibold text-navy">Gratis:</span>{" "}
              {categoryData?.stats.free || 0}
            </div>
            <div>
              <span className="font-semibold text-navy">Autores:</span>{" "}
              {categoryData?.stats.authors || 0}
            </div>
          </div>
        </div>
      </div>

      {categoryData?.filters?.length > 0 && (
        <div className="bg-white border-b border-gray-200 py-4 px-4">
          <div className="container">
            <div className="flex flex-wrap gap-2">
              {categoryData.filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    selectedFilter === filter
                      ? "bg-blue text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="py-12 px-4">
        <div className="container">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Carregando livros...</div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">Sem resultados</div>
              <p className="text-gray-600 mb-6">
                Nenhum livro encontrado nesta categoria.
              </p>
              <button
                onClick={() => (window.location.hash = "home")}
                className="px-6 py-2 bg-navy text-white rounded font-semibold"
              >
                Voltar ao inicio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
