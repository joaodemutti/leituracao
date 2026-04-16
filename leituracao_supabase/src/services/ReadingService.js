/**
 * services/ReadingService.js
 *
 * Rastreamento de progresso de leitura e gamificação
 *
 * Responsabilidades:
 * 1. Rastrear progresso de leitura (página atual)
 * 2. Atualizar estatísticas do usuário
 * 3. Calcular XP, níveis e badges
 * 4. Fornecer dados para análise
 */

import { supabase } from "../lib/supabase.js";

/**
 * Inicia a leitura de um livro
 * @param {string} userId - ID do usuário
 * @param {string} bookId - ID do livro
 * @param {number} totalPages - Total de páginas do livro
 * @returns {Promise<{ data?: object, error?: string }>}
 */
export async function startReading(userId, bookId, totalPages) {
  const { data, error } = await supabase
    .from("reading_progress")
    .insert({
      user_id: userId,
      book_id: bookId,
      total_pages: totalPages,
      status: "reading",
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes("duplicate key")) {
      return { error: "Você já começou a ler este livro." };
    }
    return { error: error.message };
  }

  return { data };
}

/**
 * Atualiza progresso de leitura
 * Chamado quando o usuário salva progresso (página atual + tempo gasto)
 *
 * @param {string} userId - ID do usuário
 * @param {string} bookId - ID do livro
 * @param {number} currentPage - Página atual
 * @param {number} minutesSpent - Minutos gastos na leitura (opcional)
 * @returns {Promise<{ data?: object, error?: string }>}
 */
export async function updateReadingProgress(
  userId,
  bookId,
  currentPage,
  minutesSpent = 0,
) {
  // Busca progresso atual do livro
  const { data: progressData, error: fetchError } = await supabase
    .from("reading_progress")
    .select("id, total_pages, current_page, status")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .single();

  if (fetchError) {
    return { error: "Livro não encontrado. Inicie a leitura primeiro." };
  }

  const { id: progressId, total_pages: totalPages } = progressData;
  const completionPercentage = Math.round((currentPage / totalPages) * 100);
  const isFinished = currentPage >= totalPages;

  // Atualiza progresso principal
  const { error: updateError } = await supabase
    .from("reading_progress")
    .update({
      current_page: currentPage,
      completion_percentage: completionPercentage,
      last_read_at: new Date().toISOString(),
      status: isFinished ? "finished" : "reading",
      finished_at: isFinished ? new Date().toISOString() : null,
    })
    .eq("id", progressId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Registra leitura do dia
  if (minutesSpent > 0) {
    await supabase.from("daily_reading").upsert(
      {
        user_id: userId,
        book_id: bookId,
        minutes_spent: minutesSpent,
        pages_read: currentPage,
      },
      {
        onConflict: "user_id,book_id,read_date",
      },
    );
  }

  // Se terminou o livro, atualiza estatísticas e XP
  if (isFinished && progressData.status !== "finished") {
    await _updateUserStatsOnCompletion(userId, totalPages);
  }

  return { data: { completionPercentage, isFinished } };
}

/**
 * Atualiza estatísticas e XP ao terminar um livro
 * (Função interna)
 */
async function _updateUserStatsOnCompletion(userId, pagesRead) {
  const { data: stats, error: fetchError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("id", userId)
    .single();

  // Se não existe, cria
  if (fetchError) {
    await supabase.from("user_stats").insert({
      id: userId,
      total_books_read: 1,
      total_pages_read: pagesRead,
      xp_points: pagesRead * 10,
      level: 1,
    });
    return;
  }

  // Atualiza
  const newBooksRead = stats.total_books_read + 1;
  const newPagesRead = stats.total_pages_read + pagesRead;
  const newXP = stats.xp_points + pagesRead * 10; // 10 XP por página
  const newLevel = Math.floor(newXP / 1000) + 1; // Level a cada 1000 XP

  // Calcula novos badges
  const newBadges = _calculateNewBadges(
    stats.badges || [],
    newBooksRead,
    newXP,
  );

  await supabase
    .from("user_stats")
    .update({
      total_books_read: newBooksRead,
      total_pages_read: newPagesRead,
      xp_points: newXP,
      level: newLevel,
      badges: newBadges,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

/**
 * Calcula novos badges baseado em conquistas
 * (Função interna)
 */
function _calculateNewBadges(currentBadges, booksRead, xp) {
  const badges = new Set(currentBadges);

  if (booksRead === 1) badges.add("first_book");
  if (booksRead === 5) badges.add("five_books");
  if (booksRead === 10) badges.add("ten_books");
  if (booksRead === 25) badges.add("bookworm");
  if (xp >= 5000) badges.add("xp_master");
  if (xp >= 10000) badges.add("legend");

  return Array.from(badges);
}

/**
 * Retorna estatísticas completas do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<{ data?: object, error?: string }>}
 */
export async function getUserStats(userId) {
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    // Se não existe, retorna valores padrão
    if (error.code === "PGRST116") {
      return {
        data: {
          id: userId,
          total_books_read: 0,
          total_pages_read: 0,
          total_reading_hours: 0,
          current_streak: 0,
          best_streak: 0,
          badges: [],
          xp_points: 0,
          level: 1,
        },
      };
    }
    return { error: error.message };
  }

  return { data };
}

/**
 * Retorna progresso de leitura de todos os livros do usuário
 * @param {string} userId - ID do usuário
 * @param {number} limit - Número máximo de resultados (padrão: 50)
 * @returns {Promise<{ data?: array, error?: string }>}
 */
export async function getUserReadingProgress(userId, limit = 50) {
  const { data, error } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", userId)
    .order("last_read_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Retorna progresso específico de um livro
 * @param {string} userId - ID do usuário
 * @param {string} bookId - ID do livro
 * @returns {Promise<{ data?: object, error?: string }>}
 */
export async function getBookProgress(userId, bookId) {
  const { data, error } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { error: "Você ainda não começou a ler este livro." };
    }
    return { error: error.message };
  }

  return { data };
}

/**
 * Retorna dados de leitura para análise no gráfico
 * Agrupa páginas e minutos por data nos últimos N dias
 *
 * @param {string} userId - ID do usuário
 * @param {number} daysBack - Quantos dias para trás analisar (padrão: 30)
 * @returns {Promise<{ data?: object, error?: string }>}
 */
export async function getReadingAnalytics(userId, daysBack = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_reading")
    .select("read_date, pages_read, minutes_spent")
    .eq("user_id", userId)
    .gte("read_date", startDateStr)
    .order("read_date", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  // Agrupa por data
  const aggregated = {};
  data.forEach((record) => {
    if (!aggregated[record.read_date]) {
      aggregated[record.read_date] = { pages: 0, minutes: 0, books: 0 };
    }
    aggregated[record.read_date].pages += record.pages_read || 0;
    aggregated[record.read_date].minutes += record.minutes_spent || 0;
    aggregated[record.read_date].books += 1;
  });

  return { data: aggregated };
}

/**
 * Retorna ranking de usuários (para leaderboard)
 * @param {number} limit - Quantidade de usuários (padrão: 10)
 * @returns {Promise<{ data?: array, error?: string }>}
 */
export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from("user_stats")
    .select("id, level, xp_points, total_books_read")
    .order("xp_points", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Abandona a leitura de um livro
 * @param {string} userId - ID do usuário
 * @param {string} bookId - ID do livro
 * @returns {Promise<{ error?: string }>}
 */
export async function abandonReading(userId, bookId) {
  const { error } = await supabase
    .from("reading_progress")
    .update({ status: "abandoned" })
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}

/**
 * Retorna tradução de badges para português
 */
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
