import { supabase } from "../lib/supabase.js";
import { getBookById } from "./CatalogService.js";

function calculateLevel(xpPoints) {
  return Math.floor(xpPoints / 1000) + 1;
}

function calculateBadges(currentBadges, booksRead, xpPoints) {
  const badges = new Set(currentBadges || []);

  if (booksRead >= 1) badges.add("first_book");
  if (booksRead >= 5) badges.add("five_books");
  if (booksRead >= 10) badges.add("ten_books");
  if (booksRead >= 25) badges.add("bookworm");
  if (xpPoints >= 5000) badges.add("xp_master");
  if (xpPoints >= 10000) badges.add("legend");

  return Array.from(badges);
}

async function ensureUserStats(userId) {
  const { data, error } = await supabase
    .from("estatisticas_usuario")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!error && data) return data;

  const defaults = {
    user_id: userId,
    xp_points: 0,
    level: 1,
    total_books_read: 0,
    total_pages_read: 0,
    total_reading_minutes: 0,
    current_streak: 0,
    best_streak: 0,
    badges: [],
    last_activity_date: null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("estatisticas_usuario")
    .insert(defaults)
    .select()
    .single();

  if (insertError) throw insertError;
  return inserted;
}

function normalizeDate(value) {
  return new Date(`${value}T00:00:00`);
}

async function calculateCurrentStreak(userId) {
  const { data, error } = await supabase
    .from("sessoes_leitura")
    .select("session_date")
    .eq("user_id", userId)
    .order("session_date", { ascending: false });

  if (error) throw error;
  const uniqueDates = [...new Set((data || []).map((item) => item.session_date))];
  if (!uniqueDates.length) return 0;

  let streak = 1;
  let cursor = normalizeDate(uniqueDates[0]);

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const nextDate = normalizeDate(uniqueDates[index]);
    const diffDays = Math.round((cursor - nextDate) / 86400000);
    if (diffDays === 1) {
      streak += 1;
      cursor = nextDate;
      continue;
    }
    if (diffDays > 1) break;
  }

  return streak;
}

async function applySessionGamification(userId, bookId, pagesDelta, minutesSpent) {
  const safePagesDelta = Math.max(0, Number(pagesDelta) || 0);
  const safeMinutesSpent = Math.max(0, Number(minutesSpent) || 0);

  if (safePagesDelta <= 0 && safeMinutesSpent <= 0) {
    return ensureUserStats(userId);
  }

  const xpDelta = safePagesDelta * 10;

  const { error: eventError } = await supabase.from("eventos_gamificacao").insert({
    user_id: userId,
    book_id: bookId,
    event_type: "reading_session",
    xp_delta: xpDelta,
    metadata: {
      pages_delta: safePagesDelta,
      minutes_spent: safeMinutesSpent,
    },
  });

  if (eventError) throw eventError;

  const currentStats = await ensureUserStats(userId);
  const currentStreak = await calculateCurrentStreak(userId);
  const nextXpPoints = currentStats.xp_points + xpDelta;

  const updatePayload = {
    xp_points: nextXpPoints,
    level: calculateLevel(nextXpPoints),
    total_pages_read: currentStats.total_pages_read + safePagesDelta,
    total_reading_minutes: currentStats.total_reading_minutes + safeMinutesSpent,
    current_streak: currentStreak,
    best_streak: Math.max(currentStats.best_streak, currentStreak),
    last_activity_date: new Date().toISOString().split("T")[0],
    badges: calculateBadges(
      currentStats.badges,
      currentStats.total_books_read,
      nextXpPoints,
    ),
  };

  const { data, error } = await supabase
    .from("estatisticas_usuario")
    .update(updatePayload)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function awardBookCompletion(userId, bookId) {
  const { data: existingEvent } = await supabase
    .from("eventos_gamificacao")
    .select("id")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .eq("event_type", "book_completed")
    .maybeSingle();

  if (existingEvent) {
    return ensureUserStats(userId);
  }

  const { error: eventError } = await supabase.from("eventos_gamificacao").insert({
    user_id: userId,
    book_id: bookId,
    event_type: "book_completed",
    xp_delta: 0,
    metadata: {},
  });

  if (eventError) throw eventError;

  const currentStats = await ensureUserStats(userId);
  const totalBooksRead = currentStats.total_books_read + 1;
  const badges = calculateBadges(currentStats.badges, totalBooksRead, currentStats.xp_points);

  const { data, error } = await supabase
    .from("estatisticas_usuario")
    .update({
      total_books_read: totalBooksRead,
      badges,
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getStoredEstimatedPages(bookId) {
  const bookResult = await getBookById(bookId);
  if (bookResult.error) return null;
  return bookResult.data.estimatedPages || null;
}

export async function startReading(userId, bookId, initialLocation = null, estimatedPages = null) {
  const { data: existing, error: existingError } = await supabase
    .from("progresso_leitura")
    .select("*")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();

  if (existingError) {
    return { error: existingError.message };
  }

  if (existing) {
    return { data: existing };
  }

  const fallbackEstimatedPages = estimatedPages ?? (await getStoredEstimatedPages(bookId));

  const { data, error } = await supabase
    .from("progresso_leitura")
    .insert({
      user_id: userId,
      book_id: bookId,
      status: "reading",
      epub_location: initialLocation,
      estimated_pages: fallbackEstimatedPages,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function saveReadingPosition(
  userId,
  bookId,
  location,
  currentPageApprox = null,
  estimatedPages = null,
  minutesSpent = 0,
  pagesDelta = 0,
  completionOverride = null,
) {
  const startResult = await startReading(userId, bookId, location, estimatedPages);
  if (startResult.error) return startResult;

  const previousProgress = startResult.data;
  const effectiveEstimatedPages =
    estimatedPages ?? previousProgress.estimated_pages ?? (await getStoredEstimatedPages(bookId));
  const effectiveCurrentPage = currentPageApprox ?? previousProgress.current_page;
  const completionPercentage =
    completionOverride != null
      ? Math.min(100, Math.max(0, Math.round(completionOverride)))
      : (effectiveCurrentPage && effectiveEstimatedPages
          ? Math.min(100, Math.round((effectiveCurrentPage / effectiveEstimatedPages) * 100))
          : previousProgress.completion_percentage);
  const isFinished = completionPercentage >= 98;

  const updatePayload = {
    epub_location: location,
    current_page: effectiveCurrentPage,
    estimated_pages: effectiveEstimatedPages,
    completion_percentage: completionPercentage || 0,
    last_opened_at: new Date().toISOString(),
    last_read_at: new Date().toISOString(),
    status: isFinished ? "finished" : "reading",
    finished_at: isFinished ? new Date().toISOString() : previousProgress.finished_at,
  };

  const { data: updatedProgress, error: progressError } = await supabase
    .from("progresso_leitura")
    .update(updatePayload)
    .eq("id", previousProgress.id)
    .select()
    .single();

  if (progressError) return { error: progressError.message };

  const { error: sessionError } = await supabase.from("sessoes_leitura").insert({
    user_id: userId,
    book_id: bookId,
    start_location: previousProgress.epub_location,
    end_location: location,
    start_page: previousProgress.current_page,
    end_page: effectiveCurrentPage,
    pages_delta: Math.max(0, Number(pagesDelta) || 0),
    minutes_spent: Math.max(0, Number(minutesSpent) || 0),
  });

  if (sessionError) return { error: sessionError.message };

  try {
    await applySessionGamification(userId, bookId, pagesDelta, minutesSpent);
    if (isFinished && previousProgress.status !== "finished") {
      await awardBookCompletion(userId, bookId);
    }
  } catch (error) {
    return { error: error.message };
  }

  return {
    data: {
      ...updatedProgress,
      isFinished,
    },
  };
}

export async function finishReading(
  userId,
  bookId,
  location,
  currentPageApprox = null,
  estimatedPages = null,
  minutesSpent = 0,
  completionOverride = null,
) {
  const currentProgressResult = await startReading(userId, bookId, location, estimatedPages);
  if (currentProgressResult.error) return currentProgressResult;

  const previousProgress = currentProgressResult.data;
  const pagesDelta =
    currentPageApprox && previousProgress.current_page
      ? Math.max(0, currentPageApprox - previousProgress.current_page)
      : 0;

  return saveReadingPosition(
    userId,
    bookId,
    location,
    currentPageApprox,
    estimatedPages,
    minutesSpent,
    pagesDelta,
    completionOverride,
  );
}

export async function getUserStats(userId) {
  try {
    const stats = await ensureUserStats(userId);
    return { data: stats };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getUserReadingProgress(userId, limit = 50) {
  const { data, error } = await supabase
    .from("progresso_leitura")
    .select(`
      *,
      livros (
        title,
        author,
        cover_url,
        cover_emoji,
        external_url,
        pdf_url,
        epub_url
      )
    `)
    .eq("user_id", userId)
    .order("last_opened_at", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };

  return {
    data: (data || []).map((item) => ({
      ...item,
      book: item.livros
        ? {
          title: item.livros.title,
          author: item.livros.author,
          coverUrl: item.livros.cover_url,
          emoji: item.livros.cover_emoji,
          url: item.livros.external_url,
          pdfUrl: item.livros.pdf_url,
          epubUrl: item.livros.epub_url,
        }
        : null,
    })),
  };
}

export async function getCurrentReading(userId) {
  const progressResult = await getUserReadingProgress(userId, 1);
  if (progressResult.error) return progressResult;

  const activeBook = progressResult.data.find((item) => item.status === "reading");
  return { data: activeBook || null };
}

export async function getBookProgress(userId, bookId) {
  const { data, error } = await supabase
    .from("progresso_leitura")
    .select("*")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Voce ainda nao comecou a ler este livro." };
  return { data };
}

export async function getReadingAnalytics(userId, daysBack = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("sessoes_leitura")
    .select("session_date, pages_delta, minutes_spent")
    .eq("user_id", userId)
    .gte("session_date", startDateStr)
    .order("session_date", { ascending: true });

  if (error) return { error: error.message };

  const aggregated = {};
  for (const record of data || []) {
    if (!aggregated[record.session_date]) {
      aggregated[record.session_date] = { pages: 0, minutes: 0, sessions: 0 };
    }
    aggregated[record.session_date].pages += record.pages_delta || 0;
    aggregated[record.session_date].minutes += record.minutes_spent || 0;
    aggregated[record.session_date].sessions += 1;
  }

  return { data: aggregated };
}

export async function getLeaderboard(limit = 10, scope = "all_time") {
  const tableName =
    scope === "weekly"
      ? "ranking_semanal"
      : scope === "monthly"
        ? "ranking_mensal"
        : "ranking_geral";
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .order("rank", { ascending: true })
    .limit(limit);

  if (error) return { error: error.message };
  return { data };
}

export async function abandonReading(userId, bookId) {
  const { error } = await supabase
    .from("progresso_leitura")
    .update({
      status: "abandoned",
      last_opened_at: new Date().toISOString(),
      last_read_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (error) return { error: error.message };
  return { data: { success: true } };
}

export function getBadgeLabel(badgeId) {
  const badges = {
    first_book: "Primeiro livro",
    five_books: "5 livros lidos",
    ten_books: "10 livros lidos",
    bookworm: "Leitor de ouro (25 livros)",
    xp_master: "Mestre de XP",
    legend: "Lenda",
  };

  return badges[badgeId] || badgeId;
}




