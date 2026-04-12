/**
 * js/components/CategoryPage.js
 *
 * RESPONSABILIDADE ÚNICA: Gerar o HTML da página interna de uma categoria.
 *
 * Esta função é "burra": ela recebe os dados prontos e retorna HTML.
 * A lógica de filtragem fica no SearchService; a lógica de quando
 * chamar esta função fica no router/main.
 */

import { BookCard } from "./BookCard.js";

/**
 * Gera a barra de filtros da categoria.
 * @param {string[]} filters - Lista de nomes de filtros
 * @returns {string}
 */
function FilterBar(filters) {
  return filters
    .map(
      (f, i) => `
      <button
        class="filter-chip ${i === 0 ? "active" : ""}"
        data-filter="${f}"
        aria-pressed="${i === 0 ? "true" : "false"}"
      >${f}</button>`,
    )
    .join("");
}

/**
 * Gera as estatísticas da categoria.
 * @param {{ total: number, authors: number }} stats
 * @returns {string}
 */
function CategoryStats(stats) {
  return `
    <div class="cat-stats-row" aria-label="Estatísticas da categoria">
      <div class="cstat">
        <div class="cstat-n">${stats.total}</div>
        <div class="cstat-l">Livros</div>
      </div>
      <div class="cstat">
        <div class="cstat-n">${stats.authors}</div>
        <div class="cstat-l">Autores</div>
      </div>
      <div class="cstat">
        <div class="cstat-n">100%</div>
        <div class="cstat-l">Grátis</div>
      </div>
    </div>`;
}

/**
 * Gera o HTML completo da página de uma categoria.
 * @param {import('./database.js').Category} cat
 * @returns {string}
 */
export function CategoryPage(cat) {
  const booksHtml = cat.books.map((book) => BookCard(book, true)).join("");

  return `
    <div class="page">

      <!-- BREADCRUMB -->
      <div class="breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb" aria-label="Caminho de navegação">
            <button data-action="navigate" data-route="home" aria-label="Voltar ao início">
              Início
            </button>
            <span class="sep" aria-hidden="true">›</span>
            <span class="current" aria-current="page">${cat.label}</span>
          </nav>
        </div>
      </div>

      <!-- HERO DA CATEGORIA -->
      <div class="cat-hero" aria-labelledby="cat-page-title">
        <div class="container">
          <div class="cat-hero-inner">
            <div>
              <span class="cat-hero-badge ${cat.badgeClass}" aria-hidden="true">
                ${cat.emoji} ${cat.label}
              </span>
              <h1 id="cat-page-title">${cat.label}</h1>
              <p>${cat.desc}</p>
            </div>
            ${CategoryStats(cat.stats)}
          </div>
        </div>
      </div>

      <!-- BARRA DE FILTROS -->
      <div class="filter-bar" role="region" aria-label="Filtrar livros por subcategoria">
        <div class="container">
          <div class="filter-inner" id="filter-bar" role="group" aria-label="Filtros">
            ${FilterBar(cat.filters)}
          </div>
        </div>
      </div>

      <!-- GRADE DE LIVROS -->
      <div class="books-section">
        <div class="container">
          <div
            class="books-grid stagger"
            id="books-grid"
            role="list"
            aria-label="Livros de ${cat.label}"
            aria-live="polite"
            aria-atomic="true"
          >
            ${booksHtml}
          </div>
        </div>
      </div>

    </div>`;
}

/**
 * Gera o HTML do estado "vazio" da grade (nenhum livro encontrado para o filtro).
 * Separar este HTML facilita a reutilização no SearchService também.
 * @param {string} filterName - Nome do filtro que não retornou resultados
 * @returns {string}
 */
export function EmptyGridHtml(filterName = "") {
  return `
    <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--g400)" role="status">
      <div style="font-size:2.5rem;margin-bottom:.75rem" aria-hidden="true">🔍</div>
      <p>Nenhum livro encontrado${filterName ? ` para "${filterName}"` : ""}.</p>
    </div>`;
}
