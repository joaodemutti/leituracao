import { useEffect, useState } from "react";
import { isAdminUser, logoutUser, refreshCurrentUser } from "../services/AuthService";
import { getUserStats, getBadgeLabel } from "../services/ReadingService";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await refreshCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const { data: userStats } = await getUserStats(currentUser.id);
          setStats(userStats || null);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Carregando perfil...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">Acesso restrito</h1>
          <p className="text-gray-600 mb-6">
            Voce precisa estar autenticado para acessar esta pagina.
          </p>
          <button
            onClick={() => (window.location.hash = "login")}
            className="px-6 py-2 bg-blue text-white rounded font-semibold hover:bg-blue/90"
          >
            Fazer login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="container max-w-4xl space-y-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-navy mb-2">
                Perfil
              </h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-2">@{user.username}</p>
              <p className="text-sm text-gray-500 mt-1">
                Role: <span className="font-semibold text-navy">{user.role || "user"}</span>
              </p>
              {isAdminUser(user) && (
                <button
                  onClick={() => {
                    window.location.hash = "admin";
                  }}
                  className="mt-3 px-4 py-2 bg-blue text-white rounded font-semibold hover:bg-blue/90"
                >
                  Abrir painel admin
                </button>
              )}
            </div>
            <button
              onClick={async () => {
                await logoutUser();
                window.location.hash = "home";
              }}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Sair
            </button>
          </div>
        </div>

        {stats && (
          <>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                ["Livros lidos", stats.total_books_read],
                ["XP total", stats.xp_points],
                ["Paginas", stats.total_pages_read],
                ["Minutos", stats.total_reading_minutes],
              ].map(([label, value]) => (
                <div key={label} className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-gray-600 text-sm mb-1">{label}</p>
                  <p className="text-3xl font-bold text-navy">{value || 0}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-1">Nivel atual</p>
                <p className="text-3xl font-bold text-gold">{stats.level || 1}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-1">Streak atual</p>
                <p className="text-3xl font-bold text-navy">{stats.current_streak || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-1">Melhor streak</p>
                <p className="text-3xl font-bold text-navy">{stats.best_streak || 0}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-serif font-bold text-navy mb-4">Badges</h2>
              {stats.badges?.length ? (
                <div className="flex flex-wrap gap-3">
                  {stats.badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-3 py-2 rounded-full bg-blue-soft text-blue text-sm font-semibold"
                    >
                      {getBadgeLabel(badge)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Ainda sem conquistas desbloqueadas.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
