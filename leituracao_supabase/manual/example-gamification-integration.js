/**
 * example-gamification-integration.js
 *
 * Exemplo prático de como integrar gamificação no seu projeto
 * NOTA: Este é apenas um exemplo. Adapte ao seu fluxo de aplicação.
 */

import {
  startReading,
  updateReadingProgress,
  getUserStats,
  getReadingAnalytics,
  abandonReading,
} from "./services/ReadingService.js";

import {
  ProgressBar,
  StatsCard,
  BadgesDisplay,
  ReadingCard,
  SimpleReadingChart,
  Leaderboard,
} from "./components/GamificationWidget.js";

/* ══════════════════════════════════════════════════════════════
   EXEMPLO 1: Quando usuário clica em "Começar a Ler"
   ══════════════════════════════════════════════════════════════ */

async function handleStartReading(userId, bookId, totalPages) {
  const result = await startReading(userId, bookId, totalPages);

  if (result.error) {
    console.error("Erro ao iniciar leitura:", result.error);
    alert(result.error);
    return;
  }

  console.log("✅ Leitura iniciada para", bookId);

  // Redireciona para leitor
  window.location.href = `/reader?book=${bookId}`;
}

/* ══════════════════════════════════════════════════════════════
   EXEMPLO 2: Dentro do leitor (reader.html)
   Salvar progresso quando usuário muda de página
   ══════════════════════════════════════════════════════════════ */

class BookReader {
  constructor(userId, bookId, totalPages) {
    this.userId = userId;
    this.bookId = bookId;
    this.totalPages = totalPages;
    this.currentPage = 0;
    this.readingStartTime = Date.now();
    this.lastSavedPage = 0;
  }

  /**
   * Usuário virou para a próxima página
   */
  async goToNextPage() {
    this.currentPage++;
    this.updateProgressBar();

    // Salva progresso a cada 10 páginas (evita muitas requisições)
    if (this.currentPage - this.lastSavedPage >= 10) {
      await this.saveProgress();
    }
  }

  /**
   * Usuário clicou em "Marcar como Lido"
   */
  async markAsFinished() {
    const minutesSpent = Math.round(
      (Date.now() - this.readingStartTime) / 60000,
    );

    const result = await updateReadingProgress(
      this.userId,
      this.bookId,
      this.totalPages,
      minutesSpent,
    );

    if (result.error) {
      alert("Erro ao salvar: " + result.error);
      return;
    }

    if (result.data.isFinished) {
      alert("🎉 Parabéns! Você terminou o livro!");
      this.showNewBadges();
      window.location.href = "/profile";
    }
  }

  /**
   * Salva progresso
   */
  async saveProgress() {
    const minutesSpent = Math.round(
      (Date.now() - this.readingStartTime) / 60000,
    );

    const result = await updateReadingProgress(
      this.userId,
      this.bookId,
      this.currentPage,
      minutesSpent,
    );

    if (!result.error) {
      this.lastSavedPage = this.currentPage;
      console.log(`✅ Progresso salvo: ${this.currentPage}/${this.totalPages}`);
    }
  }

  updateProgressBar() {
    const percentage = Math.round((this.currentPage / this.totalPages) * 100);
    const progress = {
      completion_percentage: percentage,
      current_page: this.currentPage,
      total_pages: this.totalPages,
    };

    const html = ProgressBar(progress);
    document.getElementById("reader-progress").innerHTML = html;
  }

  async showNewBadges() {
    const { data: stats } = await getUserStats(this.userId);
    const badgesHTML = BadgesDisplay(stats.badges);
    document.getElementById("badges-container").innerHTML = badgesHTML;
  }
}

/* ══════════════════════════════════════════════════════════════
   EXEMPLO 3: Página de Perfil
   Mostrar estatísticas completas e histórico de leitura
   ══════════════════════════════════════════════════════════════ */

async function loadUserProfile(userId) {
  // Carrega dados
  const { data: stats } = await getUserStats(userId);
  const { data: analytics } = await getReadingAnalytics(userId, 30);

  // Renderiza componentes
  const statsHTML = StatsCard(stats);
  const badgesHTML = BadgesDisplay(stats.badges);
  const chartHTML = SimpleReadingChart(analytics);

  // Monta página
  const profileHTML = `
    <div class="profile-container">
      <h1>Meu Perfil de Leitura</h1>

      <!-- Estatísticas principais -->
      <section class="stats-section">
        ${statsHTML}
      </section>

      <!-- Badges conquistados -->
      <section class="badges-section">
        ${badgesHTML}
      </section>

      <!-- Gráfico de atividade -->
      <section class="activity-section">
        ${chartHTML}
      </section>
    </div>
  `;

  document.getElementById("profile-page").innerHTML = profileHTML;
}

/* ══════════════════════════════════════════════════════════════
   EXEMPLO 4: Leaderboard
   Mostrar top 10 leitores
   ══════════════════════════════════════════════════════════════ */

async function loadLeaderboard(currentUserId) {
  const { getLeaderboard } = await import("./services/ReadingService.js");

  const { data: topUsers } = await getLeaderboard(10);
  const leaderboardHTML = Leaderboard(topUsers, currentUserId);

  document.getElementById("leaderboard-container").innerHTML = leaderboardHTML;
}

/* ══════════════════════════════════════════════════════════════
   EXEMPLO 5: Dashboard na página inicial
   Mini Widgets com progresso rápido
   ══════════════════════════════════════════════════════════════ */

async function loadDashboard(userId) {
  const { data: stats } = await getUserStats(userId);
  const { data: progress } = await getUserReadingProgress(userId, 3); // Top 3

  let readingCardsHTML = "";
  if (progress && progress.length > 0) {
    readingCardsHTML = progress
      .map((p) => {
        const bookData = { title: p.book_id, author: "Desconhecido" };
        return ReadingCard(bookData, p);
      })
      .join("");
  } else {
    readingCardsHTML =
      '<p style="text-align: center; color: #999;">Nenhum livro em leitura</p>';
  }

  const dashboardHTML = `
    <div class="dashboard">
      <h2>Seu Progresso</h2>
      
      <div class="level-summary">
        <p>Nível <strong>${stats.level}</strong> | ${stats.xp_points} XP</p>
        <p>${stats.total_books_read} livros lidos | ${stats.total_pages_read} páginas</p>
      </div>

      <h3>Lendo agora</h3>
      <div class="reading-grid">
        ${readingCardsHTML}
      </div>
    </div>
  `;

  document.getElementById("dashboard").innerHTML = dashboardHTML;
}

/* ══════════════════════════════════════════════════════════════
   EXEMPLO 6: Auto-save de progresso a cada intervalo
   Para leitor integrado (PWA)
   ══════════════════════════════════════════════════════════════ */

function startAutoSave(reader, intervalMinutes = 5) {
  const intervalMs = intervalMinutes * 60 * 1000;

  setInterval(async () => {
    await reader.saveProgress();
  }, intervalMs);
}

/* ══════════════════════════════════════════════════════════════
   EXEMPLO 7: Estatísticas em tempo real
   Atualizar só o que mudou (otimização)
   ══════════════════════════════════════════════════════════════ */

class GamificationWidget {
  constructor(userId) {
    this.userId = userId;
    this.stats = null;
    this.updateIntervalMs = 30000; // Atualizar a cada 30s
  }

  async init() {
    await this.refresh();
    this.scheduleRefresh();
  }

  async refresh() {
    const { data: stats } = await getUserStats(this.userId);
    this.stats = stats;
    this.render();
  }

  scheduleRefresh() {
    setInterval(() => this.refresh(), this.updateIntervalMs);
  }

  render() {
    if (!this.stats) return;

    const widget = document.getElementById("gamification-widget");
    if (!widget) return;

    const html = `
      <div class="gf-widget">
        <div class="gf-level">
          Nível ${this.stats.level}
        </div>
        <div class="gf-xp">
          ${this.stats.xp_points} XP
        </div>
        <div class="gf-books">
          📚 ${this.stats.total_books_read}
        </div>
      </div>
    `;

    widget.innerHTML = html;
  }
}

/* ══════════════════════════════════════════════════════════════
   COMO USAR
   ══════════════════════════════════════════════════════════════

   // 1. Iniciar leitura
   handleStartReading(userId, "book-123", 300);

   // 2. No leitor
   const reader = new BookReader(userId, "book-123", 300);
   document.getElementById("next-btn").onclick = () => reader.goToNextPage();
   document.getElementById("finish-btn").onclick = () => reader.markAsFinished();

   // 3. Carregar perfil
   loadUserProfile(userId);

   // 4. Mostrar leaderboard
   loadLeaderboard(userId);

   // 5. Dashboard na Home
   loadDashboard(userId);

   // 6. Widget sempre visível
   const widget = new GamificationWidget(userId);
   widget.init();

   ══════════════════════════════════════════════════════════════ */

export {
  handleStartReading,
  BookReader,
  loadUserProfile,
  loadLeaderboard,
  loadDashboard,
  GamificationWidget,
};
