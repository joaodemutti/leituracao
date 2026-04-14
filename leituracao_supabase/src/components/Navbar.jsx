import { useState } from "react";
import { isAcervoSection } from "../data/categoriesNav";

export default function Navbar({ currentPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { route: "home", label: "Início" },
    { route: "acervo", label: "Acervo" },
    { route: "metas", label: "Metas" },
    { route: "ranking", label: "Ranking" },
  ];

  const handleNavigate = (route) => {
    window.location.hash = route;
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/97 backdrop-blur border-b border-gray-200 transition-shadow duration-300">
      <div className="container flex items-center justify-between gap-4 h-15">
        {/* Logo */}
        <button
          onClick={() => handleNavigate("home")}
          className="flex items-center gap-2 flex-shrink-0"
          aria-label="LeiturAção — Ir para o início"
        >
          <div className="w-8 h-8 rounded bg-navy flex items-center justify-center text-lg flex-shrink-0">
            📚
          </div>
          <div className="font-serif text-lg font-bold text-navy tracking-tight whitespace-nowrap hidden sm:block">
            Leitur<span className="text-gold">Ação</span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav
          className="hidden md:flex gap-1 ml-2"
          aria-label="Navegação principal"
        >
          {navLinks.map((link) => {
            const active =
              link.route === "acervo"
                ? isAcervoSection(currentPage)
                : link.route === currentPage;
            return (
              <button
                key={link.route}
                onClick={() => handleNavigate(link.route)}
                className={`px-3 py-2 rounded text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  active
                    ? "bg-blue-soft text-blue font-semibold"
                    : "text-gray-500 hover:bg-gray-100 hover:text-navy"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-64 ml-auto relative hidden sm:block">
          <label htmlFor="nav-search" className="sr-only">
            Buscar livros
          </label>
          <input
            id="nav-search"
            type="search"
            placeholder="Buscar livros…"
            className="w-full pl-8 pr-3 py-2 rounded bg-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue"
            aria-label="Buscar livros"
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* Auth Links - Desktop */}
        <div className="hidden md:flex gap-3 ml-4">
          <button
            onClick={() => handleNavigate("login")}
            className="text-sm font-medium text-gray-500 hover:text-navy transition-colors"
          >
            Entrar
          </button>
          <button
            onClick={() => handleNavigate("register")}
            className="text-sm font-medium text-gray-500 hover:text-navy transition-colors"
          >
            Cadastrar
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
          aria-label="Abrir menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="container py-4 space-y-2">
            {navLinks.map((link) => {
              const active =
                link.route === "acervo"
                  ? isAcervoSection(currentPage)
                  : currentPage === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => handleNavigate(link.route)}
                  className={`block w-full text-left px-3 py-2 rounded text-sm font-medium ${
                    active ? "bg-blue-soft text-blue" : "hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <div className="border-t pt-2 mt-2 space-y-2">
              <button
                onClick={() => handleNavigate("login")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
              >
                Entrar
              </button>
              <button
                onClick={() => handleNavigate("register")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
              >
                Cadastrar
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
