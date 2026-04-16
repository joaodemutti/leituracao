import { useEffect, useState } from "react";
import { initAuth, isLoggedIn } from "./services/AuthService";
import Navbar from "./components/Navbar";
import TopBar from "./components/TopBar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import CategoryPage from "./pages/CategoryPage";
import AcervoPage from "./pages/AcervoPage";
import MetasPage from "./pages/MetasPage";
import RankingPage from "./pages/RankingPage";
import NotFound from "./pages/NotFound";

// Rotas públicas (não precisa autenticação)
const PUBLIC_PAGES = ["home", "login", "register"];

// Rotas que precisam de autenticação
const PROTECTED_PAGES = {
  profile: ProfilePage,
  metas: MetasPage,
  ranking: RankingPage,
};

const PAGES = {
  home: HomePage,
  acervo: AcervoPage,
  metas: MetasPage,
  ranking: RankingPage,
  login: LoginPage,
  register: RegisterPage,
  profile: ProfilePage,
  educacao: CategoryPage,
  literatura: CategoryPage,
  ciencia: CategoryPage,
  historia: CategoryPage,
  sociais: CategoryPage,
  arte: CategoryPage,
  religiao: CategoryPage,
  filosofia: CategoryPage,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Inicializar autenticação
    initAuth().then(() => {
      setIsInitialized(true);
    });

    // Escutar mudanças de hash
    const handleHashChange = () => {
      const hash =
        window.location.hash.replace("#", "").split("?")[0] || "home";
      setCurrentPage(hash);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Trigger initial route

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Verificar se a página está protegida e não tem autenticação
  if (currentPage in PROTECTED_PAGES && !isLoggedIn()) {
    window.location.hash = "login";
  }

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  const PageComponent = PAGES[currentPage] || NotFound;

  return (
    <>
      <TopBar />
      <Navbar currentPage={currentPage} />
      <main id="app-main">
        <PageComponent category={currentPage} />
      </main>
    </>
  );
}
