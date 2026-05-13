export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-serif font-bold text-crimson mb-2">404</h1>
        <p className="text-2xl font-bold text-crimson mb-4">
          Página não encontrada
        </p>
        <p className="text-gray-600 mb-8">
          A página que você procura não existe ou foi removida.
        </p>
        <button
          onClick={() => (window.location.hash = "home")}
          className="px-6 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
