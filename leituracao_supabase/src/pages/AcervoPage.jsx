import { ACERVO_CATEGORIES } from "../data/categoriesNav";

export default function AcervoPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-gray-200 py-10 px-4">
        <div className="container max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-2">
            Acervo
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy">
            Explore por categoria
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Escolha uma categoria para ver os livros disponíveis no acervo gratuito.
          </p>
        </div>
      </div>

      <div className="container py-10 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {ACERVO_CATEGORIES.map((cat) => (
            <button
              key={cat.route}
              type="button"
              onClick={() => {
                window.location.hash = cat.route;
              }}
              className="rounded-xl border border-gray-200 bg-white px-4 py-5 text-left shadow-xs hover:border-gold hover:shadow-sm transition-all"
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <p className="text-sm font-semibold text-navy leading-tight">
                {cat.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
