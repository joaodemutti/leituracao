/**
 * js/components/BookCard.js
 *
 * RESPONSABILIDADE ÚNICA: Gerar o HTML de um card de livro.
 *
 * Por que funções que retornam strings HTML (ao invés de manipular o DOM)?
 * - São funções PURAS: dado o mesmo livro, sempre retornam o mesmo HTML.
 * - São mais fáceis de testar e debugar.
 * - Permitem renderizar vários cards de uma vez com .map().join(''),
 *   muito mais performático do que criar e inserir elementos um a um.
 *
 * Nota sobre eventos: Os botões NÃO têm onclick="..." inline.
 * Os event listeners são adicionados via delegação de eventos em main.js.
 * Isso mantém o HTML limpo e o comportamento centralizado no JavaScript.
 */

/**
 * Gera o HTML do badge (etiqueta) do card.
 * Função auxiliar pequena e focada — faz apenas uma coisa.
 * @param {'free'|'new'|'kids'} badge
 * @returns {string}
 */
function BadgeHtml(badge) {
  const BADGE_MAP = {
    free: { cls: 'badge-free', label: 'GRÁTIS' },
    new:  { cls: 'badge-new',  label: 'NOVO'   },
    kids: { cls: 'badge-kids', label: 'KIDS'   },
  };
  const { cls, label } = BADGE_MAP[badge] ?? BADGE_MAP.free;
  return `<span class="card-badge ${cls}" aria-label="Etiqueta: ${label}">${label}</span>`;
}

/**
 * Gera o HTML completo de um card de livro.
 * @param {import('./database.js').Book} book
 * @param {boolean} [showSummary=false] - Exibe o resumo do livro (usado na grade de categoria)
 * @returns {string}
 */
export function BookCard(book, showSummary = false) {
  const summaryHtml = showSummary && book.summary
    ? `<p class="card-summary">${book.summary}</p>`
    : '';

  // Se houver uma imagem de capa, usa <img>; senão, usa o fallback com emoji
  const coverHtml = book.coverImage
    ? `<img src="${book.coverImage}" alt="Capa: ${book.title}" class="card-cover-image" loading="lazy" />`
    : `<div class="card-cover-inner ${book.cover}" aria-hidden="true">
        <span class="cover-emoji">${book.emoji}</span>
        <span class="cover-book-title">${book.title}</span>
      </div>`;

  return `
    <article
      class="book-card"
      data-id="${book.id}"
      role="article"
      aria-label="Livro: ${book.title} por ${book.author}"
    >
      <div class="card-cover">
        ${coverHtml}
        ${BadgeHtml(book.badge)}
      </div>

      <div class="card-body">
        <div class="card-title">${book.title}</div>
        <div class="card-author">${book.author}</div>
        ${summaryHtml}

        <div class="card-actions">
          <button
            class="btn-read"
            data-action="read"
            data-book-id="${book.id}"
            aria-label="Ler agora: ${book.title}"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            Ler Agora
          </button>

          <button
            class="btn-dl"
            data-action="download"
            data-book-id="${book.id}"
            title="Baixar PDF — ${book.size}"
            aria-label="Baixar PDF de ${book.title} — ${book.size}"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span class="dl-size">${book.size}</span>
          </button>
        </div>
      </div>
    </article>`;
}
