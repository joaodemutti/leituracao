/**
 * js/pages/ProfilePage.js
 *
 * Página de perfil de usuário com gamificação.
 */

import {
  StatsCard,
  BadgesDisplay,
  ReadingCard,
  SimpleReadingChart,
} from "../components/GamificationWidget.js";
import {
  getUserStats,
  getUserReadingProgress,
  getReadingAnalytics,
} from "../services/ReadingService.js";

/**
 * Renderiza página de perfil com estatísticas de gamificação
 * @async
 * @param {object} user - Dados do usuário logado
 * @returns {Promise<string>} HTML da página
 */
export async function ProfilePage(user) {
  if (!user || !user.id) {
    return `
      <div class="page">
        <section class="auth-page">
          <div class="container auth-card">
            <p>Erro: Usuário não identificado. Faça login novamente.</p>
          </div>
        </section>
      </div>
    `;
  }

  const name = user?.name || "Usuário";
  const email = user?.email || "sem e-mail";

  try {
    // Carrega dados de gamificação (com fallback se falhar)
    const statsResult = await getUserStats(user.id).catch(() => ({
      data: null,
    }));
    const progressResult = await getUserReadingProgress(user.id, 5).catch(
      () => ({ data: [] }),
    );
    const analyticsResult = await getReadingAnalytics(user.id, 30).catch(
      () => ({ data: {} }),
    );

    const stats = statsResult?.data || {
      level: 1,
      xp_points: 0,
      total_books_read: 0,
      total_pages_read: 0,
      badges: [],
    };
    const progress = progressResult?.data || [];
    const analytics = analyticsResult?.data || {};

    // Renderiza componentes
    const statsHTML = stats ? StatsCard(stats) : "";
    const badgesHTML = stats ? BadgesDisplay(stats.badges || []) : "";
    const chartHTML =
      Object.keys(analytics).length > 0 ? SimpleReadingChart(analytics) : "";

    // Renderiza cards de livros em leitura
    const readingCardsHTML =
      progress && progress.length > 0
        ? progress
            .map((p) =>
              ReadingCard(
                {
                  id: p.book_id,
                  title: p.book_id,
                  author: "Carregando...",
                },
                {
                  current_page: p.current_page,
                  total_pages: p.total_pages,
                  completion_percentage: p.completion_percentage,
                },
              ),
            )
            .join("")
        : '<p style="text-align: center; color: #999; padding: 2rem;">Nenhum livro em leitura. Comece a ler agora!</p>';

    return `
      <div class="page profile-page">
        <div class="container">
          <!-- CABEÇALHO DO PERFIL -->
          <section style="border-bottom: 1px solid #e0e0e0; padding-bottom: 2rem; margin-bottom: 2rem;">
            <div class="auth-header" style="text-align: center;">
              <p class="auth-eyebrow">Bem-vindo</p>
              <h1 style="margin: 1rem 0;">Olá, ${name}! 👋</h1>
              <p style="color: #666; margin-bottom: 1rem;">${email}</p>
            </div>

            <div class="auth-actions" style="justify-content: center;">
              <button type="button" class="btn-banner-primary" data-action="logout">
                Sair da Conta
              </button>
            </div>
          </section>

          <!-- ESTATÍSTICAS DE GAMIFICAÇÃO -->
          ${statsHTML}

          <!-- BADGES -->
          ${badgesHTML}

          <!-- GRÁFICO DE ATIVIDADE -->
          ${chartHTML}

          <!-- LIVROS EM LEITURA -->
          <section style="margin: 3rem 0;">
            <h2 style="margin-bottom: 1.5rem;">📚 Minha Biblioteca</h2>
            <div class="reading-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
              ${readingCardsHTML}
            </div>
          </section>

          <!-- INFORMAÇÕES ADICIONAIS -->
          <section style="background: #f9f9f9; padding: 2rem; border-radius: 12px; margin-top: 3rem; text-align: center;">
            <h3>💡 Dica</h3>
            <p style="color: #666; margin: 0.5rem 0;">
              Continue lendo para subir de nível, ganhar XP e conquistar badges!
            </p>
          </section>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);

    // Fallback: mostrar perfil básico se gamificação falhar
    return `
      <div class="page profile-page">
        <div class="container">
          <section style="border-bottom: 1px solid #e0e0e0; padding-bottom: 2rem; margin-bottom: 2rem;">
            <div class="auth-header" style="text-align: center;">
              <p class="auth-eyebrow">Bem-vindo</p>
              <h1 style="margin: 1rem 0;">Olá, ${name}! 👋</h1>
              <p style="color: #666; margin-bottom: 1rem;">${email}</p>
            </div>

            <div class="auth-actions" style="justify-content: center;">
              <button type="button" class="btn-banner-primary" data-action="logout">
                Sair da Conta
              </button>
            </div>
          </section>

          <section style="background: #fff3cd; padding: 2rem; border-radius: 12px; margin-top: 2rem;">
            <p style="color: #856404; margin: 0;">
              ⚠️ Gamificação não está totalmente configurada ainda. 
              Execute o script SQL em seu Supabase para ativar.
            </p>
          </section>
        </div>
      </div>
    `;
  }
}
