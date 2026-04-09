/**
 * js/core/router.js
 *
 * RESPONSABILIDADE ÚNICA: Controlar a navegação da SPA (Single Page Application).
 *
 * Por que separar o roteador?
 * O roteador não sabe NADA sobre como as páginas se parecem. Ele só sabe
 * qual função chamar quando a URL muda. Isso segue o princípio de
 * "baixo acoplamento": cada módulo conhece o mínimo necessário dos outros.
 *
 * Padrão: Hash-based routing (#home, #educacao, etc.)
 * Funciona sem servidor — perfeito para hospedagem estática (GitHub Pages, etc.)
 */

import { setState } from './state.js';

/**
 * Mapa de rotas: chave = hash da URL, valor = função que renderiza a página.
 * As funções são registradas dinamicamente via `registerRoutes()`.
 * @type {Record<string, () => void>}
 */
let _routes = {};

/**
 * Registra as rotas disponíveis.
 * Chamado uma única vez em main.js, passando as funções de renderização.
 * @param {Record<string, () => void>} routeMap
 */
export function registerRoutes(routeMap) {
  _routes = routeMap;
}

/**
 * Navega para uma rota, atualizando o hash da URL.
 * Usar esta função (em vez de setar window.location.hash diretamente)
 * garante que toda navegação passe pelo mesmo ponto.
 * @param {string} to - nome da rota (ex: 'home', 'educacao')
 */
export function navigate(to) {
  window.location.hash = to;
}

/**
 * Lê a rota atual a partir do hash da URL.
 * Remove o '#' e parâmetros de query (ex: '#educacao?q=algo' → 'educacao').
 * @returns {string}
 */
export function getCurrentRoute() {
  return window.location.hash.replace('#', '').split('?')[0];
}

/**
 * Executa a função correspondente à rota atual.
 * Se a rota não existir no mapa, cai no fallback (renderHome).
 */
function resolveAndRender() {
  const route = getCurrentRoute();
  const renderFn = _routes[route] || _routes['home'] || (() => {});
  setState({ currentRoute: route || 'home' });
  renderFn();
  updateActiveNav(route);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Atualiza a classe `active` nos links de navegação desktop e mobile.
 * Centralizado aqui porque é uma consequência direta da mudança de rota.
 * @param {string} route
 */
export function updateActiveNav(route) {
  const effectiveRoute = route || 'home';
  document.querySelectorAll('.nav-link, .drawer-link').forEach((el) => {
    el.classList.toggle('active', el.dataset.route === effectiveRoute);
  });
}

/**
 * Inicializa o roteador: escuta mudanças de hash e resolve a rota inicial.
 * Deve ser chamado apenas uma vez, após o DOM estar pronto.
 */
export function initRouter() {
  window.addEventListener('hashchange', resolveAndRender);
  // Resolve a rota da URL atual ao carregar a página
  resolveAndRender();
}
