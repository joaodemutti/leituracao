/**
 * js/core/animations.js
 *
 * RESPONSABILIDADE ÚNICA: Inicializar animações de scroll (Intersection Observer).
 *
 * Por que mover as animações para um módulo separado?
 * A lógica de animação não tem nada a ver com dados ou renderização de páginas.
 * É uma preocupação transversal (cross-cutting concern) — usada em várias páginas.
 * Centralizar aqui evita duplicação e facilita ajustes futuros (ex: mudar threshold).
 */

/**
 * Instância única do IntersectionObserver.
 * Reutilizar uma instância é mais eficiente do que criar uma nova a cada chamada.
 * @type {IntersectionObserver}
 */
let _observer = null;

/**
 * Cria (ou retorna) o observer de scroll.
 * Padrão "lazy initialization": o observer só é criado na primeira vez que for necessário.
 * @returns {IntersectionObserver}
 */
function getObserver() {
  if (_observer) return _observer;

  _observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Para de observar após tornar visível — economiza memória e CPU
          _observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.07 } // Ativa quando 7% do elemento está visível
  );

  return _observer;
}

/**
 * Registra todos os elementos `.fade-up` e `.stagger` da página atual
 * para serem animados quando entrarem no viewport.
 *
 * Deve ser chamado após o HTML de cada página ser injetado no DOM.
 * Não precisa ser chamado no init inicial — o router chama quando necessário.
 */
export function initScrollAnimations() {
  const observer = getObserver();
  document.querySelectorAll('.fade-up, .stagger').forEach((el) => {
    observer.observe(el);
  });
}
