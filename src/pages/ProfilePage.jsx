import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminUser, logoutUser, refreshCurrentUser } from "../services/AuthService";
import { getUserStats } from "../services/ReadingService";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const currentUser = await refreshCurrentUser();
      if (!mounted) return;
      setUser(currentUser || null);

      if (currentUser) {
        const result = await getUserStats(currentUser.id);
        if (!mounted) return;
        setStats(result.data || null);
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="page-section text-center text-[#64748b]">Carregando perfil...</div>;
  }

  if (!user) {
    return (
      <div className="page-section">
        <div className="container flex justify-center">
          <div className="panel-card max-w-[560px] px-8 py-12 text-center">
            <h1 className="font-serif text-4xl text-crimson">Acesso restrito</h1>
            <p className="mt-4 text-[#607082]">Você precisa estar autenticado para acessar esta página.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="container space-y-7">
        <section className="hero-shadow overflow-hidden rounded-[34px] bg-crimson-dark px-6 py-10 text-white md:px-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Minha conta</p>
              <h1 className="mt-3 font-serif text-5xl">{user.name || user.username}</h1>
              <p className="mt-3 text-white/70">{user.email}</p>
              <p className="mt-1 text-sm text-white/55">@{user.username}</p>
            </div>
            <div className="flex gap-3">
              {isAdminUser(user) && (
                <button
                  onClick={() => {
                    navigate("/admin");
                  }}
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-crimson"
                >
                  Abrir admin
                </button>
              )}
              <button
                onClick={async () => {
                  await logoutUser();
                  navigate("/");
                }}
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
              >
                Sair
              </button>
            </div>
          </div>
        </section>

        {stats && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Livros lidos", stats.total_books_read || 0],
              ["XP total", stats.xp_points || 0],
              ["Páginas lidas", stats.total_pages_read || 0],
              ["Melhor streak", stats.best_streak || 0],
            ].map(([label, value]) => (
              <article key={label} className="panel-card px-5 py-6">
                <p className="font-serif text-4xl text-crimson">{value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8491a1]">{label}</p>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
