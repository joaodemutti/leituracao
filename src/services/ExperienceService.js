import { supabase } from "../lib/supabase";
import { getBookById, listFeaturedBooks } from "./CatalogService";
import {
  getBookProgress,
  getCurrentReading,
  getUserStats,
  saveReadingPosition,
  startReading,
} from "./ReadingService";

function getSafeInitials(name) {
  return (name || "LA")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function calculateReadingXpPreview({ startPage, endPage, mood, streakActive = false }) {
  const pagesDelta = Math.max(0, Number(endPage) - Number(startPage));
  const baseXp = pagesDelta * 10;
  const moodBonus = mood === "incrivel" ? 12 : mood === "bom" ? 8 : mood === "ok" ? 3 : 0;
  const streakBonus = streakActive && pagesDelta > 0 ? 10 : 0;

  return {
    pagesDelta,
    baseXp,
    moodBonus,
    streakBonus,
    totalXp: baseXp + moodBonus + streakBonus,
  };
}

export async function getReadingTimeline(userId, limit = 12) {
  const { data, error } = await supabase
    .from("sessoes_leitura")
    .select(`
      id,
      session_date,
      pages_delta,
      minutes_spent,
      start_page,
      end_page,
      book_id,
      livros (
        id,
        title,
        author,
        cover_url,
        cover_emoji,
        estimated_pages,
        category_id
      )
    `)
    .eq("user_id", userId)
    .order("session_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };

  return {
    data: (data || []).map((entry) => ({
      id: entry.id,
      date: entry.session_date,
      pages: entry.pages_delta || 0,
      minutes: entry.minutes_spent || 0,
      startPage: entry.start_page,
      endPage: entry.end_page,
      xp: (entry.pages_delta || 0) * 10,
      bookId: entry.book_id,
      book: {
        id: entry.livros?.id,
        title: entry.livros?.title,
        author: entry.livros?.author,
        emoji: entry.livros?.cover_emoji,
        coverUrl: entry.livros?.cover_url,
        totalPages: entry.livros?.estimated_pages,
        categoryId: entry.livros?.category_id,
      },
    })),
  };
}

export async function getCurrentReadingLogContext(userId) {
  const [currentReadingResult, timelineResult, statsResult] = await Promise.all([
    getCurrentReading(userId),
    getReadingTimeline(userId, 6),
    getUserStats(userId),
  ]);

  if (currentReadingResult.error) return currentReadingResult;
  if (timelineResult.error) return timelineResult;
  if (statsResult.error) return statsResult;

  return {
    data: {
      currentReading: currentReadingResult.data || null,
      history: timelineResult.data || [],
      stats: statsResult.data || null,
    },
  };
}

export async function getRecentAchievements(userId, limit = 8) {
  const { data, error } = await supabase
    .from("conquistas_usuario")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("earned_at", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };
  return { data: data || [] };
}

export async function getSuggestions(userId, limit = 6) {
  const [currentReadingResult, historyResult, featuredResult] = await Promise.all([
    getCurrentReading(userId),
    supabase
      .from("progresso_leitura")
      .select("book_id, livros(category_id, author)")
      .eq("user_id", userId),
    listFeaturedBooks(12),
  ]);

  const currentCategory = currentReadingResult.data?.book?.categoryId || null;
  const currentAuthor = currentReadingResult.data?.book?.author || null;
  const seenIds = new Set((historyResult.data || []).map((item) => item.book_id));

  const { data: catalogRows, error } = await supabase
    .from("livros")
    .select(`
      id,
      category_id,
      title,
      author,
      summary,
      cover_url,
      cover_emoji,
      is_featured,
      featured_rank,
      categorias(label)
    `)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("featured_rank", { ascending: true, nullsFirst: false })
    .order("title", { ascending: true })
    .limit(60);

  if (error) return { error: error.message };

  const allBooks = (catalogRows || [])
    .filter((book) => !seenIds.has(book.id))
    .map((book) => {
      let score = book.is_featured ? 4 : 1;
      if (book.category_id === currentCategory) score += 5;
      if (book.author === currentAuthor) score += 4;
      if (!currentCategory && featuredResult.data?.some((item) => item.id === book.id)) score += 2;

      return {
        id: book.id,
        title: book.title,
        author: book.author,
        summary: book.summary,
        coverUrl: book.cover_url,
        emoji: book.cover_emoji,
        match: Math.min(99, 76 + score * 3),
        reason:
          book.author === currentAuthor
            ? `Continua sua trilha com ${book.author}.`
            : book.category_id === currentCategory
              ? `Combina com a categoria que você está lendo agora.`
              : "Selecionado entre os destaques mais relevantes do acervo.",
        categoryId: book.category_id,
        categoryLabel: book.categorias?.label || "Acervo",
      };
    })
    .sort((left, right) => right.match - left.match);

  const categoryMap = new Map();
  for (const book of allBooks) {
    if (!categoryMap.has(book.categoryId)) {
      categoryMap.set(book.categoryId, book.categoryLabel);
    }
  }

  const profileTags = [];
  if (currentAuthor) profileTags.push(currentAuthor);
  if (currentCategory && categoryMap.get(currentCategory)) profileTags.push(categoryMap.get(currentCategory));
  if (!profileTags.length) profileTags.push("Leituras em destaque");

  return {
    data: {
      filters: [
        { id: "all", label: "Todas" },
        ...Array.from(categoryMap.entries()).map(([id, label]) => ({ id, label })),
      ],
      explanation: `O sistema identificou afinidade com ${profileTags.join(" e ")}.`,
      books: allBooks.slice(0, limit),
    },
  };
}

export async function registerManualReading(userId, input) {
  const bookResult = await getBookById(input.bookId);
  if (bookResult.error) return bookResult;

  const book = bookResult.data;
  const progressResult = await getBookProgress(userId, book.id);
  const existingProgress = progressResult.error ? null : progressResult.data;
  const startPage = Math.max(
    0,
    Number(input.startPage) || Number(existingProgress?.current_page) || 0,
  );
  const endPage = Math.max(startPage, Number(input.endPage) || startPage);
  const minutesSpent = Math.max(1, Number(input.minutesSpent) || Math.max(5, (endPage - startPage) * 2));
  const sessionDate = input.sessionDate || new Date().toISOString().split("T")[0];
  const streakActive = Boolean(input.streakActive);
  const preview = calculateReadingXpPreview({
    startPage,
    endPage,
    mood: input.mood,
    streakActive,
  });

  await startReading(userId, book.id, `manual-page:${startPage}`, book.totalPages);

  const saveResult = await saveReadingPosition(
    userId,
    book.id,
    `manual-page:${endPage}`,
    endPage,
    book.totalPages,
    minutesSpent,
    preview.pagesDelta,
  );

  if (saveResult.error) return saveResult;

  const zeroOrMoreEvents = [];
  if (preview.moodBonus > 0) {
    zeroOrMoreEvents.push({
      user_id: userId,
      book_id: book.id,
      event_type: "reading_mood_bonus",
      xp_delta: preview.moodBonus,
      metadata: { mood: input.mood || "", session_date: sessionDate },
    });
  }

  if (preview.streakBonus > 0) {
    zeroOrMoreEvents.push({
      user_id: userId,
      book_id: book.id,
      event_type: "reading_streak_bonus",
      xp_delta: preview.streakBonus,
      metadata: { session_date: sessionDate },
    });
  }

  if (input.note || input.mood) {
    zeroOrMoreEvents.push({
      user_id: userId,
      book_id: book.id,
      event_type: "reading_note",
      xp_delta: 0,
      metadata: {
        note: input.note || "",
        mood: input.mood || "",
        session_date: sessionDate,
        start_page: startPage,
        end_page: endPage,
      },
    });
  }

  if (zeroOrMoreEvents.length) {
    const { error: extraEventsError } = await supabase.from("eventos_gamificacao").insert(zeroOrMoreEvents);
    if (extraEventsError) return { error: extraEventsError.message };

    if (preview.moodBonus + preview.streakBonus > 0) {
      const statsResult = await getUserStats(userId);
      if (statsResult.error) return statsResult;
      const stats = statsResult.data;

      const { error: updateStatsError } = await supabase
        .from("estatisticas_usuario")
        .update({
          xp_points: (stats.xp_points || 0) + preview.moodBonus + preview.streakBonus,
          level: Math.floor(((stats.xp_points || 0) + preview.moodBonus + preview.streakBonus) / 1000) + 1,
        })
        .eq("user_id", userId);

      if (updateStatsError) return { error: updateStatsError.message };
    }
  }

  const { data: lastSession } = await supabase
    .from("sessoes_leitura")
    .select("id")
    .eq("user_id", userId)
    .eq("book_id", book.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastSession) {
    await supabase
      .from("sessoes_leitura")
      .update({ session_date: sessionDate })
      .eq("id", lastSession.id);
  }

  return {
    data: {
      pagesDelta: preview.pagesDelta,
      xpEarned: preview.totalXp,
      breakdown: preview,
      book,
    },
  };
}

export async function getQuizQuestions(limit = 5, userId = null) {
  let preferredBookId = null;
  if (userId) {
    const currentReadingResult = await getCurrentReading(userId);
    if (!currentReadingResult.error) {
      preferredBookId = currentReadingResult.data?.book_id || null;
    }
  }

  let selectedSet = null;

  if (preferredBookId) {
    const { data: matchingSet, error: matchingError } = await supabase
      .from("quiz_sets")
      .select("id, slug, title, description, source_book_id")
      .eq("is_active", true)
      .eq("source_book_id", preferredBookId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (matchingError) return { error: matchingError.message };
    selectedSet = matchingSet || null;
  }

  if (!selectedSet) {
    const { data: fallbackSet, error: fallbackError } = await supabase
      .from("quiz_sets")
      .select("id, slug, title, description, source_book_id")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fallbackError) return { error: fallbackError.message };
    selectedSet = fallbackSet || null;
  }

  if (!selectedSet) {
    return { data: { quizSet: null, questions: [] } };
  }

  const { data: questionRows, error: questionsError } = await supabase
    .from("quiz_questions")
    .select(`
      id,
      prompt,
      explanation,
      question_order,
      time_limit_seconds,
      xp_reward,
      quiz_options (
        id,
        option_text,
        option_order,
        is_correct
      )
    `)
    .eq("quiz_set_id", selectedSet.id)
    .order("question_order", { ascending: true })
    .limit(limit);

  if (questionsError) return { error: questionsError.message };

  const sourceBookTitle = selectedSet.source_book_id
    ? (await getBookById(selectedSet.source_book_id)).data?.title || selectedSet.title
    : selectedSet.title;

  return {
    data: {
      quizSet: {
        id: selectedSet.id,
        slug: selectedSet.slug,
        title: selectedSet.title,
        description: selectedSet.description,
        sourceBookId: selectedSet.source_book_id,
        sourceBookTitle,
      },
      questions: (questionRows || []).map((question) => {
        const options = (question.quiz_options || [])
          .sort((left, right) => left.option_order - right.option_order)
          .map((option) => ({
            id: option.id,
            text: option.option_text,
            isCorrect: option.is_correct,
          }));

        const correctOption = options.find((option) => option.isCorrect) || null;

        return {
          id: question.id,
          prompt: question.prompt,
          explanation: question.explanation || "",
          questionOrder: question.question_order,
          timeLimitSeconds: question.time_limit_seconds || 28,
          xpReward: question.xp_reward || 50,
          options,
          correctOptionId: correctOption?.id || null,
        };
      }),
    },
  };
}

export async function completeQuizSession(userId, payload) {
  const xpEarned = (payload.answers || []).reduce(
    (sum, answer) => sum + Math.max(0, Number(answer.awardedXp) || 0),
    0,
  );

  const { data, error } = await supabase
    .from("sessoes_quiz")
    .insert({
      user_id: userId,
      source_book_id: payload.sourceBookId || null,
      total_questions: payload.totalQuestions,
      correct_answers: payload.correctAnswers,
      xp_earned: xpEarned,
      answers: payload.answers || [],
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (xpEarned > 0) {
    const { error: eventError } = await supabase.from("eventos_gamificacao").insert({
      user_id: userId,
      book_id: payload.sourceBookId || null,
      event_type: "quiz_completed",
      xp_delta: xpEarned,
      metadata: {
        total_questions: payload.totalQuestions,
        correct_answers: payload.correctAnswers,
      },
    });

    if (eventError) return { error: eventError.message };

    const statsResult = await getUserStats(userId);
    if (statsResult.error) return statsResult;
    const stats = statsResult.data;

    const nextXpPoints = (stats.xp_points || 0) + xpEarned;
    const { error: statsError } = await supabase
      .from("estatisticas_usuario")
      .update({
        xp_points: nextXpPoints,
        level: Math.floor(nextXpPoints / 1000) + 1,
      })
      .eq("user_id", userId);

    if (statsError) return { error: statsError.message };
  }

  return { data: { ...data, xpEarned } };
}

export async function getQuizSummary(userId) {
  const { data, error } = await supabase
    .from("sessoes_quiz")
    .select("id, total_questions, correct_answers, xp_earned, completed_at")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) return { error: error.message };

  const sessions = data || [];
  const totalXp = sessions.reduce((sum, session) => sum + (session.xp_earned || 0), 0);

  return {
    data: {
      sessionsCount: sessions.length,
      totalXp,
      latest: sessions[0] || null,
    },
  };
}

export async function getProgressSnapshot(userId) {
  const [statsResult, timelineResult, achievementsResult, quizSummaryResult] = await Promise.all([
    getUserStats(userId),
    getReadingTimeline(userId, 10),
    getRecentAchievements(userId, 8),
    getQuizSummary(userId),
  ]);

  if (statsResult.error) return statsResult;
  if (timelineResult.error) return timelineResult;
  if (achievementsResult.error) return achievementsResult;
  if (quizSummaryResult.error) return quizSummaryResult;

  const stats = statsResult.data || {};
  const activityByDay = {};

  for (const session of timelineResult.data || []) {
    activityByDay[session.date] = (activityByDay[session.date] || 0) + session.pages;
  }

  return {
    data: {
      level: stats.level || 1,
      totalXp: stats.xp_points || 0,
      currentStreak: stats.current_streak || 0,
      bestStreak: stats.best_streak || 0,
      totalBooksRead: stats.total_books_read || 0,
      totalPagesRead: stats.total_pages_read || 0,
      initials: getSafeInitials(stats.display_name),
      timeline: timelineResult.data || [],
      achievements: achievementsResult.data || [],
      quizSummary: quizSummaryResult.data || null,
      activityByDay,
    },
  };
}
