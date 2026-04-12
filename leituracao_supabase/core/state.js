/**
 * js/core/state.js
 *
 * RESPONSABILIDADE ÚNICA: Gerenciar o estado global da aplicação.
 *
 * Por que ter um estado centralizado?
 * Sem isso, diferentes partes do código ficam tentando "adivinhar" o que
 * está acontecendo — ex: qual categoria está ativa, qual busca foi feita.
 * Um estado central é a fonte única da verdade (Single Source of Truth).
 *
 * Padrão usado: módulo singleton com getter/setter.
 * Isso evita variáveis globais soltas no window, que são difíceis de rastrear.
 */

/**
 * @typedef {Object} Book
 * @property {string} id
 * @property {string} title
 * @property {string} author
 * @property {string} summary
 * @property {string} cover
 * @property {string} emoji
 * @property {string} badge
 * @property {string} size
 * @property {string} cat
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} label
 * @property {string} emoji
 * @property {string} eyebrowClass
 * @property {string} badgeClass
 * @property {string} color
 * @property {string} bg
 * @property {string} desc
 * @property {{ total: number, free: number, authors: number }} stats
 * @property {string[]} filters
 * @property {Book[]} books
 */

/**
 * @typedef {Object} AppState
 * @property {string} currentRoute - Rota ativa (ex: 'home', 'educacao')
 * @property {string} activeFilter - Filtro ativo na página de categoria
 * @property {string} searchQuery  - Última busca realizada
 */

/** @type {AppState} */
const _state = {
  currentRoute: 'home',
  activeFilter: 'Todos',
  searchQuery: '',
};

/** Retorna uma cópia do estado para evitar mutação externa acidental. */
export function getState() {
  return { ..._state };
}

/**
 * Atualiza o estado com um objeto parcial.
 * Só sobrescreve as chaves fornecidas; o restante permanece.
 * @param {Partial<AppState>} patch
 */
export function setState(patch) {
  Object.assign(_state, patch);
}
