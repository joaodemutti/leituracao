import { Suspense, lazy, useEffect, useState } from "react";
import { initAuth, isLoggedIn } from "./services/AuthService";
import Navbar from "./components/Navbar";
import TopBar from "./components/TopBar";
import NotFound from "./pages/NotFound";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const AcervoPage = lazy(() => import("./pages/AcervoPage"));
const MetasPage = lazy(() => import("./pages/MetasPage"));
const RankingPage = lazy(() => import("./pages/RankingPage"));
const ReaderPage = lazy(() => import("./pages/ReaderPage"));

const PROTECTED_PAGES = {
  profile: ProfilePage,
  metas: MetasPage,
  ranking: RankingPage,
  reader: ReaderPage,
};

const PAGES = {
  home: HomePage,
  acervo: AcervoPage,
  metas: MetasPage,
  ranking: RankingPage,
  login: LoginPage,
  register: RegisterPage,
  profile: ProfilePage,
  reader: ReaderPage,
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
  const [routeKey, setRouteKey] = useState(window.location.hash || "#home");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initAuth().then(() => {
      setIsInitialized(true);
    });

    const handleHashChange = () => {
      const currentHash = window.location.hash || "#home";
      const hash = currentHash.replace("#", "").split("?")[0] || "home";
      setCurrentPage(hash);
      setRouteKey(currentHash);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center text-navy">
              Carregando pagina...
            </div>
          }
        >
          <PageComponent key={routeKey} category={currentPage} />
        </Suspense>
      </main>
    </>
  );
}
