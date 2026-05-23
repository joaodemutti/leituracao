import { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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

function ProtectedRoute({ children, adminOnly = false, currentUser }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && currentUser && !isAdminUser(currentUser)) {
    return <Navigate to="/profile" replace />;
  }
  return children;
}

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    initAuth()
      .then(() => refreshCurrentUser())
      .then((user) => {
        if (isMounted) setCurrentUser(user);
      })
      .catch((error) => {
        console.error("Failed to initialize auth", error);
        if (isMounted) setCurrentUser(null);
      })
      .finally(() => {
        if (isMounted) setIsInitialized(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    refreshCurrentUser()
      .then(setCurrentUser)
      .catch((error) => {
        console.error("Failed to refresh auth user", error);
        setCurrentUser(null);
      });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  const useAppShell = location.pathname !== "/reader";

  return (
    <>
      {useAppShell && <TopBar />}
      {useAppShell && <Navbar />}
      <main id="app-main" className={useAppShell ? "app-surface" : ""}>
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center text-crimson">
              Carregando pagina...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/acervo" element={<AcervoPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/metas" element={<ProtectedRoute currentUser={currentUser}><MetasPage /></ProtectedRoute>} />
            <Route path="/progresso" element={<ProtectedRoute currentUser={currentUser}><ProgressPage /></ProtectedRoute>} />
            <Route path="/sugestoes" element={<ProtectedRoute currentUser={currentUser}><SuggestionsPage /></ProtectedRoute>} />
            <Route path="/registrar-leitura" element={<ProtectedRoute currentUser={currentUser}><ReadingLogPage /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute currentUser={currentUser}><QuizPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute currentUser={currentUser}><ProfilePage /></ProtectedRoute>} />
            <Route path="/reader" element={<ProtectedRoute currentUser={currentUser}><ReaderPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute currentUser={currentUser} adminOnly><AdminCatalogPage /></ProtectedRoute>} />
            <Route path="/educacao" element={<CategoryPage category="educacao" />} />
            <Route path="/literatura" element={<CategoryPage category="literatura" />} />
            <Route path="/ciencia" element={<CategoryPage category="ciencia" />} />
            <Route path="/historia" element={<CategoryPage category="historia" />} />
            <Route path="/sociais" element={<CategoryPage category="sociais" />} />
            <Route path="/arte" element={<CategoryPage category="arte" />} />
            <Route path="/religiao" element={<CategoryPage category="religiao" />} />
            <Route path="/filosofia" element={<CategoryPage category="filosofia" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {useAppShell && <AppFooter />}
    </>
  );
}
