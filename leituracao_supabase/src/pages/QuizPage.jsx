import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../services/AuthService";
import { completeQuizSession, getQuizQuestions } from "../services/ExperienceService";

export default function QuizPage() {
  const [user, setUser] = useState(null);
  const [quizSet, setQuizSet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(28);
  const [answers, setAnswers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedXp, setSavedXp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadQuiz() {
      const currentUser = await getCurrentUser();
      if (!mounted) return;
      setUser(currentUser || null);

      const result = await getQuizQuestions(5, currentUser?.id || null);
      if (!mounted) return;

      if (result.error) {
        setError(result.error);
      } else {
        setQuizSet(result.data?.quizSet || null);
        setQuestions(result.data?.questions || []);
        setTimeRemaining(result.data?.questions?.[0]?.timeLimitSeconds || 28);
      }

      setLoading(false);
    }

    loadQuiz();

    return () => {
      mounted = false;
    };
  }, []);

  const currentQuestion = questions[currentIndex];
  const selectedOption = currentQuestion?.options?.find((option) => option.id === selectedOptionId) || null;
  const isCorrect = selectedOptionId === currentQuestion?.correctOptionId;
  const answeredCount = answers.length;
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const gainedXp = savedXp ?? answers.reduce((sum, answer) => sum + (answer.awardedXp || 0), 0);
  const progressText = useMemo(
    () => `Questao ${currentIndex + 1} de ${questions.length || 5}`,
    [currentIndex, questions.length],
  );

  useEffect(() => {
    if (!currentQuestion || showFeedback) return undefined;

    if (timeRemaining <= 0) {
      setShowFeedback(true);
      setAnswers((current) => [
        ...current,
        {
          questionId: currentQuestion.id,
          selectedOptionId: null,
          selectedOptionText: null,
          correctOptionId: currentQuestion.correctOptionId,
          isCorrect: false,
          awardedXp: 0,
        },
      ]);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setTimeRemaining((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [currentQuestion, showFeedback, timeRemaining]);

  function handleSelect(option) {
    if (showFeedback) return;

    const questionXp = currentQuestion?.xpReward || 0;
    setSelectedOptionId(option.id);
    setShowFeedback(true);
    setAnswers((current) => [
      ...current,
      {
        questionId: currentQuestion.id,
        selectedOptionId: option.id,
        selectedOptionText: option.text,
        correctOptionId: currentQuestion.correctOptionId,
        isCorrect: option.id === currentQuestion.correctOptionId,
        awardedXp: option.id === currentQuestion.correctOptionId ? questionXp : 0,
      },
    ]);
  }

  async function handleNext() {
    if (currentIndex >= questions.length - 1) {
      if (user && savedXp === null) {
        setSaving(true);
        const sessionResult = await completeQuizSession(user.id, {
          totalQuestions: questions.length,
          correctAnswers: correctCount,
          sourceBookId: quizSet?.sourceBookId || null,
          answers,
        });
        setSaving(false);

        if (sessionResult.error) {
          setError(sessionResult.error);
          return;
        }

        setSavedXp(sessionResult.data?.xpEarned || 0);
      }

      window.location.hash = "home";
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setSelectedOptionId(null);
    setShowFeedback(false);
    setTimeRemaining(questions[nextIndex]?.timeLimitSeconds || 28);
  }

  if (loading) {
    return <div className="page-section text-center text-[#64748b]">Carregando quiz...</div>;
  }

  if (error) {
    return <div className="page-section text-center text-red-600">{error}</div>;
  }

  if (!currentQuestion) {
    return (
      <div className="page-section">
        <div className="container">
          <div className="panel-card mx-auto max-w-[760px] px-8 py-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Quiz indisponivel</p>
            <h1 className="mt-4 font-serif text-4xl text-crimson">Nenhum quiz ativo foi encontrado.</h1>
            <p className="mt-4 text-[#64748b]">
              Cadastre um conjunto de perguntas no banco para liberar esta experiencia.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="container space-y-6">
        <section className="mx-auto max-w-[860px] panel-card p-6 md:p-8">
          <div className="h-2 rounded-full bg-[#ece5d8]">
            <div className="h-full rounded-full bg-crimson" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                {quizSet?.sourceBookTitle || quizSet?.title || "Quiz"}
              </p>
              <p className="mt-2 text-sm text-[#6b798b]">{progressText}</p>
            </div>
            <div className="rounded-full bg-[#f5f0e5] px-4 py-2 text-sm font-semibold text-[#7e8795]">
              {timeRemaining}s
            </div>
          </div>

          <h1 className="mt-8 font-serif text-4xl leading-tight text-crimson">{currentQuestion.prompt}</h1>

          <div className="mt-8 space-y-3">
            {currentQuestion.options.map((option, index) => {
              const active = selectedOptionId === option.id;
              const correct = showFeedback && option.id === currentQuestion.correctOptionId;
              const wrong = showFeedback && active && !correct;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className={`flex w-full items-start gap-4 rounded-[22px] border px-5 py-4 text-left transition-colors ${
                    correct
                      ? "border-[#79c9a2] bg-[#dcf8e8]"
                      : wrong
                        ? "border-[#e2a7a7] bg-[#fff3f3]"
                        : "border-[#e6dece] bg-white hover:bg-[#faf7f1]"
                  }`}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4efe6] text-sm font-semibold text-crimson">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-base leading-7 text-crimson">{option.text}</span>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className={`mt-6 rounded-[24px] px-5 py-5 ${isCorrect ? "bg-[#dcf8e8]" : "bg-[#fff4e8]"}`}>
              <p className="font-semibold text-crimson">{isCorrect ? "Correto!" : "Resposta incorreta"}</p>
              <p className="mt-2 text-sm leading-6 text-[#425163]">{currentQuestion.explanation}</p>
              {isCorrect && (
                <p className="mt-3 text-sm font-semibold text-[#1f7a42]">+{currentQuestion.xpReward} XP</p>
              )}
              {!isCorrect && selectedOption && (
                <p className="mt-3 text-sm text-[#6b798b]">
                  Sua resposta: <span className="font-semibold text-crimson">{selectedOption.text}</span>
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <p className="text-sm text-[#687789]">
              Acertos: <span className="font-semibold text-crimson">{correctCount}</span> / {questions.length}
            </p>
            <button
              onClick={handleNext}
              disabled={!showFeedback || saving}
              className="rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Salvando..." : currentIndex >= questions.length - 1 ? "Finalizar" : "Proxima"}
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            [`${correctCount}/${questions.length}`, "Acertos"],
            [`+${gainedXp}`, "XP ganho"],
            [Math.max(0, questions.length - answeredCount), "Restantes"],
          ].map(([value, label]) => (
            <article key={label} className="panel-card px-5 py-6 text-center">
              <p className="font-serif text-4xl text-crimson">{value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8491a1]">{label}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
