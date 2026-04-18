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
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const [goalsResult, summaryResult] = await Promise.all([
        getGoalProgress(currentUser.id),
        getGoalSummary(currentUser.id),
      ]);

      if (!mounted) return;
      if (goalsResult.error) setError(goalsResult.error);
      setGoals(goalsResult.data || []);
      setSummary(summaryResult.data || null);
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

  if (loading) {
    return <div className="p-8 text-center">Carregando metas...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f9f7f2]">
      <div className="container max-w-3xl py-8 md:py-10 px-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700 mb-2">
          Minha jornada
        </p>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy">
            Metas de leitura
          </h1>
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="shrink-0 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-light transition-colors"
          >
            {showForm ? "Fechar" : "+ Nova meta"}
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-[#e8e4db] bg-white p-5 shadow-sm mb-8 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-gray-700">
              Titulo
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
            </label>
            <label className="text-sm text-gray-700">
              Tipo
              <select
                value={form.goalType}
                onChange={(event) => setForm((current) => ({ ...current, goalType: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="annual">Anual</option>
                <option value="custom">Customizada</option>
              </select>
            </label>
            <label className="text-sm text-gray-700">
              Medida
              <select
                value={form.metricType}
                onChange={(event) => setForm((current) => ({ ...current, metricType: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="books">Livros</option>
                <option value="pages">Paginas</option>
                <option value="minutes">Minutos</option>
                <option value="streak">Streak</option>
              </select>
            </label>
            <label className="text-sm text-gray-700">
              Meta alvo
              <input
                type="number"
                min="1"
                value={form.targetValue}
                onChange={(event) => setForm((current) => ({ ...current, targetValue: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="text-sm text-gray-700">
              Inicio
              <input
                type="date"
                value={form.periodStart}
                onChange={(event) => setForm((current) => ({ ...current, periodStart: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="text-sm text-gray-700">
              Fim
              <input
                type="date"
                value={form.periodEnd}
                onChange={(event) => setForm((current) => ({ ...current, periodEnd: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="text-sm text-gray-700 md:col-span-2">
              Recompensa XP
              <input
                type="number"
                min="0"
                value={form.rewardXp}
                onChange={(event) => setForm((current) => ({ ...current, rewardXp: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <button className="md:col-span-2 rounded-lg bg-blue text-white font-semibold px-4 py-2">
              Salvar meta
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[
            { label: "Ativas", value: summary?.activeCount || 0, sub: "ativas" },
            { label: "Concluidas", value: summary?.completedCount || 0, sub: "concluidas" },
            { label: "Taxa de sucesso", value: `${summary?.successRate || 0}%`, sub: "taxa de sucesso" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[#e8e4db] bg-white px-4 py-4 text-center shadow-xs"
            >
              <p className="font-serif text-2xl font-bold text-navy tabular-nums">
                {stat.value}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4 mb-12">
          {activeGoals.length ? activeGoals.map((goal) => (
            <article
              key={goal.id}
              className="rounded-xl border border-[#e8e4db] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold bg-blue-soft text-blue border-blue/20">
                  {goal.goal_type}
                </span>
              </div>
              <h2 className="font-semibold text-navy text-lg leading-tight">{goal.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {goal.current_value} de {goal.target_value} {goal.metric_type}
              </p>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all bg-[#c5a059]"
                      style={{ width: `${goal.progress_percentage}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-gray-600">
                    <span>{goal.progress_percentage}% concluido</span>
                    <span className="text-gray-500">Ate {goal.period_end}</span>
                  </div>
                </div>
                <span className="text-lg font-serif font-bold text-navy tabular-nums shrink-0">
                  +{goal.reward_xp} XP
                </span>
              </div>
            </article>
          )) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white/70 py-10 text-center text-gray-500">
              Nenhuma meta ativa no momento.
            </div>
          )}
        </div>

        <h2 className="font-serif text-2xl font-bold text-navy mb-4">Metas concluidas</h2>
        <ul className="space-y-3">
          {completedGoals.length ? completedGoals.map((goal) => (
            <li
              key={goal.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-emerald-50/90 border border-emerald-100 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-navy text-sm">{goal.title}</p>
                <p className="text-xs text-gray-600">Concluida em {goal.completed_at?.split("T")[0]}</p>
              </div>
              <span className="self-start sm:self-center rounded-full bg-gold-light border border-gold/40 px-3 py-1 text-xs font-bold text-amber-900 tabular-nums">
                +{goal.reward_xp} XP
              </span>
            </li>
          )) : (
            <li className="text-gray-500">Voce ainda nao concluiu nenhuma meta.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
