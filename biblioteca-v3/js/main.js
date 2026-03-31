/* =============================================
   LeiturAção — Biblioteca Digital Premium v3
   js/main.js  —  SPA Router + Data + UI
   ============================================= */

'use strict';

/* ════════════════════════════════════════════
   DATA STORE
   ════════════════════════════════════════════ */
const CATEGORIES = {
  educacao: {
    id: 'educacao',
    label: 'Educação & Futuro',
    emoji: '🎓',
    eyebrowClass: 'eyebrow-green',
    badgeClass: 'cat-label-edu',
    color: '#065F46',
    bg: '#D1FAE5',
    desc: 'Ferramentas para transformar conhecimento em oportunidade. Apostilas para o ENEM, guias de carreira, finanças pessoais e currículo — tudo para abrir portas.',
    stats: { total: 124, free: 124, authors: 18 },
    filters: ['Todos', 'ENEM', 'Vestibular', 'Finanças', 'Currículo', 'Idiomas'],
    books: [
      { id:'e1', title:'Matemática Completa para o ENEM', author:'Equipe LeiturAção', summary:'Do básico ao avançado: todo o conteúdo cobrado nas edições do ENEM com questões comentadas.', cover:'cover-edu-1', emoji:'📐', badge:'free', size:'4.2MB', cat:'ENEM' },
      { id:'e1', title:'Matemática Completa para o ENEM', author:'Equipe LeiturAção', summary:'Do básico ao avançado: todo o conteúdo cobrado nas edições do ENEM com questões comentadas.', cover:'cover-edu-1', emoji:'📐', badge:'free', size:'4.2MB', cat:'ENEM' },
      { id:'e2', title:'Biologia & Ecossistemas', author:'Profa. Carla Mendes', summary:'Células, genética, ecologia e evolução com linguagem simples e ilustrações didáticas.', cover:'cover-edu-2', emoji:'🧬', badge:'free', size:'3.8MB', cat:'ENEM' },
      { id:'e3', title:'Redação Nota 1000', author:'Prof. Marcos Lima', summary:'Metodologia completa de redação dissertativa com temas, repertórios e correções reais.', cover:'cover-edu-3', emoji:'📝', badge:'free', size:'2.1MB', cat:'Vestibular' },
      { id:'e4', title:'Finanças para a Vida', author:'Ana Paula Rocha', summary:'Como organizar orçamento, sair das dívidas e começar a investir com pouco dinheiro.', cover:'cover-edu-4', emoji:'💰', badge:'free', size:'1.9MB', cat:'Finanças' },
      { id:'e5', title:'Meu Primeiro Currículo', author:'Coletivo Oportunidade', summary:'Guia passo a passo para criar um currículo profissional mesmo sem experiência formal.', cover:'cover-edu-5', emoji:'📄', badge:'new',  size:'0.9MB', cat:'Currículo' },
      { id:'e6', title:'Inglês do Zero', author:'Fernanda Costa', summary:'Vocabulário essencial, gramática básica e frases para o cotidiano e entrevistas de emprego.', cover:'cover-edu-6', emoji:'🌐', badge:'free', size:'3.2MB', cat:'Idiomas' },
      { id:'e7', title:'Química Descomplicada', author:'Prof. Henrique Saul', summary:'Tabela periódica, reações e estequiometria com exemplos do dia a dia.', cover:'cover-edu-1', emoji:'⚗️', badge:'free', size:'3.5MB', cat:'ENEM' },
      { id:'e8', title:'História do Brasil: Síntese', author:'Equipe Pedagógica', summary:'De Cabral ao século XXI — cronologia completa com análise crítica para vestibulares.', cover:'cover-edu-2', emoji:'🌍', badge:'free', size:'2.8MB', cat:'Vestibular' },
    ]
  },
  literatura: {
    id: 'literatura',
    label: 'Tesouros da Literatura',
    emoji: '📚',
    eyebrowClass: 'eyebrow-navy',
    badgeClass: 'cat-label-lit',
    color: '#1e40af',
    bg: '#DBEAFE',
    desc: 'Os maiores clássicos da literatura brasileira e mundial em domínio público. Patrimônio cultural de toda a humanidade, agora acessível para todos.',
    stats: { total: 230, free: 230, authors: 47 },
    filters: ['Todos', 'Machado de Assis', 'Modernismo', 'Romantismo', 'Realismo', 'Poesia'],
    books: [
      { id:'l1', title:'Dom Casmurro', author:'Machado de Assis', summary:'O ciúme de Bentinho e a ambiguidade de Capitu num dos maiores romances da língua portuguesa.', cover:'cover-lit-1', emoji:'📖', badge:'free', size:'1.2MB', cat:'Machado de Assis' },
      { id:'l2', title:'O Cortiço', author:'Aluísio Azevedo', summary:'Retrato cru da vida nas habitações coletivas do Rio de Janeiro do século XIX.', cover:'cover-lit-2', emoji:'🏚️', badge:'free', size:'1.4MB', cat:'Realismo' },
      { id:'l3', title:'Iracema', author:'José de Alencar', summary:'A lenda da origem do Ceará na história de amor entre a índia Iracema e o guerreiro Martim.', cover:'cover-lit-3', emoji:'🌿', badge:'free', size:'0.9MB', cat:'Romantismo' },
      { id:'l4', title:'Memórias Póstumas de Brás Cubas', author:'Machado de Assis', summary:'Romance narrado por um defunto autor, revolucionário na ironia e na crítica social.', cover:'cover-lit-4', emoji:'💀', badge:'free', size:'1.3MB', cat:'Machado de Assis' },
      { id:'l5', title:'Grande Sertão: Veredas', author:'João Guimarães Rosa', summary:'A travessia de Riobaldo pelos sertões de Minas numa obra fundadora da modernidade brasileira.', cover:'cover-lit-5', emoji:'🌵', badge:'free', size:'2.1MB', cat:'Modernismo' },
      { id:'l6', title:'A Hora da Estrela', author:'Clarice Lispector', summary:'Macabéa, nordestina perdida no Rio, e a incapacidade de viver. Obra-prima do existencialismo.', cover:'cover-lit-1', emoji:'⭐', badge:'free', size:'0.8MB', cat:'Modernismo' },
      { id:'l7', title:'Quincas Borba', author:'Machado de Assis', summary:'O humanitismo e a loucura de Rubião numa sátira perfeita à filosofia e à ambição.', cover:'cover-lit-2', emoji:'🐶', badge:'free', size:'1.1MB', cat:'Machado de Assis' },
      { id:'l8', title:'Vidas Secas', author:'Graciliano Ramos', summary:'A seca e o êxodo da família de Fabiano, numa das mais tocantes narrativas brasileiras.', cover:'cover-lit-3', emoji:'☀️', badge:'free', size:'0.7MB', cat:'Realismo' },
    ]
  },
  infantil: {
    id: 'infantil',
    label: 'Espaço Kids & Alfabetização',
    emoji: '🌟',
    eyebrowClass: 'eyebrow-pink',
    badgeClass: 'cat-label-kids',
    color: '#9B2C5A',
    bg: '#FCE7F3',
    desc: 'Histórias cheias de cor, imaginação e valores para crianças em fase de alfabetização e leitura inicial. Cada livro é uma semente de amor pelos livros.',
    stats: { total: 87, free: 87, authors: 22 },
    filters: ['Todos', 'Alfabetização', 'Fábulas', 'Aventura', 'Natureza', 'Família'],
    books: [
      { id:'k1', title:'O Leão e o Rato', author:'Esopo (Adaptação)', summary:'O rato salva o poderoso leão. Uma fábula sobre amizade e gratidão para os pequenos leitores.', cover:'cover-kid-1', emoji:'🦁', badge:'free', size:'0.5MB', cat:'Fábulas' },
      { id:'k2', title:'A Menina das Estrelas', author:'Maria Souza', summary:'Lua viaja pelas estrelas para encontrar sua constelação. Uma história de identidade e pertencimento.', cover:'cover-kid-2', emoji:'🌈', badge:'new',  size:'0.8MB', cat:'Aventura' },
      { id:'k3', title:'O Mar de Marcos', author:'LeiturAção Kids', summary:'Marcos nunca viu o mar, mas sonha com ele toda noite. Uma jornada sobre sonhos e coragem.', cover:'cover-kid-3', emoji:'🐠', badge:'free', size:'0.6MB', cat:'Aventura' },
      { id:'k4', title:'A Semente Curiosa', author:'Coletivo Raízes', summary:'Uma sementinha aprende sobre paciência e crescimento enquanto vira uma grande árvore.', cover:'cover-kid-4', emoji:'🌱', badge:'free', size:'0.4MB', cat:'Natureza' },
      { id:'k5', title:'As Letras Brincam', author:'Profa. Sandra Alves', summary:'Cartilha de alfabetização com rimas, traçados e atividades lúdicas para crianças de 5 a 7 anos.', cover:'cover-kid-5', emoji:'🔤', badge:'free', size:'1.2MB', cat:'Alfabetização' },
      { id:'k6', title:'Vovó Conta Histórias', author:'Ana Flores', summary:'A vovó reúne os netos e conta as histórias da família, da comunidade e das tradições.', cover:'cover-kid-1', emoji:'👵', badge:'free', size:'0.5MB', cat:'Família' },
    ]
  },
  cidadania: {
    id: 'cidadania',
    label: 'Guia do Cidadão',
    emoji: '🏛️',
    eyebrowClass: 'eyebrow-teal',
    badgeClass: 'cat-label-cid',
    color: '#134e4a',
    bg: '#CCFBF1',
    desc: 'Conhecimento prático sobre saúde, direitos, bem-estar e participação social. Para que cada pessoa conheça seus direitos e saiba como exercê-los.',
    stats: { total: 68, free: 68, authors: 14 },
    filters: ['Todos', 'Direitos', 'Saúde', 'Bem-estar', 'Moradia', 'Trabalho'],
    books: [
      { id:'c1', title:'Meus Direitos Básicos', author:'ONG JustiçaViva', summary:'Guia prático sobre direitos do consumidor, trabalhista, habitação e saúde em linguagem acessível.', cover:'cover-cid-1', emoji:'⚖️', badge:'free', size:'1.5MB', cat:'Direitos' },
      { id:'c2', title:'Saúde da Família: Guia Completo', author:'Equipe Médica Solidária', summary:'Prevenção, primeiros socorros, vacinação e acesso ao SUS — informação que salva vidas.', cover:'cover-cid-2', emoji:'🏥', badge:'free', size:'3.2MB', cat:'Saúde' },
      { id:'c3', title:'Bem-estar Mental', author:'Psicólogas Unidas', summary:'Autocuidado, gestão emocional e como buscar ajuda psicológica pelo SUS e serviços gratuitos.', cover:'cover-cid-3', emoji:'🧠', badge:'new',  size:'1.8MB', cat:'Bem-estar' },
      { id:'c4', title:'Como Regularizar seu Imóvel', author:'Advogados Populares', summary:'Passo a passo para regularização de propriedades, usucapião e programas habitacionais.', cover:'cover-cid-4', emoji:'🏠', badge:'free', size:'2.1MB', cat:'Moradia' },
      { id:'c5', title:'CLT Simplificada', author:'Coletivo Trabalhista', summary:'Seus direitos trabalhistas em linguagem simples: férias, FGTS, rescisão e muito mais.', cover:'cover-cid-5', emoji:'💼', badge:'free', size:'1.3MB', cat:'Trabalho' },
    ]
  }
};

const FEATURED_BOOKS = [
  { title: 'Dom Casmurro', author: 'Machado de Assis', cover: 'cover-lit-1', emoji: '📖' },
  { title: 'Redação Nota 1000', author: 'Prof. Marcos Lima', cover: 'cover-edu-3', emoji: '📝' },
  { title: 'A Menina das Estrelas', author: 'Maria Souza', cover: 'cover-kid-2', emoji: '🌈' },
];

/* ════════════════════════════════════════════
   ROUTER  (hash-based SPA)
   ════════════════════════════════════════════ */
const routes = {
  '':          renderHome,
  'home':      renderHome,
  'educacao':  () => renderCategoryPage('educacao'),
  'literatura':() => renderCategoryPage('literatura'),
  'infantil':  () => renderCategoryPage('infantil'),
  'cidadania': () => renderCategoryPage('cidadania'),
};

function navigate(to) {
  window.location.hash = to;
}

function currentRoute() {
  return window.location.hash.replace('#', '').split('?')[0];
}

window.addEventListener('hashchange', () => {
  const route = currentRoute();
  const fn = routes[route] || renderHome;
  fn();
  updateNav(route);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ════════════════════════════════════════════
   HELPERS  — card builder
   ════════════════════════════════════════════ */
function badgeHtml(badge) {
  const map = { free: ['badge-free','GRÁTIS'], new: ['badge-new','NOVO'], kids: ['badge-kids','KIDS'] };
  const [cls, label] = map[badge] || map.free;
  return `<span class="card-badge ${cls}">${label}</span>`;
}

function buildCard(book, showSummary = false) {
  const summaryHtml = showSummary && book.summary
    ? `<p class="card-summary">${book.summary}</p>` : '';
  return `
  <div class="book-card" data-id="${book.id}">
    <div class="card-cover">
      <div class="card-cover-inner ${book.cover}">
        <span class="cover-emoji">${book.emoji}</span>
        <span class="cover-book-title">${book.title}</span>
      </div>
      ${badgeHtml(book.badge)}
    </div>
    <div class="card-body">
      <div class="card-title">${book.title}</div>
      <div class="card-author">${book.author}</div>
      ${summaryHtml}
      <div class="card-actions">
        <button class="btn-read" onclick="event.stopPropagation()">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          Ler Agora
        </button>
        <button class="btn-dl" title="Baixar PDF — ${book.size}" onclick="event.stopPropagation()">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span class="dl-size">${book.size}</span>
        </button>
      </div>
    </div>
  </div>`;
}

function buildShelf(catId, maxBooks = 5) {
  const cat = CATEGORIES[catId];
  const booksHtml = cat.books.slice(0, maxBooks).map(b => buildCard(b)).join('');
  return `
  <section class="shelf fade-up">
    <div class="container">
      <div class="shelf-header">
        <div class="shelf-title-group">
          <div class="shelf-eyebrow ${cat.eyebrowClass}">${cat.emoji} ${cat.label}</div>
          <h2 class="shelf-title">${cat.label}</h2>
          <p class="shelf-desc">${cat.desc.substring(0, 90)}…</p>
        </div>
        <button class="btn-see-all" onclick="navigate('${catId}')">
          Ver tudo
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
      <div class="shelf-scroll stagger">
        ${booksHtml}
      </div>
    </div>
  </section>`;
}

/* ════════════════════════════════════════════
   HOME PAGE
   ════════════════════════════════════════════ */
function renderHome() {
  const app = document.getElementById('app');

  app.innerHTML = `
  <div class="page">

    <!-- HERO -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-eyebrow">📚 Acesso 100% gratuito para todos</div>
        <h1>Uma biblioteca para <em>transformar</em> vidas</h1>
        <p class="hero-sub">Milhares de livros ao alcance de qualquer celular. Sem cadastro, sem custo, sem barreiras — porque ler é um direito.</p>
        <div class="hero-search">
          <span class="search-icon" style="position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.4)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input id="hero-input" type="text" placeholder="Buscar por título, autor ou tema…" style="padding-left:2.5rem"/>
          <button class="hero-search-btn" id="hero-search-btn" aria-label="Buscar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>
        <div class="hero-stats">
          <div class="hstat"><div class="hstat-n">4.200+</div><div class="hstat-l">Livros</div></div>
          <div class="hstat"><div class="hstat-n">509</div><div class="hstat-l">Autores</div></div>
          <div class="hstat"><div class="hstat-n">100%</div><div class="hstat-l">Gratuito</div></div>
          <div class="hstat"><div class="hstat-n">0</div><div class="hstat-l">Anúncios</div></div>
        </div>
      </div>
    </section>

    <!-- DESTAQUES DA SEMANA -->
    <section class="shelf fade-up" style="padding-bottom:0">
      <div class="container">
        <div class="shelf-header" style="margin-bottom:1.25rem">
          <div class="shelf-title-group">
            <div class="shelf-eyebrow eyebrow-gold">⭐ Curadoria Editorial</div>
            <h2 class="shelf-title">Destaques da Semana</h2>
          </div>
        </div>
        <div class="featured-banner">
          <div class="banner-content">
            <div class="banner-eyebrow">📖 Leitura da Semana</div>
            <h3 class="banner-title serif">Dom Casmurro</h3>
            <p class="banner-author">Machado de Assis · Realismo Brasileiro</p>
            <p style="color:rgba(255,255,255,.6);font-size:.83rem;line-height:1.65;margin-bottom:1.25rem;max-width:320px">
              Bentinho e Capitu — um amor marcado pelo ciúme e pela dúvida. Um dos maiores romances da língua portuguesa, agora disponível gratuitamente.
            </p>
            <div class="banner-btns">
              <button class="btn-banner-primary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                Ler Agora
              </button>
              <button class="btn-banner-ghost">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Baixar PDF · 1.2MB
              </button>
            </div>
          </div>
          <div class="banner-covers">
            <div class="banner-cover-stack">
              <div class="b-cover cover-lit-2" style="font-size:1.8rem">🏚️</div>
              <div class="b-cover cover-lit-1" style="font-size:2rem">📖</div>
              <div class="b-cover cover-lit-4" style="font-size:1.8rem">💀</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="divider" style="margin:0"><div class="container"></div></div>

    <!-- SHELVES -->
    ${buildShelf('educacao', 5)}
    <div class="divider"><div class="container"></div></div>
    ${buildShelf('literatura', 5)}
    <div class="divider"><div class="container"></div></div>
    ${buildShelf('infantil', 5)}
    <div class="divider"><div class="container"></div></div>
    ${buildShelf('cidadania', 5)}

    <!-- ABOUT STRIP -->
    <div class="about-strip">
      <div class="container about-inner-wrap">
        <p class="about-tag">Sobre a LeiturAção</p>
        <h2>Leitura como direito, não privilégio</h2>
        <p>Somos uma ONG fundada em 2018 com a missão de democratizar o acesso à cultura e ao conhecimento em comunidades carentes do Brasil. Acreditamos que um livro pode mudar uma vida.</p>
        <p>Nossa plataforma foi criada pensando em quem não tem conexão rápida nem dispositivos caros. Cada página carrega rápido, mesmo com sinal de 3G.</p>
        <button class="btn-help">❤️ Como Ajudar</button>
        <div class="pillars-grid stagger">
          <div class="pillar-card"><div class="pillar-icon">📶</div><h4>Leve & Rápido</h4><p>Otimizado para celulares simples e conexões limitadas.</p></div>
          <div class="pillar-card"><div class="pillar-icon">🔒</div><h4>100% Seguro</h4><p>Apenas obras com licença livre ou autorizadas pelos autores.</p></div>
          <div class="pillar-card"><div class="pillar-icon">🤝</div><h4>Comunidade</h4><p>Espaço para autores independentes publicarem suas obras.</p></div>
          <div class="pillar-card"><div class="pillar-icon">🎁</div><h4>Sempre Grátis</h4><p>Sem anúncios, sem cadastro obrigatório, sem mensalidade.</p></div>
        </div>
      </div>
    </div>

  </div>`;

  initScrollAnimations();
  initHeroSearch();
}

/* ════════════════════════════════════════════
   CATEGORY PAGE
   ════════════════════════════════════════════ */
function renderCategoryPage(catId) {
  const cat = CATEGORIES[catId];
  if (!cat) { renderHome(); return; }
  const app = document.getElementById('app');

  const filtersHtml = cat.filters.map((f, i) =>
    `<button class="filter-chip ${i===0?'active':''}" data-filter="${f}">${f}</button>`
  ).join('');

  const booksHtml = cat.books.map(b => buildCard(b, true)).join('');

  app.innerHTML = `
  <div class="page">

    <!-- BREADCRUMB -->
    <div class="breadcrumb-bar">
      <div class="container">
        <nav class="breadcrumb" aria-label="Caminho de navegação">
          <button onclick="navigate('home')">Início</button>
          <span class="sep">›</span>
          <span class="current">${cat.label}</span>
        </nav>
      </div>
    </div>

    <!-- CAT HERO -->
    <div class="cat-hero">
      <div class="container">
        <div class="cat-hero-inner">
          <div>
            <span class="cat-hero-badge ${cat.badgeClass}">${cat.emoji} ${cat.label}</span>
            <h1>${cat.label}</h1>
            <p>${cat.desc}</p>
          </div>
          <div class="cat-stats-row">
            <div class="cstat"><div class="cstat-n">${cat.stats.total}</div><div class="cstat-l">Livros</div></div>
            <div class="cstat"><div class="cstat-n">${cat.stats.authors}</div><div class="cstat-l">Autores</div></div>
            <div class="cstat"><div class="cstat-n">100%</div><div class="cstat-l">Grátis</div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="filter-bar">
      <div class="container">
        <div class="filter-inner" id="filter-bar">
          ${filtersHtml}
        </div>
      </div>
    </div>

    <!-- BOOKS GRID -->
    <div class="books-section">
      <div class="container">
        <div class="books-grid stagger" id="books-grid">
          ${booksHtml}
        </div>
      </div>
    </div>

  </div>`;

  initScrollAnimations();
  initFilters(cat);
}

/* ════════════════════════════════════════════
   FILTER LOGIC
   ════════════════════════════════════════════ */
function initFilters(cat) {
  const bar   = document.getElementById('filter-bar');
  const grid  = document.getElementById('books-grid');
  if (!bar || !grid) return;

  bar.addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;

    bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const filterVal = chip.dataset.filter;
    const filtered  = filterVal === 'Todos' ? cat.books : cat.books.filter(b => b.cat === filterVal);

    grid.style.opacity = '0';
    grid.style.transform = 'translateY(8px)';
    setTimeout(() => {
      grid.innerHTML = filtered.length
        ? filtered.map(b => buildCard(b, true)).join('')
        : `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--g400)">
             <div style="font-size:2.5rem;margin-bottom:.75rem">🔍</div>
             <p>Nenhum livro encontrado nesta categoria.</p>
           </div>`;
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
      grid.style.transition = 'opacity .3s, transform .3s';
      initScrollAnimations();
    }, 180);
  });
}

/* ════════════════════════════════════════════
   NAV & MOBILE MENU
   ════════════════════════════════════════════ */
function updateNav(route) {
  document.querySelectorAll('.nav-link, .drawer-link').forEach(el => {
    el.classList.toggle('active', el.dataset.route === route || (route === '' && el.dataset.route === 'home'));
  });
}

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('nav-burger');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-overlay');

  // Sticky shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('shadow', window.scrollY > 10);
  }, { passive: true });

  // Hamburger
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  overlay.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });

  // Nav link clicks (desktop + drawer)
  document.querySelectorAll('.nav-link, .drawer-link').forEach(el => {
    el.addEventListener('click', () => {
      navigate(el.dataset.route);
      mobileMenu.classList.remove('open');
    });
  });

  // Navbar search
  const navInput = document.getElementById('nav-search-input');
  navInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') runGlobalSearch(navInput.value);
  });
}

/* ════════════════════════════════════════════
   SEARCH
   ════════════════════════════════════════════ */
function runGlobalSearch(query) {
  query = query.trim().toLowerCase();
  if (!query) return;

  const results = [];
  Object.values(CATEGORIES).forEach(cat => {
    cat.books.forEach(book => {
      if (book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query) || book.summary.toLowerCase().includes(query)) {
        results.push({ ...book, catId: cat.id, catLabel: cat.label });
      }
    });
  });

  const app = document.getElementById('app');
  app.innerHTML = `
  <div class="page">
    <div class="breadcrumb-bar">
      <div class="container">
        <nav class="breadcrumb">
          <button onclick="navigate('home')">Início</button>
          <span class="sep">›</span>
          <span class="current">Busca: "${query}"</span>
        </nav>
      </div>
    </div>
    <div class="books-section">
      <div class="container">
        <div class="shelf-header" style="margin-bottom:1.5rem">
          <div>
            <div class="shelf-eyebrow eyebrow-navy">🔍 Resultados</div>
            <h2 class="shelf-title">${results.length} livro${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}</h2>
          </div>
        </div>
        <div class="books-grid stagger">
          ${results.length
            ? results.map(b => buildCard(b, true)).join('')
            : `<div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;color:var(--g400)">
                 <div style="font-size:3rem;margin-bottom:1rem">📭</div>
                 <p style="font-size:1rem">Nenhum livro encontrado para "<strong>${query}</strong>".</p>
                 <button onclick="navigate('home')" style="margin-top:1rem;background:var(--navy);color:#fff;border:none;padding:.6rem 1.2rem;border-radius:8px;font-family:inherit;font-size:.85rem;cursor:pointer">← Voltar ao início</button>
               </div>`
          }
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById('nav-search-input').value = '';
  updateNav('');
  initScrollAnimations();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initHeroSearch() {
  const input = document.getElementById('hero-input');
  const btn   = document.getElementById('hero-search-btn');
  if (!input || !btn) return;
  btn.addEventListener('click', () => runGlobalSearch(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') runGlobalSearch(input.value); });
}

/* ════════════════════════════════════════════
   SCROLL ANIMATIONS
   ════════════════════════════════════════════ */
function initScrollAnimations() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });

  document.querySelectorAll('.fade-up, .stagger').forEach(el => io.observe(el));
}

/* ════════════════════════════════════════════
   BOOT
   ════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  const route = currentRoute();
  const fn = routes[route] || renderHome;
  fn();
  updateNav(route);
});
