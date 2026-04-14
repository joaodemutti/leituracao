const activeGoals = [
  {
    id: 1,
    tag: "Mensal",
    tagClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    barClass: "bg-[#c5a059]",
    title: "Ler 4 livros em abril",
    detail: "Meta mensal · até 30 de abril",
    current: "3 de 4 livros",
    remaining: "12 dias restantes",
    percent: 75,
  },
  {
    id: 2,
    tag: "Diário",
    tagClass: "bg-blue-soft text-blue border-blue/20",
    barClass: "bg-blue",
    title: "Ler 20 páginas por dia",
    detail: "Sequência de leitura diária",
    current: "18 páginas hoje",
    remaining: "Meta quase batida",
    percent: 90,
  },
  {
    id: 3,
    tag: "Anual",
    tagClass: "bg-violet-100 text-violet-800 border-violet-200",
    barClass: "bg-violet-600",
    title: "Ler 24 livros em 2026",
    detail: "Acompanhe seu ano literário",
    current: "8 de 24 livros",
    remaining: "8 meses restantes",
    percent: 33,
  },
];

const completedGoals = [
  { title: "Ler 3 livros em março", date: "31/03/2026", xp: 200 },
  { title: "Completar 1 quiz por semana (fevereiro)", date: "28/02/2026", xp: 150 },
  { title: "Sequência de 7 dias", date: "15/02/2026", xp: 100 },
];

export default function MetasPage() {
  return (
    <div className="min-h-screen bg-[#f9f7f2]">
      <div className="container max-w-3xl py-8 md:py-10 px-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700 mb-2">
          Minha jornada
        </p>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy">
            Metas de Leitura
          </h1>
          <button
            type="button"
            className="shrink-0 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-light transition-colors"
          >
            + Nova meta
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[
            { label: "Ativas", value: "3", sub: "ativas" },
            { label: "Concluídas", value: "5", sub: "concluídas" },
            { label: "Taxa de sucesso", value: "68%", sub: "taxa de sucesso" },
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

        <div className="space-y-4 mb-6">
          {activeGoals.map((goal) => (
            <article
              key={goal.id}
              className="rounded-xl border border-[#e8e4db] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${goal.tagClass}`}
                >
                  {goal.tag}
                </span>
              </div>
              <h2 className="font-semibold text-navy text-lg leading-tight">
                {goal.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{goal.detail}</p>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${goal.barClass}`}
                      style={{ width: `${goal.percent}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-gray-600">
                    <span>{goal.current}</span>
                    <span className="text-gray-500">{goal.remaining}</span>
                  </div>
                </div>
                <span className="text-lg font-serif font-bold text-navy tabular-nums shrink-0">
                  {goal.percent}%
                </span>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-white/50 py-10 text-sm font-medium text-gray-500 hover:border-navy/30 hover:bg-white hover:text-navy transition-colors mb-12"
        >
          + Adicionar nova meta de leitura
        </button>

        <h2 className="font-serif text-2xl font-bold text-navy mb-4">
          Metas concluídas
        </h2>
        <ul className="space-y-3">
          {completedGoals.map((g) => (
            <li
              key={g.title}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-emerald-50/90 border border-emerald-100 px-4 py-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white text-sm"
                  aria-hidden
                >
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-navy text-sm">{g.title}</p>
                  <p className="text-xs text-gray-600">Concluída em {g.date}</p>
                </div>
              </div>
              <span className="self-start sm:self-center rounded-full bg-gold-light border border-gold/40 px-3 py-1 text-xs font-bold text-amber-900 tabular-nums">
                +{g.xp} XP
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
