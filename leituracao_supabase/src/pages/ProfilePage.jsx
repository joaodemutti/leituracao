import { useState, useEffect } from "react";
import { getCurrentUser, logoutUser } from "../services/AuthService";
import { getUserStats } from "../services/ReadingService";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const { data: userStats } = await getUserStats(currentUser.id);
          setStats(userStats || null);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
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
          <h1 className="text-2xl font-bold text-navy mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">
            Você precisa estar autenticado para acessar esta página.
          </p>
          <button
            onClick={() => (window.location.hash = "login")}
            className="px-6 py-2 bg-blue text-white rounded font-semibold hover:bg-blue/90"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="container max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-navy mb-2">
                Perfil
              </h1>
              <p className="text-gray-600">{user.email}</p>
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
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-2">📖</div>
              <p className="text-gray-600 text-sm mb-1">Livros Lidos</p>
              <p className="text-3xl font-bold text-navy">
                {stats.booksRead || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-gray-600 text-sm mb-1">Pontos</p>
              <p className="text-3xl font-bold text-gold">
                {stats.points || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-gray-600 text-sm mb-1">Conquistas</p>
              <p className="text-3xl font-bold text-navy">
                {stats.achievements || 0}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
