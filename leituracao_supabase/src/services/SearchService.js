/**
 * js/services/SearchService.js
 *
 * RESPONSABILIDADE ÚNICA: Lógica de busca e filtragem de livros.
 *
 * Por que separar a busca num "service"?
 * Serviços encapsulam LÓGICA DE NEGÓCIO pura — sem HTML, sem DOM.
 * Isso significa que, se amanhã você quiser mudar o algoritmo de busca
 * (por exemplo, adicionar busca fuzzy), você mexe apenas neste arquivo.
 *
 * Todas as funções aqui são puras: input → output, sem efeitos colaterais.
 */

import { CATEGORIES } from "../data/database.js";

/**
 * @typedef {import('/database.js').Book & { catId: string, catLabel: string }} SearchResult
 */
  
/**
 * Busca livros em todas as categorias pelo texto fornecido.
 * A busca é case-insensitive e verifica título, autor e resumo.
 *
 * @param {string} rawQuery - Texto digitado pelo usuário
 * @returns {SearchResult[]}
 */
export function searchBooks(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const results = [];

  for (const cat of Object.values(CATEGORIES)) {
    for (const book of cat.books) {
      if (matchesQuery(book, query)) {
        // Adiciona metadados da categoria para exibir na tela de resultados
        results.push({ ...book, catId: cat.id, catLabel: cat.label });
      }
    }
  }

  return results;
}

/**
 * Verifica se um livro corresponde à query.
 * Função interna (não exportada): usada apenas por searchBooks.
 * Separar esta lógica torna searchBooks mais legível (uma abstração por nível).
 *
 * @param {import('../data/database.js').Book} book
 * @param {string} query - Já normalizada (trim + toLowerCase)
 * @returns {boolean}
 */
function matchesQuery(book, query) {
  return (
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.summary.toLowerCase().includes(query)
  );
}

/**
 * Filtra os livros de uma categoria por subcategoria.
 *
 * @param {import('../data/database.js').Book[]} books
 * @param {string} filter - Nome do filtro (ex: 'ENEM', 'Todos')
 * @returns {import('../data/database.js').Book[]}
 */
export function filterByCategory(books, filter) {
  if (filter === "Todos") return books;
  return books.filter((book) => book.cat === filter);
}
