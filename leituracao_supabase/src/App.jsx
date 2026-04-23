import { Suspense, lazy, useEffect, useState } from "react";
import { initAuth, isLoggedIn, isAdminUser, refreshCurrentUser } from "./services/AuthService";
import Navbar from "./components/Navbar";
import TopBar from "./components/TopBar";
import NotFound from "./pages/NotFound";
import AppFooter from "./components/AppFooter";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const AcervoPage = lazy(() => import("./pages/AcervoPage"));
const MetasPage = lazy(() => import("./pages/MetasPage"));
const RankingPage = lazy(() => import("./pages/RankingPage"));
const ReaderPage = lazy(() => import("./pages/ReaderPage"));
const AdminCatalogPage = lazy(() => import("./pages/AdminCatalogPage"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const SuggestionsPage = lazy(() => import("./pages/SuggestionsPage"));
const ReadingLogPage = lazy(() => import("./pages/ReadingLogPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));

const PROTECTED_PAGES = {
  profile: ProfilePage,
  metas: MetasPage,
  ranking: RankingPage,
  reader: ReaderPage,
  progresso: ProgressPage,
  sugestoes: SuggestionsPage,
  "registrar-leitura": ReadingLogPage,
  quiz: QuizPage,
  admin: AdminCatalogPage,
};

const PAGES = {
  home: HomePage,
  acervo: AcervoPage,
  metas: MetasPage,
  ranking: RankingPage,
  progresso: ProgressPage,
  sugestoes: SuggestionsPage,
  "registrar-leitura": ReadingLogPage,
  quiz: QuizPage,
  login: LoginPage,
  register: RegisterPage,
  profile: ProfilePage,
  reader: ReaderPage,
  admin: AdminCatalogPage,
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
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    initAuth().then(() => {
      refreshCurrentUser().then(setCurrentUser);
      setIsInitialized(true);
    });

    const handleHashChange = async () => {
      const currentHash = window.location.hash || "#home";
      const hash = currentHash.replace("#", "").split("?")[0] || "home";
      setCurrentPage(hash);
      setRouteKey(currentHash);
      setCurrentUser(await refreshCurrentUser());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (currentPage in PROTECTED_PAGES && !isLoggedIn()) {
    window.location.hash = "login";
  }

  if (currentPage === "admin" && isLoggedIn() && currentUser && !isAdminUser(currentUser)) {
    window.location.hash = "profile";
  }

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  const PageComponent = PAGES[currentPage] || NotFound;
  const useAppShell = currentPage !== "reader";

  return (
    <>
      {useAppShell && <TopBar />}
      {useAppShell && <Navbar currentPage={currentPage} />}
      <main id="app-main" className={useAppShell ? "app-surface" : ""}>
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
      {useAppShell && <AppFooter currentPage={currentPage} />}
    </>
  );
}
