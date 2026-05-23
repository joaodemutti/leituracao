import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/AuthService";
import { searchBooks } from "../services/CatalogService";
import {
  calculateReadingXpPreview,
  getCurrentReadingLogContext,
  registerManualReading,
} from "../services/ExperienceService";

const MOODS = [
  { id: "cansativo", label: "Cansativo" },
  { id: "ok", label: "Ok" },
  { id: "bom", label: "Bom" },
  { id: "incrivel", label: "Incrivel" },
];

export default function ReadingLogPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentReading, setCurrentReading] = useState(null);
  const [streakActive, setStreakActive] = useState(false);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isChangingBook, setIsChangingBook] = useState(false);
  const [form, setForm] = useState({
    startPage: 1,
    endPage: 20,
    minutesSpent: 20,
    mood: "bom",
    note: "",
    sessionDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const currentUser = await getCurrentUser();
      if (!mounted) return;
      setUser(currentUser || null);

      if (currentUser) {
        const contextResult = await getCurrentReadingLogContext(currentUser.id);
        if (!mounted) return;

        setHistory(contextResult.data?.history || []);
        setCurrentReading(contextResult.data?.currentReading || null);
        setStreakActive((contextResult.data?.stats?.current_streak || 0) > 0);

        if (contextResult.data?.currentReading?.book) {
          const reading = contextResult.data.currentReading;
          setSelectedBook({
            id: reading.book_id,
            title: reading.book.title,
            author: reading.book.author,
            emoji: reading.book.emoji,
            totalPages: reading.estimated_pages,
          });
          setQuery(reading.book.title);
          setForm((current) => ({
            ...current,
            startPage: reading.current_page || current.startPage,
            endPage: Math.max(reading.current_page || current.startPage, current.endPage),
          }));
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!query.trim() || !isChangingBook) {
      setResults([]);
      return undefined;
    }

    let mounted = true;
    const timer = setTimeout(async () => {
      const result = await searchBooks(query);
      if (!mounted) return;
      setResults(result.data || []);
    }, 180);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [query, isChangingBook]);

  const xpPreview = calculateReadingXpPreview({
    startPage: form.startPage,
    endPage: form.endPage,
    mood: form.mood,
    streakActive,
  });

  async function refreshContext(userId) {
    const contextResult = await getCurrentReadingLogContext(userId);
    setHistory(contextResult.data?.history || []);
    setCurrentReading(contextResult.data?.currentReading || null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user || !selectedBook) return;

    const result = await registerManualReading(user.id, {
      ...form,
      bookId: selectedBook.id,
      streakActive,
    });

    if (result.error) {
      setFeedback({ type: "error", message: result.error });
      return;
    }

    setFeedback({
      type: "success",
      message: `Leitura registrada com sucesso. +${result.data.xpEarned} XP`,
    });

    await refreshContext(user.id);
  }

  return (
    <div className="page-section">
      <div className="container grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="panel-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Nova entrada</p>
          <h1 className="mt-3 font-serif text-5xl text-crimson">Registrar leitura</h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-crimson">Buscar livro</label>
              <div className="mt-2 flex gap-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="flex-1 rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
                  placeholder="Digite o titulo ou autor..."
                />
                <button
                  type="button"
                  onClick={() => setIsChangingBook((value) => !value)}
                  className="rounded-2xl bg-crimson px-5 py-3 text-sm font-semibold text-white"
                >
                  Buscar
                </button>
              </div>

              {(results.length > 0 || isChangingBook) && (
                <div className="mt-3 overflow-hidden rounded-[24px] border border-[#e8dfcf] bg-white">
                  {results.slice(0, 5).map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => {
                        setSelectedBook(book);
                        setQuery(book.title);
                        setResults([]);
                        setIsChangingBook(false);
                      }}
                      className="flex w-full items-center gap-4 border-b border-[#f0ebdf] px-4 py-3 text-left last:border-b-0 hover:bg-[#fbf8f2]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#eef4ff] text-2xl">
                        {book.emoji || "Livro"}
                      </div>
                      <div>
                        <p className="font-semibold text-crimson">{book.title}</p>
                        <p className="text-sm text-[#6d7b8d]">{book.author}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedBook && (
              <div className="rounded-[26px] border border-[#e8dfcf] bg-[#fbf8f2] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#eef4ff] text-2xl">
                      {selectedBook.emoji || currentReading?.book?.emoji || "Livro"}
                    </div>
                    <div>
                      <p className="font-semibold text-crimson">{selectedBook.title}</p>
                      <p className="text-sm text-[#6d7b8d]">{selectedBook.author}</p>
                      {currentReading?.book_id === selectedBook.id && (
                        <p className="mt-1 text-sm font-medium text-secondary">Leitura atual</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChangingBook(true)}
                    className="rounded-full border border-[#ddd5c8] px-4 py-2 text-sm font-medium text-[#687789]"
                  >
                    Trocar
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-crimson">
                Pagina inicial
                <input
                  type="number"
                  min="0"
                  value={form.startPage}
                  onChange={(event) => setForm((current) => ({ ...current, startPage: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
                />
              </label>
              <label className="text-sm font-medium text-crimson">
                Pagina final
                <input
                  type="number"
                  min={form.startPage}
                  value={form.endPage}
                  onChange={(event) => setForm((current) => ({ ...current, endPage: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-crimson">
              Como foi essa leitura?
              <div className="mt-3 flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, mood: mood.id }))}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      form.mood === mood.id ? "bg-crimson text-white" : "bg-[#f4efe7] text-[#566477]"
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </label>

            <label className="block text-sm font-medium text-crimson">
              Notas
              <textarea
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                className="mt-2 h-28 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
                placeholder="O que voce achou dessa parte?"
              />
            </label>

            <div className="rounded-[26px] bg-crimson px-5 py-5 text-white">
              <p className="font-semibold">Voce vai ganhar pontos</p>
              <p className="mt-2 text-white/72">
                {xpPreview.pagesDelta} paginas lidas - humor {form.mood}
              </p>
              <div className="mt-3 space-y-1 text-sm text-white/72">
                <p>{xpPreview.baseXp} XP por paginas</p>
                <p>{xpPreview.moodBonus} XP bonus de humor</p>
                <p>{xpPreview.streakBonus} XP bonus de sequencia</p>
              </div>
              <p className="mt-3 font-serif text-4xl text-secondary">+{xpPreview.totalXp} XP</p>
            </div>

            {feedback && (
              <div
                className={`rounded-[20px] px-4 py-3 text-sm ${
                  feedback.type === "success" ? "bg-[#eefbf1] text-[#1f7a42]" : "bg-[#fff4f4] text-[#a33d3d]"
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  navigate("/home");
                }}
                className="rounded-full border border-[#d7cebf] px-5 py-3 text-sm font-semibold text-crimson"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedBook}
                className="rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-white disabled:opacity-55"
              >
                Registrar leitura
              </button>
            </div>
          </form>
        </section>

        <aside className="panel-card p-6">
          <h2 className="font-serif text-4xl text-crimson">Historico recente</h2>
          <div className="mt-5 space-y-3">
            {history.length === 0 && (
              <p className="rounded-[22px] bg-[#fbf8f2] px-4 py-4 text-sm text-[#687789]">
                Suas ultimas leituras aparecerao aqui assim que voce registrar a primeira sessao.
              </p>
            )}
            {history.map((entry) => (
              <article key={entry.id} className="rounded-[22px] bg-[#fbf8f2] px-4 py-4">
                <p className="font-semibold text-crimson">{entry.book?.title}</p>
                <p className="text-sm text-[#687789]">
                  Pag. {entry.startPage || 0} - {entry.endPage || 0} - {entry.date}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#8d6618]">+{entry.xp} XP</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
