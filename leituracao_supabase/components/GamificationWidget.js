/**
 * components/GamificationWidget.js
 *
 * Componentes visuais para exibição de gamificação
 * - Barra de progresso de leitura
 * - Card de estatísticas do usuário
 * - Badges conquistadas
 * - Resumo de XP e nível
 */

import { getBadgeLabel } from "../services/ReadingService.js";

/**
 * Gera HTML de barra de progresso de leitura
 * @param {object} progress - Dados de progresso { completion_percentage, current_page, total_pages }
 * @returns {string}
 */
export function ProgressBar(progress) {
  const percentage = progress.completion_percentage || 0;
  const pages = progress.current_page || 0;
  const total = progress.total_pages || 0;

  return `
    <div class="progress-container">
      <div class="progress-info">
        <span class="progress-label">${pages} / ${total} páginas</span>
        <span class="progress-percent">${percentage}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
    </div>
  `;
}

/**
 * Gera HTML de resumo de estatísticas
 * @param {object} stats - Dados de estatísticas do usuário
 * @returns {string}
 */
export function StatsCard(stats) {
  const { level, xp_points, total_books_read, total_pages_read } = stats;
  const xpForNextLevel = level * 1000;
  const xpPercentage = Math.round((xp_points % 1000) / 10); // 0-100

  return `
    <div class="stats-card">
      <div class="stats-header">
        <div class="level-badge">
          <span class="level-number">${level}</span>
          <span class="level-label">Nível</span>
        </div>
        <div class="stats-details">
          <p class="stat-item">
            <span class="stat-label">📚 Livros:</span>
            <span class="stat-value">${total_books_read}</span>
          </p>
          <p class="stat-item">
            <span class="stat-label">📖 Páginas:</span>
            <span class="stat-value">${total_pages_read}</span>
          </p>
        </div>
      </div>

      <div class="xp-section">
        <div class="xp-info">
          <span class="xp-label">XP: ${xp_points}</span>
          <span class="xp-next">Próx. nível: ${xpForNextLevel}</span>
        </div>
        <div class="xp-bar">
          <div class="xp-fill" style="width: ${xpPercentage}%"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Gera HTML de badges conquistados
 * @param {array} badges - Array de IDs de badges
 * @returns {string}
 */
export function BadgesDisplay(badges) {
  if (!badges || badges.length === 0) {
    return `
      <div class="badges-section">
        <h3>Conquistas</h3>
        <p class="no-badges">
          <span style="font-size: 2em">🎯</span>
          <br>
          Continue lendo para conquistar badges!
        </p>
      </div>
    `;
  }

  const badgeEmojis = {
    first_book: "🎓",
    five_books: "⭐",
    ten_books: "✨",
    bookworm: "🐛",
    xp_master: "⚡",
    legend: "👑",
  };

  const badgesHTML = badges
    .map((badgeId) => {
      const emoji = badgeEmojis[badgeId] || "🏆";
      const label = getBadgeLabel(badgeId);
      return `
        <div class="badge" title="${label}">
          <span class="badge-emoji">${emoji}</span>
          <span class="badge-tooltip">${label}</span>
        </div>
      `;
    })
    .join("");

  return `
    <div class="badges-section">
      <h3>Conquistas (${badges.length})</h3>
      <div class="badges-grid">
        ${badgesHTML}
      </div>
    </div>
  `;
}

/**
 * Gera HTML de card de livro em leitura
 * @param {object} book - Dados do livro { id, title, author }
 * @param {object} progress - Progresso { completion_percentage, current_page, total_pages }
 * @returns {string}
 */
export function ReadingCard(book, progress) {
  const percentage = progress.completion_percentage || 0;
  const status = percentage === 100 ? "✅ Concluído" : `${percentage}% lido`;

  return `
    <div class="reading-card">
      <div class="card-header">
        <h3>${book.title}</h3>
        <span class="card-status">${status}</span>
      </div>
      <p class="card-author">por ${book.author || "Autor desconhecido"}</p>
      <div class="progress-bar small">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
      <p class="card-pages">${progress.current_page} / ${progress.total_pages} páginas</p>
      <button class="card-button" data-action="continue-reading" data-book-id="${book.id}">
        ${percentage === 100 ? "Ler de novo" : "Continuar"}
      </button>
    </div>
  `;
}

/**
 * Gera HTML de gráfico simples de leitura (últimos 7 dias)
 * @param {object} analyticsData - Dados agregados { "2026-04-09": { pages: 50, minutes: 120 } }
 * @returns {string}
 */
export function SimpleReadingChart(analyticsData) {
  const days = Object.keys(analyticsData).slice(-7);

  if (days.length === 0) {
    return `
      <div class="chart-section">
        <h3>Atividade da Semana</h3>
        <p style="text-align: center; color: #999; padding: 20px;">
          Nenhum dado de leitura esta semana. Continue lendo! 📖
        </p>
      </div>
    `;
  }

  const maxPages = Math.max(
    ...days.map((d) => analyticsData[d].pages || 0),
    50,
  );

  const barsHTML = days
    .map((date) => {
      const data = analyticsData[date];
      const pages = data.pages || 0;
      const minutes = data.minutes || 0;
      const height = (pages / maxPages) * 100;
      const dateObj = new Date(date);
      const dayName = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][
        dateObj.getDay()
      ];

      return `
        <div class="bar-item" title="${pages} páginas em ${minutes} minutos">
          <div class="bar" style="height: ${height}%; min-height: 20px;">
            <span class="bar-value">${pages}</span>
          </div>
          <span class="bar-label">${dayName}</span>
        </div>
      `;
    })
    .join("");

  return `
    <div class="chart-section">
      <h3>Atividade da Semana</h3>
      <div class="bars-grid">
        ${barsHTML}
      </div>
    </div>
  `;
}

/**
 * Gera HTML de leaderboard
 * @param {array} users - Array de usuários com { id, level, xp_points, total_books_read }
 * @param {string} currentUserId - ID do usuário logado (para destacar)
 * @returns {string}
 */
export function Leaderboard(users, currentUserId) {
  const rowsHTML = users
    .map((user, index) => {
      const isCurrentUser = user.id === currentUserId;
      const medal =
        index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";

      return `
        <tr class="leaderboard-row ${isCurrentUser ? "current-user" : ""}">
          <td class="rank">${medal || index + 1}º</td>
          <td class="username">Usuário ${index + 1}</td>
          <td class="level">Nível ${user.level}</td>
          <td class="xp">${user.xp_points} XP</td>
          <td class="books">${user.total_books_read} 📚</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="leaderboard-section">
      <h3>Top Leitores</h3>
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Posição</th>
            <th>Usuário</th>
            <th>Nível</th>
            <th>XP</th>
            <th>Livros</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    </div>
  `;
}
