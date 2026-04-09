/**
 * js/components/HomePage.js
 *
 * RESPONSABILIDADE ÚNICA: Gerar o HTML completo da página inicial (Home).
 *
 * Por que separar a Home em seu próprio arquivo?
 * A página Home é a mais complexa, com Hero, Banner de Destaques,
 * várias prateleiras e a seção "Sobre". Concentrar tudo em main.js
 * tornaria aquele arquivo gigante e difícil de manter.
 * Agora, se precisar mudar o Hero, você sabe exatamente onde ir.
 */

import { CATEGORIES } from "../data/database.js";
import { CategoryShelf } from "../components/CategoryShelf.js";

/**
 * SVGs reutilizáveis — extraídos como constantes para DRY.
 */
const SEARCH_SVG = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>`;

const PLAY_SVG = `
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="5,3 19,12 5,21"/>
  </svg>`;

const DOWNLOAD_SVG = `
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>`;

/**
 * Gera o HTML da seção Hero.
 * @returns {string}
 */
function HeroSection() {
  return `
    <section class="hero" aria-label="Apresentação da LeiturAção">
      <div class="container hero-inner">
        <div class="hero-eyebrow">📚 Acesso 100% gratuito para todos</div>
        <h1>Uma biblioteca para <em>transformar</em> vidas</h1>
        <p class="hero-sub">
          Milhares de livros ao alcance de qualquer celular. Sem cadastro, sem custo,
          sem barreiras — porque ler é um direito.
        </p>

        <div class="hero-search" role="search">
          <label for="hero-input" class="visually-hidden">Buscar livros por título, autor ou tema</label>
          <span class="search-icon" style="position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.4)">
            ${SEARCH_SVG}
          </span>
          <input
            id="hero-input"
            type="search"
            placeholder="Buscar por título, autor ou tema…"
            style="padding-left:2.5rem"
            aria-label="Buscar livros"
            autocomplete="off"
          />
          <button
            class="hero-search-btn"
            id="hero-search-btn"
            data-action="hero-search"
            aria-label="Executar busca"
          >
            ${SEARCH_SVG}
          </button>
        </div>

        <div class="hero-stats" aria-label="Estatísticas da biblioteca">
          <div class="hstat"><div class="hstat-n">4.200+</div><div class="hstat-l">Livros</div></div>
          <div class="hstat"><div class="hstat-n">509</div><div class="hstat-l">Autores</div></div>
          <div class="hstat"><div class="hstat-n">100%</div><div class="hstat-l">Gratuito</div></div>
          <div class="hstat"><div class="hstat-n">0</div><div class="hstat-l">Anúncios</div></div>
        </div>
      </div>
    </section>`;
}

/**
 * Gera o HTML do banner "Destaques da Semana".
 * @returns {string}
 */
function FeaturedBanner() {
  return `
    <section class="shelf fade-up" style="padding-bottom:0" aria-labelledby="featured-title">
      <div class="container">
        <div class="shelf-header" style="margin-bottom:1.25rem">
          <div class="shelf-title-group">
            <div class="shelf-eyebrow eyebrow-gold" aria-hidden="true">⭐ Curadoria Editorial</div>
            <h2 class="shelf-title" id="featured-title">Destaques da Semana</h2>
          </div>
        </div>

        <div class="featured-banner" role="region" aria-label="Livro destaque: Dom Casmurro">
          <div class="banner-content">
            <div class="banner-eyebrow" aria-hidden="true">📖 Leitura da Semana</div>
            <h3 class="banner-title serif">Dom Casmurro</h3>
            <p class="banner-author">Machado de Assis · Realismo Brasileiro</p>
            <p style="color:rgba(255,255,255,.6);font-size:.83rem;line-height:1.65;margin-bottom:1.25rem;max-width:320px">
              Bentinho e Capitu — um amor marcado pelo ciúme e pela dúvida. Um dos maiores
              romances da língua portuguesa, agora disponível gratuitamente.
            </p>
            <div class="banner-btns">
              <button class="btn-banner-primary" data-action="read" data-book-id="l1" aria-label="Ler Dom Casmurro agora">
                ${PLAY_SVG} Ler Agora
              </button>
              <button class="btn-banner-ghost" data-action="download" data-book-id="l1" aria-label="Baixar Dom Casmurro em PDF, 1.2MB">
                ${DOWNLOAD_SVG} Baixar PDF · 1.2MB
              </button>
            </div>
          </div>

          <div class="banner-covers" aria-hidden="true">
            <div class="banner-cover-stack">
              <div class="b-cover cover-lit-2" style="font-size:1.8rem">🏚️</div>
              <div class="b-cover cover-lit-1" style="font-size:2rem">📖</div>
              <div class="b-cover cover-lit-4" style="font-size:1.8rem">💀</div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

/**
 * Gera o HTML da seção "Sobre a LeiturAção".
 * @returns {string}
 */
function AboutStrip() {
  return `
    <div class="about-strip" role="complementary" aria-label="Sobre a LeiturAção">
      <div class="container about-inner-wrap">
        <p class="about-tag">Sobre a LeiturAção</p>
        <h2>Leitura como direito, não privilégio</h2>
        <p>
          Somos um projeto fundado em 2026 com a missão de democratizar o acesso à cultura
          e ao conhecimento em comunidades carentes. Acreditamos que um livro pode mudar uma vida.
        </p>
        <button class="btn-help" data-action="help" aria-label="Saiba como ajudar a LeiturAção">
          ❤️ Como Ajudar
        </button>

        <div class="pillars-grid stagger" role="list" aria-label="Nossos pilares">
          <div class="pillar-card" role="listitem">
            <div class="pillar-icon" aria-hidden="true">📶</div>
            <h4>Leve & Rápido</h4>
            <p>Otimizado para celulares simples e conexões limitadas.</p>
          </div>
          <div class="pillar-card" role="listitem">
            <div class="pillar-icon" aria-hidden="true">🔒</div>
            <h4>100% Seguro</h4>
            <p>Apenas obras com licença livre ou autorizadas pelos autores.</p>
          </div>
          <div class="pillar-card" role="listitem">
            <div class="pillar-icon" aria-hidden="true">🤝</div>
            <h4>Comunidade</h4>
            <p>Espaço para autores independentes publicarem suas obras.</p>
          </div>
          <div class="pillar-card" role="listitem">
            <div class="pillar-icon" aria-hidden="true">🎁</div>
            <h4>Sempre Grátis</h4>
            <p>Sem anúncios, sem cadastro obrigatório, sem mensalidade.</p>
          </div>
        </div>
      </div>
    </div>`;
}

/**
 * Gera o HTML completo da Home page, compondo todas as seções.
 * @returns {string}
 */
export function HomePage() {
  // Gera uma prateleira para cada categoria, separadas por divisores
  const shelves = Object.values(CATEGORIES)
    .map((cat) => CategoryShelf(cat, 5))
    .join(
      '<div class="divider" aria-hidden="true"><div class="container"></div></div>',
    );

  return `
    <div class="page">
      ${HeroSection()}
      ${FeaturedBanner()}
      <div class="divider" aria-hidden="true" style="margin:0"><div class="container"></div></div>
      ${shelves}
      ${AboutStrip()}
    </div>`;
}
