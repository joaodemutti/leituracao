import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAcervoSection } from "../data/categoriesNav";
import { isAdminUser, logoutUser, refreshCurrentUser } from "../services/AuthService";
import { searchBooks } from "../services/SearchService";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentPage = pathname.replace(/^\//, "") || "home";

  useEffect(() => {
    refreshCurrentUser().then(setUser);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!query.trim()) {
      setSearching(false);
      setResults([]);
      return undefined;
    }

    let mounted = true;
    setSearching(true);

    const timer = setTimeout(async () => {
      const result = await searchBooks(query);
      if (!mounted) return;
      setResults(result.data || []);
      setSearching(false);
    }, 180);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  const navLinks = buildNavLinks(user);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/home");
    setMobileMenuOpen(false);
  };

  const handleNavigate = (route) => {
    if (route === "sobre") {
      navigate("/home");
      window.requestAnimationFrame(() => {
        document.getElementById("landing-about")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      setMobileMenuOpen(false);
      return;
    }

    navigate(`/${route}`);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e0d1] bg-white/96 shadow-[0_8px_28px_rgba(11,31,58,0.06)] backdrop-blur">
      <div className="container flex min-h-[74px] items-center justify-between gap-4">
        <button
          onClick={() => handleNavigate("home")}
          className="flex flex-shrink-0 items-center gap-3"
          aria-label="LeiturAcao - Ir para o inicio"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-crimson text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
            LA
          </div>
          <div className="hidden whitespace-nowrap font-serif text-[1.95rem] font-semibold leading-none text-crimson-dark sm:block">
            Leitur<span className="text-secondary">Acao</span>
          </div>
        </button>

        <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Navegacao principal">
          {navLinks.map((link) => {
            const active =
              link.route === "acervo"
                ? isAcervoSection(currentPage)
                : link.route === currentPage;

            return (
              <button
                key={link.route}
                onClick={() => handleNavigate(link.route)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${active
                    ? "bg-secondary-light text-secondary shadow-[inset_0_0_0_1px_rgba(26,95,168,0.08)]"
                    : "text-[#405066] hover:bg-[#f4efe7] hover:text-crimson"
                  }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="relative hidden flex-1 max-w-[300px] xl:block">
          <label htmlFor="nav-search" className="sr-only">
            Buscar livros
          </label>
          <input
            id="nav-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar livros..."
            className="w-full rounded-full border border-[#e5dfd4] bg-[#f8f6f1] py-2.5 pl-10 pr-4 text-sm text-crimson placeholder:text-[#9aa2ad] focus:border-secondary focus:bg-white focus:outline-none"
            aria-label="Buscar livros"
          />
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa2ad]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          {(searching || results.length > 0) && query.trim() && (
            <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-full overflow-hidden rounded-2xl border border-[#e6dfd1] bg-white shadow-lg">
              {searching && <p className="px-4 py-3 text-sm text-[#64748b]">Buscando...</p>}
              {!searching && results.length === 0 && (
                <p className="px-4 py-3 text-sm text-[#64748b]">Nenhum livro encontrado.</p>
              )}
              {!searching &&
                results.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                      navigate(getSearchTarget(book));
                    }}
                    className="flex w-full items-center gap-3 border-b border-[#f0ebdf] px-4 py-3 text-left last:border-b-0 hover:bg-[#faf6ef]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-lg">
                      {book.emoji || "Livro"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-crimson">{book.title}</p>
                      <p className="truncate text-xs text-[#64748b]">{book.author}</p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <button
                onClick={() => handleNavigate("profile")}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-crimson text-sm font-semibold text-white"
              >
                {getInitials(user.name || user.username)}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#e2dccc] px-4 py-2 text-sm font-medium text-[#526070] transition-colors hover:border-[#c8bea9] hover:text-crimson"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavigate("login")}
                className="rounded-full border border-[#e2dccc] px-5 py-2 text-sm font-medium text-crimson transition-colors hover:border-[#c8bea9]"
              >
                Entrar
              </button>
              <button
                onClick={() => handleNavigate("register")}
                className="rounded-full bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-mid"
              >
                Cadastrar
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen((value) => !value)}
          className="rounded-xl border border-[#e2dccc] p-2.5 lg:hidden"
          aria-label="Abrir menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg
            className="h-5 w-5"
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

      {mobileMenuOpen && (
        <div className="border-t border-[#ece6d9] bg-white lg:hidden">
          <div className="container py-4">
            <div className="relative mb-4">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar livros..."
                className="w-full rounded-2xl border border-[#e2dccc] bg-[#f8f6f1] px-4 py-3 text-sm focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
            <nav className="space-y-2">
              {navLinks.map((link) => {
                const active =
                  link.route === "acervo"
                    ? isAcervoSection(currentPage)
                    : currentPage === link.route;

                return (
                  <button
                    key={link.route}
                    onClick={() => handleNavigate(link.route)}
                    className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium ${active ? "bg-secondary-light text-secondary" : "hover:bg-[#f6f1e7]"
                      }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-4 space-y-2 border-t border-[#ede6d8] pt-4">
              {user ? (
                <>
                  <button
                    onClick={() => handleNavigate("profile")}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-[#f6f1e7]"
                  >
                    Perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-[#fdf2f2]"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigate("login")}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-[#f6f1e7]"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => handleNavigate("register")}
                    className="block w-full rounded-xl bg-crimson px-3 py-3 text-left text-sm font-semibold text-white"
                  >
                    Cadastrar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function buildNavLinks(user) {
  const links = [
    { route: "home", label: "Inicio" },
    { route: "acervo", label: "Acervo" },
  ];

  if (user) {
    links.push(
      { route: "metas", label: "Metas" },
      { route: "ranking", label: "Ranking" },
      { route: "progresso", label: "Progresso" },
      { route: "sugestoes", label: "Sugestoes" },
      { route: "quiz", label: "Quiz" },
    );
  } else {
    links.push(
      { route: "ranking", label: "Ranking" },
      { route: "metas", label: "Metas" },
      { route: "sobre", label: "Sobre" },
    );
  }

  if (isAdminUser(user)) {
    links.push({ route: "admin", label: "Admin" });
  }

  return links;
}

function getInitials(value) {
  return (value || "LA")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getSearchTarget(book) {
  return book.epubUrl || book.pdfUrl ? `/reader?book=${book.id}` : "/acervo";
}
