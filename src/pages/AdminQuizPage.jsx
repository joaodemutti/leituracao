import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser, isAdminUser } from "../services/AuthService";
import {
  createOption,
  createQuestion,
  createQuizSet,
  deleteOption,
  deleteQuestion,
  deleteQuizSet,
  listAdminOptions,
  listAdminQuestions,
  listAdminQuizSets,
  listBooksForSelector,
  markOptionCorrect,
  updateOption,
  updateQuestion,
  updateQuizSet,
} from "../services/QuizAdminService";

const EMPTY_SET_FORM = {
  slug: "",
  title: "",
  description: "",
  source_book_id: "",
  is_active: true,
};

const EMPTY_QUESTION_FORM = {
  id: "",
  quiz_set_id: "",
  prompt: "",
  explanation: "",
  question_order: 1,
  time_limit_seconds: 28,
  xp_reward: 50,
};

const EMPTY_OPTION_FORM = {
  id: "",
  question_id: "",
  option_text: "",
  option_order: 1,
};

function normalizeText(value) {
  const trimmed = (value || "").trim();
  return trimmed ? trimmed : null;
}

function normalizeInteger(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function mapSetToForm(set) {
  return {
    id: set.id,
    slug: set.slug || "",
    title: set.title || "",
    description: set.description || "",
    source_book_id: set.source_book_id || "",
    is_active: set.is_active ?? true,
  };
}

function mapQuestionToForm(question) {
  return {
    id: question.id,
    quiz_set_id: question.quiz_set_id,
    prompt: question.prompt || "",
    explanation: question.explanation || "",
    question_order: question.question_order ?? 1,
    time_limit_seconds: question.time_limit_seconds ?? 28,
    xp_reward: question.xp_reward ?? 50,
  };
}

function mapOptionToForm(option) {
  return {
    id: option.id,
    question_id: option.question_id,
    option_text: option.option_text || "",
    option_order: option.option_order ?? 1,
  };
}

function buildSetPayload(form) {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    description: normalizeText(form.description),
    source_book_id: form.source_book_id || null,
    is_active: Boolean(form.is_active),
  };
}

function buildQuestionPayload(form, quizSetId) {
  return {
    quiz_set_id: quizSetId,
    prompt: form.prompt.trim(),
    explanation: normalizeText(form.explanation),
    question_order: normalizeInteger(form.question_order) ?? 1,
    time_limit_seconds: normalizeInteger(form.time_limit_seconds) ?? 28,
    xp_reward: normalizeInteger(form.xp_reward) ?? 50,
  };
}

export default function AdminQuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const adminQuery = useMemo(
    () => ({
      setId: searchParams.get("set") || "",
      questionId: searchParams.get("question") || "",
    }),
    [searchParams],
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quizSets, setQuizSets] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [setForm, setSetForm] = useState(EMPTY_SET_FORM);
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION_FORM);
  const [optionForm, setOptionForm] = useState(EMPTY_OPTION_FORM);
  const [isCreatingSet, setIsCreatingSet] = useState(true);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(true);
  const [isCreatingOption, setIsCreatingOption] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOptions = useCallback(async (questionId) => {
    if (!questionId) {
      setOptions([]);
      setOptionForm(EMPTY_OPTION_FORM);
      setIsCreatingOption(true);
      return;
    }
    const result = await listAdminOptions(questionId);
    if (result.error) {
      setError(result.error);
      return;
    }
    const data = result.data || [];
    setOptions(data);
    setOptionForm({
      ...EMPTY_OPTION_FORM,
      question_id: questionId,
      option_order: data.length + 1,
    });
    setIsCreatingOption(true);
  }, []);

  const loadQuestions = useCallback(async (setId) => {
    if (!setId) {
      setQuestions([]);
      return [];
    }
    const result = await listAdminQuestions(setId);
    if (result.error) {
      setError(result.error);
      return [];
    }
    const data = result.data || [];
    setQuestions(data);
    return data;
  }, []);

  const loadQuizSets = useCallback(async (nextSelectedSetId) => {
    const result = await listAdminQuizSets();
    if (result.error) {
      setError(result.error);
      return null;
    }
    const nextSets = result.data || [];
    setQuizSets(nextSets);

    const resolvedSetId =
      nextSelectedSetId && nextSets.some((s) => s.id === nextSelectedSetId)
        ? nextSelectedSetId
        : nextSets[0]?.id || "";

    setSelectedSetId(resolvedSetId);

    if (!resolvedSetId) {
      setSetForm(EMPTY_SET_FORM);
      setIsCreatingSet(true);
      return null;
    }

    const selectedSet = nextSets.find((s) => s.id === resolvedSetId);
    if (selectedSet) {
      setSetForm(mapSetToForm(selectedSet));
      setIsCreatingSet(false);
    }

    return resolvedSetId;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      setLoading(true);
      setError("");

      const currentUser = await getCurrentUser();
      if (!mounted) return;

      setUser(currentUser);

      if (!isAdminUser(currentUser)) {
        setLoading(false);
        return;
      }

      const [setsResult, booksResult] = await Promise.all([
        listAdminQuizSets(),
        listBooksForSelector(),
      ]);

      if (!mounted) return;

      if (booksResult.data) setAllBooks(booksResult.data);

      if (setsResult.error) {
        setError(setsResult.error);
        setLoading(false);
        return;
      }

      const nextSets = setsResult.data || [];
      setQuizSets(nextSets);

      const resolvedSetId =
        adminQuery.setId && nextSets.some((s) => s.id === adminQuery.setId)
          ? adminQuery.setId
          : nextSets[0]?.id || "";

      setSelectedSetId(resolvedSetId);

      if (resolvedSetId) {
        const selectedSet = nextSets.find((s) => s.id === resolvedSetId);
        if (selectedSet) {
          setSetForm(mapSetToForm(selectedSet));
          setIsCreatingSet(false);
        }

        const nextQuestions = await loadQuestions(resolvedSetId);
        if (!mounted) return;

        if (adminQuery.questionId) {
          const selectedQuestion = nextQuestions.find(
            (q) => q.id === adminQuery.questionId,
          );
          if (selectedQuestion) {
            setQuestionForm(mapQuestionToForm(selectedQuestion));
            setIsCreatingQuestion(false);
            await loadOptions(selectedQuestion.id);
          } else {
            setQuestionForm({
              ...EMPTY_QUESTION_FORM,
              quiz_set_id: resolvedSetId,
              question_order: nextQuestions.length + 1,
            });
          }
        } else {
          setQuestionForm({
            ...EMPTY_QUESTION_FORM,
            quiz_set_id: resolvedSetId,
            question_order: nextQuestions.length + 1,
          });
        }
      }

      if (!mounted) return;
      setLoading(false);
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [adminQuery.setId, adminQuery.questionId, loadQuestions, loadOptions]);

  async function handleSelectSet(setId) {
    const selectedSet = quizSets.find((s) => s.id === setId);
    if (selectedSet) {
      setSetForm(mapSetToForm(selectedSet));
      setIsCreatingSet(false);
    }
    setSelectedSetId(setId);
    setError("");
    setNotice("");

    const nextQuestions = await loadQuestions(setId);
    setQuestionForm({
      ...EMPTY_QUESTION_FORM,
      quiz_set_id: setId,
      question_order: nextQuestions.length + 1,
    });
    setIsCreatingQuestion(true);
    setOptions([]);
    setOptionForm(EMPTY_OPTION_FORM);
    setIsCreatingOption(true);
  }

  async function handleSetSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    if (!setForm.slug.trim() || !setForm.title.trim()) {
      setError("Preencha slug e titulo do quiz.");
      setSaving(false);
      return;
    }

    const payload = buildSetPayload(setForm);
    const isNew = isCreatingSet;
    const result = isNew
      ? await createQuizSet(payload)
      : await updateQuizSet(setForm.id, payload);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    const nextSetId = result.data?.id || setForm.id;
    await loadQuizSets(nextSetId);
    const nextQuestions = await loadQuestions(nextSetId);
    setQuestionForm({
      ...EMPTY_QUESTION_FORM,
      quiz_set_id: nextSetId,
      question_order: nextQuestions.length + 1,
    });
    setIsCreatingQuestion(true);
    setOptions([]);
    setOptionForm(EMPTY_OPTION_FORM);
    setIsCreatingOption(true);
    setNotice(isNew ? "Quiz criado." : "Quiz atualizado.");
    setSaving(false);
  }

  async function handleDeleteSet() {
    if (!selectedSetId) return;
    if (!window.confirm("Excluir este quiz e todas as perguntas e opcoes?")) return;

    setSaving(true);
    setError("");
    setNotice("");

    const result = await deleteQuizSet(selectedSetId);
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    const nextSetId = await loadQuizSets();
    await loadQuestions(nextSetId || "");
    setQuestionForm(EMPTY_QUESTION_FORM);
    setIsCreatingQuestion(true);
    setOptions([]);
    setOptionForm(EMPTY_OPTION_FORM);
    setIsCreatingOption(true);
    setNotice("Quiz excluido.");
    setSaving(false);
  }

  async function handleSelectQuestion(question) {
    setQuestionForm(mapQuestionToForm(question));
    setIsCreatingQuestion(false);
    setError("");
    setNotice("");
    await loadOptions(question.id);
  }

  async function handleQuestionSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    if (!selectedSetId || !questionForm.prompt.trim()) {
      setError("Selecione um quiz e escreva o enunciado da pergunta.");
      setSaving(false);
      return;
    }

    const payload = buildQuestionPayload(questionForm, selectedSetId);
    const isNew = isCreatingQuestion;
    const result = isNew
      ? await createQuestion(payload)
      : await updateQuestion(questionForm.id, payload);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    if (result.data) {
      setQuestionForm(mapQuestionToForm(result.data));
      setIsCreatingQuestion(false);
    }

    await loadQuestions(selectedSetId);

    if (isNew && result.data) {
      await loadOptions(result.data.id);
    }

    setNotice(isNew ? "Pergunta criada." : "Pergunta atualizada.");
    setSaving(false);
  }

  async function handleDeleteQuestion(questionId) {
    if (!window.confirm("Excluir esta pergunta e suas opcoes?")) return;

    setSaving(true);
    setError("");
    setNotice("");

    const result = await deleteQuestion(questionId);
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    const updatedQuestions = await loadQuestions(selectedSetId);
    setQuestionForm({
      ...EMPTY_QUESTION_FORM,
      quiz_set_id: selectedSetId,
      question_order: updatedQuestions.length + 1,
    });
    setIsCreatingQuestion(true);
    setOptions([]);
    setOptionForm(EMPTY_OPTION_FORM);
    setIsCreatingOption(true);
    setNotice("Pergunta excluida.");
    setSaving(false);
  }

  async function handleOptionSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const currentQuestionId = questionForm.id;
    if (!currentQuestionId || !optionForm.option_text.trim()) {
      setError("Escreva o texto da opcao.");
      setSaving(false);
      return;
    }

    const isNew = isCreatingOption;
    let result;

    if (isNew) {
      result = await createOption({
        question_id: currentQuestionId,
        option_text: optionForm.option_text.trim(),
        option_order: normalizeInteger(optionForm.option_order) ?? 1,
        is_correct: false,
      });
    } else {
      result = await updateOption(optionForm.id, {
        option_text: optionForm.option_text.trim(),
        option_order: normalizeInteger(optionForm.option_order) ?? 1,
      });
    }

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    await loadOptions(currentQuestionId);
    setNotice(isNew ? "Opcao criada." : "Opcao atualizada.");
    setSaving(false);
  }

  async function handleDeleteOption(optionId) {
    if (!window.confirm("Excluir esta opcao?")) return;

    setSaving(true);
    setError("");
    setNotice("");

    const result = await deleteOption(optionId);
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    await loadOptions(questionForm.id);
    setNotice("Opcao excluida.");
    setSaving(false);
  }

  async function handleMarkCorrect(optionId) {
    setSaving(true);
    setError("");
    setNotice("");

    const result = await markOptionCorrect(questionForm.id, optionId);
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    await loadOptions(questionForm.id);
    setNotice("Opcao marcada como correta.");
    setSaving(false);
  }

  if (loading) {
    return <div className="p-8 text-center">Carregando painel...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-crimson mb-4">Acesso restrito</h1>
          <p className="text-gray-600 mb-6">
            Voce precisa estar autenticado para acessar esta pagina.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-secondary text-white rounded font-semibold hover:bg-secondary/90"
          >
            Fazer login
          </button>
        </div>
      </div>
    );
  }

  if (!isAdminUser(user)) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-lg px-4">
          <h1 className="text-2xl font-bold text-crimson mb-4">Acesso restrito</h1>
          <p className="text-gray-600 mb-6">
            Esta area exige a role `admin` no usuario autenticado.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-2 bg-secondary text-white rounded font-semibold hover:bg-secondary/90"
          >
            Voltar ao perfil
          </button>
        </div>
      </div>
    );
  }

  const canEditOptions = !isCreatingQuestion && Boolean(questionForm.id);

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="container max-w-7xl space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary mb-2">
                Admin
              </p>
              <h1 className="text-3xl font-serif font-bold text-crimson">
                Gestao de quizzes
              </h1>
              <p className="text-gray-600 mt-2">
                Edite quizzes, perguntas e opcoes de resposta.
              </p>
            </div>
            <Link
              to="/admin"
              className="mt-1 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors whitespace-nowrap"
            >
              ← Catalogo
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar: Quiz Sets */}
          <aside className="bg-white rounded-lg shadow-md p-4 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-crimson">Quizzes</h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingSet(true);
                  setSelectedSetId("");
                  setSetForm(EMPTY_SET_FORM);
                  setQuestions([]);
                  setOptions([]);
                  setQuestionForm(EMPTY_QUESTION_FORM);
                  setOptionForm(EMPTY_OPTION_FORM);
                  setIsCreatingQuestion(true);
                  setIsCreatingOption(true);
                  setError("");
                  setNotice("");
                }}
                className="px-3 py-1.5 rounded bg-secondary text-white text-sm font-semibold hover:bg-secondary/90"
              >
                Novo
              </button>
            </div>

            <div className="space-y-2">
              {quizSets.map((set) => (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => handleSelectSet(set.id)}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                    selectedSetId === set.id && !isCreatingSet
                      ? "border-secondary bg-secondary-light"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-crimson">{set.title}</span>
                    {!set.is_active && (
                      <span className="text-xs font-semibold text-red-600">Inativo</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{set.slug}</p>
                </button>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="space-y-6">
            {/* Quiz Set form */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-crimson">
                  {isCreatingSet ? "Novo quiz" : "Editar quiz"}
                </h2>
                {!isCreatingSet && selectedSetId && (
                  <button
                    type="button"
                    onClick={handleDeleteSet}
                    disabled={saving}
                    className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Excluir quiz
                  </button>
                )}
              </div>

              <form onSubmit={handleSetSubmit} className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-gray-700">
                  <span className="block mb-1 font-medium">Slug</span>
                  <input
                    value={setForm.slug}
                    onChange={(e) => setSetForm((f) => ({ ...f, slug: e.target.value }))}
                    disabled={!isCreatingSet}
                    placeholder="ex: dom-casmurro-basico"
                    className="w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                    required
                  />
                </label>
                <label className="text-sm text-gray-700">
                  <span className="block mb-1 font-medium">Livro de referencia</span>
                  <select
                    value={setForm.source_book_id}
                    onChange={(e) =>
                      setSetForm((f) => ({ ...f, source_book_id: e.target.value }))
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  >
                    <option value="">-- Nenhum livro --</option>
                    {allBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} — {book.author}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-gray-700 md:col-span-2">
                  <span className="block mb-1 font-medium">Titulo</span>
                  <input
                    value={setForm.title}
                    onChange={(e) => setSetForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm text-gray-700 md:col-span-2">
                  <span className="block mb-1 font-medium">Descricao (opcional)</span>
                  <textarea
                    value={setForm.description}
                    onChange={(e) =>
                      setSetForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={2}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={setForm.is_active}
                    onChange={(e) =>
                      setSetForm((f) => ({ ...f, is_active: e.target.checked }))
                    }
                  />
                  Quiz ativo
                </label>
                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded bg-secondary text-white font-semibold hover:bg-secondary/90 disabled:opacity-50"
                  >
                    {isCreatingSet ? "Criar quiz" : "Salvar quiz"}
                  </button>
                  {!isCreatingSet && (
                    <button
                      type="button"
                      onClick={() => {
                        const set = quizSets.find((s) => s.id === selectedSetId);
                        if (set) setSetForm(mapSetToForm(set));
                      }}
                      className="px-4 py-2 rounded border border-gray-300 font-semibold text-gray-700"
                    >
                      Reverter
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Questions + Options */}
            <section className="grid gap-6 xl:grid-cols-2">
              {/* Questions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-crimson">Perguntas</h2>
                  <button
                    type="button"
                    onClick={() => {
                      const nextOrder = questions.length + 1;
                      setQuestionForm({
                        ...EMPTY_QUESTION_FORM,
                        quiz_set_id: selectedSetId,
                        question_order: nextOrder,
                      });
                      setIsCreatingQuestion(true);
                      setOptions([]);
                      setOptionForm(EMPTY_OPTION_FORM);
                      setIsCreatingOption(true);
                    }}
                    disabled={!selectedSetId}
                    className="px-3 py-1.5 rounded bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 disabled:opacity-50"
                  >
                    Nova
                  </button>
                </div>

                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      className={`flex items-start justify-between gap-3 rounded border px-3 py-2 ${
                        questionForm.id === question.id && !isCreatingQuestion
                          ? "border-secondary bg-secondary-light"
                          : "border-gray-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectQuestion(question)}
                        className="text-left flex-1 min-w-0"
                      >
                        <p className="font-medium text-crimson text-sm line-clamp-2">
                          {question.prompt}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          #{question.question_order} · {question.time_limit_seconds}s ·{" "}
                          {question.xp_reward} XP
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-sm font-semibold text-red-600 hover:text-red-700 flex-shrink-0"
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleQuestionSubmit} className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700">
                    {isCreatingQuestion ? "Nova pergunta" : "Editar pergunta"}
                  </p>
                  <label className="text-sm text-gray-700 block">
                    <span className="block mb-1 font-medium">Enunciado</span>
                    <textarea
                      value={questionForm.prompt}
                      onChange={(e) =>
                        setQuestionForm((f) => ({ ...f, prompt: e.target.value }))
                      }
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2"
                      required
                    />
                  </label>
                  <label className="text-sm text-gray-700 block">
                    <span className="block mb-1 font-medium">Explicacao (opcional)</span>
                    <textarea
                      value={questionForm.explanation}
                      onChange={(e) =>
                        setQuestionForm((f) => ({ ...f, explanation: e.target.value }))
                      }
                      rows={2}
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className="text-sm text-gray-700">
                      <span className="block mb-1 font-medium">Ordem</span>
                      <input
                        type="number"
                        min="1"
                        value={questionForm.question_order}
                        onChange={(e) =>
                          setQuestionForm((f) => ({
                            ...f,
                            question_order: e.target.value,
                          }))
                        }
                        className="w-full rounded border border-gray-300 px-3 py-2"
                      />
                    </label>
                    <label className="text-sm text-gray-700">
                      <span className="block mb-1 font-medium">Tempo (s)</span>
                      <input
                        type="number"
                        min="1"
                        value={questionForm.time_limit_seconds}
                        onChange={(e) =>
                          setQuestionForm((f) => ({
                            ...f,
                            time_limit_seconds: e.target.value,
                          }))
                        }
                        className="w-full rounded border border-gray-300 px-3 py-2"
                      />
                    </label>
                    <label className="text-sm text-gray-700">
                      <span className="block mb-1 font-medium">XP</span>
                      <input
                        type="number"
                        min="0"
                        value={questionForm.xp_reward}
                        onChange={(e) =>
                          setQuestionForm((f) => ({ ...f, xp_reward: e.target.value }))
                        }
                        className="w-full rounded border border-gray-300 px-3 py-2"
                      />
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={saving || !selectedSetId}
                      className="px-4 py-2 rounded bg-secondary text-white font-semibold hover:bg-secondary/90 disabled:opacity-50"
                    >
                      {isCreatingQuestion ? "Criar pergunta" : "Salvar pergunta"}
                    </button>
                    {!isCreatingQuestion && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextOrder = questions.length + 1;
                          setQuestionForm({
                            ...EMPTY_QUESTION_FORM,
                            quiz_set_id: selectedSetId,
                            question_order: nextOrder,
                          });
                          setIsCreatingQuestion(true);
                          setOptions([]);
                          setOptionForm(EMPTY_OPTION_FORM);
                          setIsCreatingOption(true);
                        }}
                        className="px-4 py-2 rounded border border-gray-300 font-semibold text-gray-700"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Options */}
              <div
                className={`bg-white rounded-lg shadow-md p-6 ${
                  !canEditOptions ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-crimson">Opcoes</h2>
                  {!canEditOptions ? (
                    <span className="text-xs text-gray-500">Salve a pergunta primeiro</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setOptionForm({
                          ...EMPTY_OPTION_FORM,
                          question_id: questionForm.id,
                          option_order: options.length + 1,
                        });
                        setIsCreatingOption(true);
                      }}
                      className="px-3 py-1.5 rounded bg-secondary text-white text-sm font-semibold hover:bg-secondary/90"
                    >
                      Nova
                    </button>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-2 rounded border px-3 py-2 ${
                        optionForm.id === option.id && !isCreatingOption
                          ? "border-secondary bg-secondary-light"
                          : "border-gray-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setOptionForm(mapOptionToForm(option));
                          setIsCreatingOption(false);
                        }}
                        className="flex-1 text-left min-w-0"
                      >
                        <p className="text-sm font-medium text-crimson line-clamp-2">
                          {option.option_text}
                        </p>
                        <p className="text-xs text-gray-500">#{option.option_order}</p>
                      </button>
                      {option.is_correct ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded flex-shrink-0">
                          Correta
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMarkCorrect(option.id)}
                          disabled={saving}
                          className="text-xs font-medium text-gray-500 hover:text-green-600 disabled:opacity-50 flex-shrink-0"
                        >
                          Marcar correta
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteOption(option.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 flex-shrink-0"
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>

                {canEditOptions && (
                  <form onSubmit={handleOptionSubmit} className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">
                      {isCreatingOption ? "Nova opcao" : "Editar opcao"}
                    </p>
                    <label className="text-sm text-gray-700 block">
                      <span className="block mb-1 font-medium">Texto</span>
                      <input
                        value={optionForm.option_text}
                        onChange={(e) =>
                          setOptionForm((f) => ({ ...f, option_text: e.target.value }))
                        }
                        placeholder="Texto da opcao de resposta"
                        className="w-full rounded border border-gray-300 px-3 py-2"
                        required
                      />
                    </label>
                    <label className="text-sm text-gray-700 block">
                      <span className="block mb-1 font-medium">Ordem</span>
                      <input
                        type="number"
                        min="1"
                        value={optionForm.option_order}
                        onChange={(e) =>
                          setOptionForm((f) => ({ ...f, option_order: e.target.value }))
                        }
                        className="w-full rounded border border-gray-300 px-3 py-2"
                      />
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 rounded bg-secondary text-white font-semibold hover:bg-secondary/90 disabled:opacity-50"
                      >
                        {isCreatingOption ? "Criar opcao" : "Salvar opcao"}
                      </button>
                      {!isCreatingOption && (
                        <button
                          type="button"
                          onClick={() => {
                            setOptionForm({
                              ...EMPTY_OPTION_FORM,
                              question_id: questionForm.id,
                              option_order: options.length + 1,
                            });
                            setIsCreatingOption(true);
                          }}
                          className="px-4 py-2 rounded border border-gray-300 font-semibold text-gray-700"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
