import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/AuthService";
import { createReadingGoal, getGoalProgress, getGoalSummary } from "../services/GoalsService";

const INITIAL_FORM = {
  title: "",
  goalType: "monthly",
  metricType: "books",
  targetValue: 1,
  rewardXp: 100,
  periodStart: new Date().toISOString().split("T")[0],
  periodEnd: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
};

export default function MetasPage() {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadGoals() {
      const currentUser = await getCurrentUser();
      if (!mounted) return;
      setUser(currentUser || null);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const [goalsResult, summaryResult] = await Promise.all([
        getGoalProgress(currentUser.id),
        getGoalSummary(currentUser.id),
      ]);

      if (!mounted) return;
      setGoals(goalsResult.data || []);
      setSummary(summaryResult.data || null);
      setError(goalsResult.error || "");
      setLoading(false);
    }

    loadGoals();

    return () => {
      mounted = false;
    };
  }, []);

  async function reloadGoals() {
    if (!user) return;

    const [goalsResult, summaryResult] = await Promise.all([
      getGoalProgress(user.id),
      getGoalSummary(user.id),
    ]);

    if (goalsResult.error) {
      setError(goalsResult.error);
      return;
    }

    setGoals(goalsResult.data || []);
    setSummary(summaryResult.data || null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user) return;

    const result = await createReadingGoal(user.id, form);
    if (result.error) {
      setError(result.error);
      return;
    }

    setForm(INITIAL_FORM);
    setShowForm(false);
    await reloadGoals();
  }

  const activeGoals = goals.filter((goal) => goal.status === "active");
  const completedGoals = goals.filter((goal) => goal.status === "completed");

  return (
    <div className="page-section">
      <div className="container space-y-7">
        <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Minha jornada</p>
            <h1 className="mt-3 font-serif text-5xl text-crimson">Metas de leitura</h1>
          </div>
          <button
            onClick={() => setShowForm((value) => !value)}
            className="rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-white"
          >
            {showForm ? "Fechar formulario" : "+ Nova meta"}
          </button>
        </section>

        {error && <div className="rounded-[20px] border border-[#f2d2d2] bg-[#fff4f4] px-4 py-3 text-sm text-[#a33d3d]">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="panel-card grid gap-4 p-6 md:grid-cols-2">
            <label className="text-sm font-medium text-crimson">
              Titulo
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
                required
              />
            </label>
            <label className="text-sm font-medium text-crimson">
              Tipo
              <select
                value={form.goalType}
                onChange={(event) => setForm((current) => ({ ...current, goalType: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
              >
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="annual">Anual</option>
                <option value="custom">Personalizada</option>
              </select>
            </label>
            <label className="text-sm font-medium text-crimson">
              Medida
              <select
                value={form.metricType}
                onChange={(event) => setForm((current) => ({ ...current, metricType: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
              >
                <option value="books">Livros</option>
                <option value="pages">Paginas</option>
                <option value="minutes">Minutos</option>
                <option value="streak">Streak</option>
              </select>
            </label>
            <label className="text-sm font-medium text-crimson">
              Meta alvo
              <input
                type="number"
                min="1"
                value={form.targetValue}
                onChange={(event) => setForm((current) => ({ ...current, targetValue: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-crimson">
              Inicio
              <input
                type="date"
                value={form.periodStart}
                onChange={(event) => setForm((current) => ({ ...current, periodStart: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-crimson">
              Fim
              <input
                type="date"
                value={form.periodEnd}
                onChange={(event) => setForm((current) => ({ ...current, periodEnd: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-crimson md:col-span-2">
              Recompensa XP
              <input
                type="number"
                min="0"
                value={form.rewardXp}
                onChange={(event) => setForm((current) => ({ ...current, rewardXp: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
              />
            </label>
            <button className="rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-white md:col-span-2">
              Salvar meta
            </button>
          </form>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["Ativas", summary?.activeCount || 0],
            ["Concluidas", summary?.completedCount || 0],
            ["Taxa de sucesso", `${summary?.successRate || 0}%`],
          ].map(([label, value]) => (
            <article key={label} className="panel-card px-4 py-6 text-center">
              <p className="font-serif text-4xl text-crimson">{value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8491a1]">{label}</p>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          {loading && <p className="text-center text-[#64748b]">Carregando metas...</p>}
          {!loading && activeGoals.length === 0 && (
            <div className="panel-card px-6 py-10 text-center text-[#607082]">Nenhuma meta ativa no momento.</div>
          )}
          {activeGoals.map((goal) => (
            <article key={goal.id} className="panel-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="inline-flex rounded-full bg-secondary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                    {goal.goal_type}
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold text-crimson">{goal.title}</h2>
                  <p className="mt-1 text-sm text-[#687789]">
                    {goal.current_value} de {goal.target_value} {goal.metric_type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-4xl text-secondary">{goal.progress_percentage}%</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#8391a1]">progresso</p>
                </div>
              </div>
              <div className="mt-5 h-2.5 rounded-full bg-[#eee7d9]">
                <div className="h-full rounded-full bg-secondary" style={{ width: `${goal.progress_percentage}%` }} />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#687789]">
                <span>Ate {goal.period_end}</span>
                <span className="rounded-full bg-[#fff4cf] px-3 py-1 font-semibold text-[#8d6618]">+{goal.reward_xp} XP</span>
              </div>
            </article>
          ))}
          {!loading && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full rounded-[22px] border border-dashed border-[#d7ccbc] px-6 py-5 text-center text-sm font-medium text-[#687789]"
            >
              + Adicionar nova meta de leitura
            </button>
          )}
        </section>

        <section className="panel-card p-6">
          <h2 className="font-serif text-4xl text-crimson">Metas concluidas</h2>
          <div className="mt-5 space-y-3">
            {completedGoals.length === 0 && <p className="text-[#64748b]">Voce ainda nao concluiu nenhuma meta.</p>}
            {completedGoals.map((goal) => (
              <article key={goal.id} className="rounded-[22px] bg-[#e9fff1] px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-crimson">{goal.title}</p>
                    <p className="text-sm text-[#5d6979]">Concluida em {goal.completed_at?.split("T")[0]}</p>
                  </div>
                  <span className="rounded-full bg-[#fff3c6] px-3 py-1 text-sm font-semibold text-[#8d6618]">+{goal.reward_xp} XP</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
