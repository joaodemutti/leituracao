/**
 * js/components/CategoryShelf.js
 *
 * RESPONSABILIDADE ÚNICA: Gerar o HTML de uma "prateleira" horizontal de livros
 * (usada na Home para prévia de cada categoria).
 *
 * Recebe dados, retorna HTML. Sem efeitos colaterais.
 */

import { BookCard } from "./BookCard.js";

/**
 * Ícone de seta para a direita (SVG inline reutilizável).
 * Extraído como constante para evitar repetição (DRY — Don't Repeat Yourself).
 */
const ARROW_RIGHT_SVG = `
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>`;

/**
 * Gera o HTML de uma seção de prateleira para a Home.
 * @param {import('./database.js').Category} cat - Dados da categoria
 * @param {number} [maxBooks=5] - Quantos livros exibir na prévia
 * @returns {string}
 */
export function CategoryShelf(cat, maxBooks = 5) {
  // Pega apenas os primeiros N livros para a prateleira
  const booksHtml = cat.books
    .slice(0, maxBooks)
    .map((book) => BookCard(book))
    .join("");

  // Trunca a descrição para 90 caracteres na prateleira (versão compacta)
  const shortDesc =
    cat.desc.length > 90 ? cat.desc.substring(0, 90) + "…" : cat.desc;

  return `
    <section class="shelf fade-up" aria-labelledby="shelf-title-${cat.id}">
      <div class="container">
        <div class="shelf-header">
          <div class="shelf-title-group">
            <div class="shelf-eyebrow ${cat.eyebrowClass}" aria-hidden="true">
              ${cat.emoji} ${cat.label}
            </div>
            <h2 class="shelf-title" id="shelf-title-${cat.id}">${cat.label}</h2>
            <p class="shelf-desc">${shortDesc}</p>
          </div>

          <button
            class="btn-see-all"
            data-action="navigate"
            data-route="${cat.id}"
            aria-label="Ver todos os livros de ${cat.label}"
          >
            Ver tudo ${ARROW_RIGHT_SVG}
          </button>
        </div>

        <div class="shelf-scroll stagger" role="list" aria-label="Livros de ${cat.label}">
          ${booksHtml}
        </div>
      </div>
    </section>`;
}
