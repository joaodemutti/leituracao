import { useEffect, useState } from "react";
import { CATEGORIES } from "../data/database";
import BookCard from "../components/BookCard";

export default function CategoryPage({ category }) {
  const [books, setBooks] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Todos");

  useEffect(() => {
    const catData = CATEGORIES[category];
    if (catData) {
      setCategoryData(catData);
      setBooks(catData.books || []);
      setFilteredBooks(catData.books || []);
      setSelectedFilter("Todos");
    }
  }, [category]);

  useEffect(() => {
    if (!books.length) return;

    if (selectedFilter === "Todos") {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(
        books.filter((book) => {
          const tags = book.tags || [];
          return tags.includes(selectedFilter);
        }),
      );
    }
  }, [selectedFilter, books]);

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">
            Categoria não encontrada
          </h1>
          <button
            onClick={() => (window.location.hash = "home")}
            className="px-6 py-2 bg-blue text-white rounded font-semibold"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="container">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{categoryData.emoji}</span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-navy">
              {categoryData.label}
            </h1>
          </div>
          <p className="text-gray-600 mb-4">{categoryData.desc}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="font-semibold text-navy">Total:</span>{" "}
              {categoryData.stats.total}
            </div>
            <div>
              <span className="font-semibold text-navy">Grátis:</span>{" "}
              {categoryData.stats.free}
            </div>
            <div>
              <span className="font-semibold text-navy">Autores:</span>{" "}
              {categoryData.stats.authors}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {categoryData.filters && categoryData.filters.length > 0 && (
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

      {/* Books Grid */}
      <div className="py-12 px-4">
        <div className="container">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-600 mb-6">
                Nenhum livro encontrado nesta categoria
              </p>
              <button
                onClick={() => (window.location.hash = "home")}
                className="px-6 py-2 bg-navy text-white rounded font-semibold"
              >
                Voltar ao Início
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
