import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/AuthService";
import { getProgressSnapshot } from "../services/ExperienceService";

export default function ProgressPage() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSnapshot() {
      const user = await getCurrentUser();
      if (!mounted || !user) return;

      const result = await getProgressSnapshot(user.id);
      if (!mounted) return;
      if (result.error) {
        setError(result.error);
      } else {
        setSnapshot(result.data || null);
      }
      setLoading(false);
    }

    loadSnapshot();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="page-section text-center text-[#64748b]">Carregando progresso...</div>;
  }

  if (error) {
    return <div className="page-section text-center text-red-600">{error}</div>;
  }

  const levelProgress = Math.min(100, (snapshot.totalXp % 1000) / 10);
  const days = buildRecentDays(snapshot.currentStreak);

  return (
    <div className="page-section">
      <div className="container space-y-7">
        <section className="hero-shadow overflow-hidden rounded-[34px] bg-crimson-dark px-6 py-10 text-white md:px-10">
          <div className="grid gap-6 lg:grid-cols-[180px_1fr_180px] lg:items-center">
            <div className="mx-auto flex h-[132px] w-[132px] items-center justify-center rounded-full border-4 border-secondary text-center">
              <div>
                <p className="font-serif text-5xl text-secondary">{snapshot.level}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/58">Nivel</p>
              </div>
            </div>
            <div>
              <h1 className="font-serif text-5xl">Explorador Literário</h1>
              <p className="mt-3 text-white/70">
                Você está no caminho certo. Mais {1000 - (snapshot.totalXp % 1000)} XP para o próximo nível.
              </p>
              <div className="mt-5 h-2.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-secondary" style={{ width: `${levelProgress}%` }} />
              </div>
              <p className="mt-2 text-sm text-white/60">{snapshot.totalXp} XP acumulado</p>
            </div>
            <div className="text-center lg:text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Total de XP</p>
              <p className="mt-2 font-serif text-5xl text-secondary">{snapshot.totalXp}</p>
            </div>
          </div>
        </section>

        <section className="panel-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Sequencia atual</p>
              <h2 className="mt-3 font-serif text-4xl text-crimson">{snapshot.currentStreak} dias seguidos</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#728093]">Recorde pessoal</p>
              <p className="mt-1 font-serif text-3xl text-crimson">{snapshot.bestStreak} dias</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            {days.map((day, index) => (
              <div key={`${day.label}-${index}`} className="text-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${day.active ? "bg-crimson text-white" : "bg-[#efe7d8] text-[#7c8795]"}`}>
                  {day.label}
                </div>
                <p className="mt-2 text-xs text-[#7a8898]">{day.number}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Livros lidos", snapshot.totalBooksRead],
            ["Páginas lidas", snapshot.totalPagesRead],
            ["Streak atual", snapshot.currentStreak],
            ["Quizzes concluídos", snapshot.quizSummary?.sessionsCount || 0],
          ].map(([label, value]) => (
            <article key={label} className="panel-card px-5 py-6">
              <p className="font-serif text-4xl text-crimson">{value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8491a1]">{label}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="panel-card p-6">
            <h2 className="font-serif text-4xl text-crimson">Conquistas</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {snapshot.achievements.map((achievement) => (
                <article key={achievement.achievement_id || achievement.id} className="rounded-[22px] border border-[#eee6da] bg-[#fcfaf5] px-4 py-4">
                  <p className="text-2xl">{achievement.icon || "*"}</p>
                  <p className="mt-2 font-semibold text-crimson">{achievement.title}</p>
                  <p className="mt-2 text-sm text-[#667486]">{achievement.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[#8491a1]">
                    {achievement.earned_at?.split?.("T")?.[0] || "Conquista ativa"}
                  </p>
                </article>
              ))}
            </div>
          </article>

          <article className="panel-card p-6">
            <h2 className="font-serif text-4xl text-crimson">Historico de XP</h2>
            <div className="mt-5 space-y-3">
              {snapshot.timeline.map((session) => (
                <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-[#fbf8f2] px-4 py-4">
                  <div>
                    <p className="font-semibold text-crimson">
                      {session.book?.title || "Sessão de leitura"} - {session.pages} páginas
                    </p>
                    <p className="text-sm text-[#657385]">{session.date}</p>
                  </div>
                  <p className="font-semibold text-[#198754]">+{session.xp} XP</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

function buildRecentDays(currentStreak) {
  const today = new Date();
  const labels = ["D", "S", "T", "Q", "Q", "S", "S"];

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      label: labels[date.getDay()],
      number: String(date.getDate()).padStart(2, "0"),
      active: index >= Math.max(0, 7 - currentStreak),
    };
  });
}
