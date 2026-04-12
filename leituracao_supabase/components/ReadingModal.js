/**
 * components/ReadingModal.js
 *
 * Modal de leitura integrado com gamificação
 * Permite ao usuário marcar progresso de leitura e ganhar XP
 */

import {
  startReading,
  updateReadingProgress,
} from "../services/ReadingService.js";
import { supabase } from "../services/supabase.js";

/**
 * Gera o HTML do modal de leitura
 * @param {Object} book - Dados do livro
 * @param {Object} progress - Progresso atual (opcional)
 * @returns {string}
 */
export function ReadingModal(book, progress = null) {
  const currentPage = progress?.current_page || 0;
  const totalPages = progress?.total_pages || book.totalPages || 100; // fallback
  const completion = Math.round((currentPage / totalPages) * 100);

  return `
    <div class="reading-modal-overlay" id="reading-modal">
      <div class="reading-modal">
        <div class="reading-header">
          <div class="reading-book-info">
            <h2 class="reading-title">${book.title}</h2>
            <p class="reading-author">por ${book.author}</p>
          </div>
          <button class="reading-close" data-action="close-reading" aria-label="Fechar leitura">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="reading-content">
          <div class="reading-progress-section">
            <div class="progress-display">
              <div class="progress-text">
                <span class="current-page">${currentPage}</span>
                <span class="progress-separator">/</span>
                <span class="total-pages">${totalPages}</span>
                <span class="completion-percentage">(${completion}%)</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${completion}%"></div>
              </div>
            </div>

            <div class="page-controls">
              <button class="page-btn" data-action="prev-page" ${currentPage <= 0 ? "disabled" : ""}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
                Anterior
              </button>

              <div class="page-input-group">
                <label for="page-input">Página atual:</label>
                <input
                  type="number"
                  id="page-input"
                  class="page-input"
                  value="${currentPage}"
                  min="0"
                  max="${totalPages}"
                  data-action="update-page"
                />
              </div>

              <button class="page-btn" data-action="next-page" ${currentPage >= totalPages ? "disabled" : ""}>
                Próxima
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <div class="reading-iframe-container">
            <div class="reading-viewer">
              <div class="reading-viewer-content" id="reading-content">
                <div class="reading-viewer-placeholder">
                  <p>📖 Carregando livro...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="reading-footer">
          <div class="reading-stats">
            <div class="stat-item">
              <span class="stat-label">XP ganho:</span>
              <span class="stat-value">${currentPage * 10} XP</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Tempo estimado:</span>
              <span class="stat-value">${Math.round(totalPages / 2)} min</span>
            </div>
          </div>

          <div class="reading-actions">
            <button class="btn-secondary" data-action="close-reading">
              Fechar
            </button>
            <button class="btn-primary" data-action="finish-reading" ${currentPage < totalPages ? "disabled" : ""}>
              Finalizar Livro
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

/**
 * Mostra o modal de leitura para um livro
 * @param {Object} book - Dados do livro
 */
export async function showReadingModal(book) {
  console.log("📖 showReadingModal chamada com livro:", book);
  try {
    // Obter usuário atual
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("👤 Usuário obtido:", user?.id);

    if (!user) {
      alert("Você precisa estar logado para ler livros.");
      return;
    }

    // Verificar se já existe progresso para este livro
    const { data: progress } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("book_id", book.id)
      .eq("user_id", user.id)
      .single();

    console.log("📊 Progresso obtido:", progress);

    // Se não existe progresso, iniciar leitura
    if (!progress) {
      console.log("🆕 Iniciando nova leitura...");
      await startReading(user.id, book.id, book.totalPages || 100);
    }

    // Renderizar modal
    console.log("🎨 Renderizando modal...");
    const modalHtml = ReadingModal(book, progress);
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    console.log("✅ Modal inserido no DOM");

    // Carregar conteúdo do livro
    console.log("📚 Carregando conteúdo...");
    loadBookContent(book);

    // Adicionar event listeners
    console.log("🎯 Adicionando event listeners...");
    setupReadingModalEvents(book);
    console.log("✅ Event listeners adicionados");
  } catch (error) {
    console.error("❌ Erro ao abrir modal de leitura:", error);
    alert("Erro ao abrir o livro. Por favor, tente novamente.");
  }
}

/**
 * Carrega o conteúdo do livro no leitor
 * @param {Object} book - Dados do livro
 */
async function loadBookContent(book) {
  console.log("📚 Iniciando carregamento do conteúdo para:", book.title);
  const contentDiv = document.getElementById("reading-content");

  if (!contentDiv) {
    console.error("❌ Elemento reading-content não encontrado!");
    return;
  }

  console.log("✅ Elemento reading-content encontrado");

  try {
    // Conteúdo de amostras dos livros
    const bookSamples = {
      l1: {
        title: "Dom Casmurro",
        content: `CAPÍTULO I — UMA ÚLTIMA CRIAÇÃO

Trata-se de uma recordação de infância. Vejo-me menino ainda, brincando no chão com outro menino. Mal posso dizer de que brinco, e qual é o seu nome. É provável que fosse vago como outras coisas da idade, mas tinha aquele sentimento de estar absolutamente só com companhia de alguém...

[Amostra do clássico de Machado de Assis - 256 páginas]

Primeira página carregada com sucesso!`,
      },
      l2: {
        title: "O Cortiço",
        content: `PRIMEIRA PARTE

Nas primeiras horas da manhã de um dia agradável do mês de junho, uma rapariga apresentou-se à porta de um sobradinho situado à rua do Senado, no bairro da Cidade Nova, levando na mão uma criança de três anos pouco mais ou menos.

O sobradinho tinha um pequeno jardim por detrás, cercado de taboca, em cujo abrigo viçavam algumas hortaliças mal cuidadas...

[Amostra do romance de Aluísio Azevedo - 320 páginas]

Primeira página carregada com sucesso!`,
      },
      l3: {
        title: "Iracema",
        content: `PRÓLOGO

Vão aqui em legítima prosa as aventuras, amores e guerras da formosa Iracema, a virgem dos lábios de mel, que vivia na Iracema de meu país. De tudo quanto ouvi aos velhos de meu povo, hei colhido com solicitude estas memórias, que vos ofereço.

Lede estas páginas na lassidão do estio, à sombra das mangueiras, ouvindo o zumbir das abelhas e o sussurro frouxo das palmas...

[Amostra do romance de José de Alencar - 180 páginas]

Primeira página carregada com sucesso!`,
      },
      l4: {
        title: "Memórias Póstumas de Brás Cubas",
        content: `PRÓLOGO

Ao leitor. — Que Sternes em espírito era este que nos apresenta uma obra de que Laurence Sterne se dera por feliz se a tivesse escrito! Daí o subtítulo — uma obra que é essencialmente a vida toda de um verdadeiro defunto.

Isto é: vivi, é verdade, a vida de um vivente, porém vos narro a vida de um morto. E de que morre um homem senão de fastio...

[Amostra do clássico de Machado de Assis - 368 páginas]

Primeira página carregada com sucesso!`,
      },
      l5: {
        title: "Grande Sertão: Veredas",
        content: `PRIMEIRA PARTE

Nonada. Tiros que o senhor ouve, quando vem atravessando serranias do Urucúia, que届um deles é o silêncio. O jagunço espia a cavalo, na chuva e na lama, vindo de muito longe.

Mas o senhor, agora, é meu hóspede. Sou o Riobaldo. Priv[adamente, pode ser que o senhor desconfie de minha veracidade, se for um daqueles leitores de romance, que querem ver desenhada cada succinta coisa, em seus pêlos e contornos...

[Amostra do modernista João Guimarães Rosa - 200 páginas]

Primeira página carregada com sucesso!`,
      },
      l6: {
        title: "A Hora da Estrela",
        content: `DEDICATÓRIA

Ao escrever o presente livro desejo ser lido pelo presidente Getúlio Vargas e pessoas que entendem de economia, pois o que vou escrever é urente.

A datilógrafa Macabéa de quem falarei não é personagem para romance, pois não é pessoa: é um fato bruto.

[Amostra da existencialista Clarice Lispector - 200 páginas]

Primeira página carregada com sucesso!`,
      },
      l7: {
        title: "Quincas Borba",
        content: `PRIMEIRA PARTE — O HUMANITISMO

Não é a primeira vez que vejo o meu velho amigo Borba em condições difíceis. Rubião já o tinha conhecido rico, independente, e logo depois na maior pobreza e degradação. A vida de Quincas Borba foi feita de alternativas, como a de qualquer outro mortal...

[Amostra do satírico Machado de Assis - 200 páginas]

Primeira página carregada com sucesso!`,
      },
      l8: {
        title: "Vidas Secas",
        content: `PRIMEIRO

Mudança

Vinham pela estrada da catinga, magros na seca alagoana, os retirantes Fabiano, Sinha Vitória e os dois meninos. A luta pela vida era dura e contínua. Os caminhos abertos pela seca se estendiam diante deles: trilhos sinuosos, arentos...

[Amostra do realista Graciliano Ramos - 200 páginas]

Primeira página carregada com sucesso!`,
      },
      // Arte & Cultura
      a1: {
        title: "A História da Arte",
        content: `CAPÍTULO 1 — INTRODUÇÃO

O que é arte? A pergunta parece simples, mas sua resposta tem ocupado filósofos, críticos e artistas através dos séculos. Arte é a expressão da criatividade humana, a capacidade de transformar o mundo através da imaginação e da técnica.

Neste livro exploraremos desde as cavernas pré-históricas até a arte moderna contemporânea...

[Amostra do clássico de E.H. Gombrich - 300+ páginas]`,
      },
      a2: {
        title: "Teoria da Cultura",
        content: `PARTE 1 — O QUE É CULTURA?

Cultura é um termo complexo que refere-se aos valores, crenças, normas, comportamentos e tradições compartilhadas por um grupo. É o modo de vida de um povo, aquilo que os torna únicos e distintos em relação a outros grupos.

A compreensão da cultura é essencial para entender as sociedades modernas...

[Amostra do crítico cultural Terry Eagleton - 200+ páginas]`,
      },
      a3: {
        title: "Música e Sociedade",
        content: `INTRODUÇÃO

A música é uma das formas mais universais de expressão humana. Desde tempos antigos, ela acompanha rituais, celebrações e momentos de luto. Mas qual é o papel social da música? Como ela reflete os valores da sociedade?

Neste livro analisaremos as conexões profundas entre música e sociedade...

[Amostra do sociólogo Simon Frith - 250+ páginas]`,
      },
      // Ciência & Tecnologia
      c1: {
        title: "A Origem das Espécies",
        content: `INTRODUÇÃO

Quando contemplo os seres vivos à minha volta, sou tomado pela admiração e perplexidade diante da diversidade de formas, cores e comportamentos. Como surgiram tantas espécies diferentes? Como se adaptaram aos seus ambientes?

Essa é a questão central que orientou minha jornada científica...

[Amostra da obra fundamental de Charles Darwin - 400+ páginas]`,
      },
      c2: {
        title: "Uma Breve História do Tempo",
        content: `CAPÍTULO 1 — O CONCEITO DO TEMPO

O tempo é uma das dimensões mais fundamentais do universo, mas também uma das mais misteriosas. O que é o tempo? Flui em uma única direção? Pode ser viajado?

Estas são algumas das questões que exploraremos nesta jornada pelo cosmos...

[Amostra do físico Stephen Hawking - 200+ páginas]`,
      },
      c3: {
        title: "O Gene Egoísta",
        content: `PRÓLOGO

Os organismos vivos não são cooperativas simpáticas de moléculas de DNA. Eles são máquinas construídas pelo DNA para sobreviver e se reproduzir. O gene, não o organismo individual, é a unidade fundamental da seleção natural.

Esta é a perspectiva inovadora que revoluciona nossa compreensão da evolução...

[Amostra do biólogo Richard Dawkins - 250+ páginas]`,
      },
      // Educação
      e1: {
        title: "Matemática Completa para o ENEM",
        content: `UNIDADE 1 — FUNDAMENTOS

A matemática é a linguagem do universo. Seus princípios regem desde o movimento dos planetas até as estruturas subatômicas. Para o ENEM, você precisa dominar conceitos fundamentais que aparecem constantemente.

Começaremos com os conceitos básicos que formam a base de tudo...

[Material educativo LeiturAção - 300+ páginas]`,
      },
      e2: {
        title: "Biologia & Ecossistemas",
        content: `CAPÍTULO 1 — A CÉLULA

A célula é a unidade fundamental da vida. Todos os organismos vivos, desde bactérias microscópicas até as baleias azuis, são compostos por uma ou mais células. Compreender a célula é compreender a vida.

Existe um núcleo no centro de cada célula que controla suas atividades...

[Amostra educativa da Profa. Carla Mendes - 200+ páginas]`,
      },
      e3: {
        title: "Redação Nota 1000",
        content: `INTRODUÇÃO — O CAMINHO PARA A PERFEIÇÃO

A redação não é apenas sobre escrever bonito. É sobre comunicar ideias de forma clara, persuasiva e bem estruturada. Neste livro mostraremos metodologia comprovada para alcançar a nota máxima.

Os melhores redatores não nascem prontos — eles treinam metodicamente...

[Metodologia do Prof. Marcos Lima - 250+ páginas]`,
      },
      // Filosofia & Pensamento
      f1: {
        title: "A República",
        content: `LIVRO I

Socrates — Sócrates, descemos ontem ao Pirâu com Glaucon, filho de Péricles, para assistir uma procissão em honra da deusa. Queremos ver também como os habitantes dessa cidade realizam a festa, pois é a primeira vez.

Pois bem, já terminada a procissão, nos dirigíamos para a cidade, quando Polemarco...

[Diálogo clássico de Platão - 300+ páginas]`,
      },
      f2: {
        title: "Ética a Nicômaco",
        content: `LIVRO I — A FELICIDADE

Toda arte e toda investigação, assim como da mesma forma toda ação e todo propósito, parecem visar a algum bem; razão pela qual foi belle e bem a descrição que alguém fez do bem, como aquilo a que todas as coisas tendem.

Mas há uma apreciável diferença entre os fins...

[Tratado clássico de Aristóteles - 250+ páginas]`,
      },
      f3: {
        title: "Discurso do Método",
        content: `PARTE PRIMEIRA

Desejo que os leitores desta obra observem que não pretendo fazer recomendações em matéria de cima para baixo. Apenas narro a história dos meus pensamentos e convido o leitor a pensar consigo mesmo.

O bom senso é a coisa do mundo mais bem distribuída...

[Fundação da filosofia moderna por René Descartes - 150+ páginas]`,
      },
      f4: {
        title: "Crítica da Razão Pura",
        content: `INTRODUÇÃO

Há um certo interesse especial em conhecer os princípios sobre os quais repousa o nosso conhecimento. Compreendo por razão pura aquela que contém princípios absolutamente a priori, independentes de qualquer experiência empírica.

Esta obra trata dos limites e possibilidades do conhecimento humano...

[Obra magistral de Immanuel Kant - 400+ páginas]`,
      },
      // História
      h1: {
        title: "A História do Mundo Antigo",
        content: `CAPÍTULO 1 — OS PRIMÓRDIOS

A história da humanidade começa em Africa há milhões de anos. Nossos ancestrais primitivos enfrentaram um mundo hostil cheio de predadores e desafios. Mas possuíam uma característica única: a inteligência e a capacidade de cooperação.

Gradualmente, aprenderiam a usar ferramentas, controlar o fogo, e construir civilizações...

[Narrativa histórica de Eduardo Bueno - 350+ páginas]`,
      },
      h2: {
        title: "Brasil: Uma História",
        content: `PREFÁCIO

Contar a história do Brasil é contar a história de encontros, conflitos e sínteses. É falar dos povos indígenas que habitavam estas terras há milhares de anos, dos portugueses que chegaram em 1500, dos africanos trazidos à força e de séculos de transformações.

Este livro oferece uma perspectiva crítica e atual sobre nossa identidade nacional...

[Obra coletiva de Lilia Schwarcz e Heloisa Starling - 400+ páginas]`,
      },
      h3: {
        title: "A Segunda Guerra Mundial",
        content: `INTRODUÇÃO

A Segunda Guerra Mundial foi o conflito mais destruidor da história humana. Mais de 70 milhões de pessoas morreram. Cidades foram destruídas. Civilizações foram alteradas para sempre. Mas como chegamos aí?

Devemos examinar as raízes deste conflito nos anos após a Primeira Guerra...

[Relato detalhado de Antony Beevor - 500+ páginas]`,
      },
      // Religião
      r1: {
        title: "A Bíblia Sagrada",
        content: `GÊNESIS — CAPÍTULO 1

No princípio, criou Deus os céus e a terra. A terra era vã e vazia, e havia trevas sobre a face do abismo; e o Espírito de Deus pairava sobre as águas.

E disse Deus: Faça-se luz. E houve luz.

[Texto sagrado do cristianismo - 600+ páginas]`,
      },
      r2: {
        title: "O Alcorão",
        content: `SURA 1 — A ABERTURA

Em nome de Deus, o Clemente, o Misericordioso. Louvor a Deus, Senhor dos mundos, o Clemente, o Misericordioso, Senhor do dia do Julgamento.

A ti adoramos e a ti pedimos ajuda. Guia-nos pelo caminho reto...

[Texto sagrado do islamismo - 400+ páginas]`,
      },
      r3: {
        title: "Filosofia da Religião",
        content: `CAPÍTULO 1 — INTRODUÇÃO

O que é religião? Como as pessoas adquirem experiências religiosas? Essas questões intrigam filósofos há séculos. A religião é ilusão, como alguns pensadores modernos afirmam? Ou oferece verdades profundas sobre a existência?

Neste livro exploraremos múltiplas perspectivas sobre estes temas fundamentais...

[Análise filosófica de John Hick - 250+ páginas]`,
      },
      // Ciências Sociais
      s1: {
        title: "Sociologia Básica",
        content: `CAPÍTULO 1 — CONCEITOS FUNDAMENTAIS

Sociologia é o estudo científico da sociedade e do comportamento humano em grupos. Ela nos ajuda a compreender como as pessoas interagem, como as sociedades se organizam e como mudanças acontecem.

A sociologia surgiu como disciplina no século XIX quando pensadores começaram aplicar métodos científicos ao estudo da sociedade...

[Introdução de Marcos César Alvarez - 200+ páginas]`,
      },
      s2: {
        title: "Introdução à Economia",
        content: `CAPÍTULO 1 — O QUE É ECONOMIA?

Economia é o estudo de como as sociedades administram recursos escassos. Todos enfrentamos escolhas: como gastar nosso dinheiro, tempo e energia. As nações também enfrentam escolhas: que bens produzir e para quem.

Compreender os princípios básicos de economia nos ajuda a tomar melhores decisões...

[Abordagem moderna de Paul Krugman e Robin Wells - 300+ páginas]`,
      },
      s3: {
        title: "Direito Constitucional",
        content: `CAPÍTULO 1 — CONSTITUIÇÃO E DIREITO

Uma constituição é como o coração de qualquer estado democrático. Ela estabelece os princípios fundamentais, direitos e responsabilidades. A Constituição Federal brasileira é um documento vivo que evoluiu desde sua promulgação.

Neste livro exploraremos seus princípios, estrutura e aplicações práticas...

[Análise profunda de Gilmar Mendes - 350+ páginas]`,
      },
    };

    const sample = bookSamples[book.id];
    if (!sample) {
      console.warn(
        "⚠️  Livro não encontrado em amostras, usando livro genérico",
      );
      contentDiv.innerHTML = `
        <div class="reading-viewer-page">
          <h2>${book.title}</h2>
          <p>Autor: ${book.author}</p>
          <p style="margin-top: 2rem; font-style: italic;">Este é um exemplo do leitor de livros.</p>
        </div>
      `;
      window.bookPages = ["Página padrão"];
      return;
    }

    // Dividir conteúdo em páginas (aprox. 30 linhas por página)
    const lines = sample.content.split("\n");
    const linesPerPage = 30;
    window.bookPages = [];

    for (let i = 0; i < lines.length; i += linesPerPage) {
      window.bookPages.push(lines.slice(i, i + linesPerPage).join("\n"));
    }

    console.log("✅ Páginas criadas:", window.bookPages.length);
    console.log("📄 Primeira página:", window.bookPages[0]);

    // Mostrar primeira página
    displayPageContent(0);
    console.log("✅ Primeira página exibida");
  } catch (error) {
    console.error("❌ Erro ao carregar conteúdo do livro:", error);
    contentDiv.innerHTML =
      '<div class="reading-viewer-placeholder"><p>❌ Erro ao carregar livro.</p></div>';
  }
}

/**
 * Exibe o conteúdo de uma página específica
 * @param {number} pageIndex - Índice da página (0-based)
 */
function displayPageContent(pageIndex) {
  console.log("📄 Exibindo página:", pageIndex);
  const contentDiv = document.getElementById("reading-content");

  if (!contentDiv) {
    console.error("❌ Element reading-content não encontrado!");
    return;
  }

  if (!window.bookPages) {
    console.error("❌ window.bookPages não definido");
    return;
  }

  if (pageIndex < 0 || pageIndex >= window.bookPages.length) {
    console.warn("⚠️  Índice de página inválido:", pageIndex);
    return;
  }

  const pageContent = window.bookPages[pageIndex];
  console.log("📝 Conteúdo da página:", pageContent.substring(0, 100) + "...");

  contentDiv.innerHTML = `
    <div class="reading-viewer-page">
      <pre class="reading-viewer-text">${escapeHtml(pageContent)}</pre>
      <div class="reading-page-number">Página ${pageIndex + 1} de ${window.bookPages.length}</div>
    </div>
  `;

  console.log("✅ Página exibida com sucesso");
}

/**
 * Escapa caracteres HTML para evitar XSS
 * @param {string} text - Texto a ser escapado
 * @returns {string}
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Configura os event listeners do modal de leitura
 * @param {Object} book - Dados do livro
 */
function setupReadingModalEvents(book) {
  const modal = document.getElementById("reading-modal");
  const overlay = modal;
  const content = modal.querySelector(".reading-modal");

  if (!modal) {
    console.error("Modal não encontrado");
    return;
  }

  // Handler para clicks em elementos com data-action
  modal.addEventListener("click", async (e) => {
    const actionBtn = e.target.closest("[data-action]");
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;
    console.log("🎯 Ação detectada:", action);

    switch (action) {
      case "close-reading":
        console.log("❌ Fechando modal...");
        modal.remove();
        break;

      case "prev-page":
        await updatePage(book, -1);
        break;

      case "next-page":
        await updatePage(book, 1);
        break;

      case "update-page":
        if (e.type === "input" || e.type === "change") {
          const newPage = parseInt(e.target.value) || 0;
          await updatePageAbsolute(book, newPage);
        }
        break;

      case "finish-reading":
        await finishReading(book);
        modal.remove();
        break;
    }
  });

  // Event listener para input de página
  const pageInput = modal.querySelector("#page-input");
  if (pageInput) {
    pageInput.addEventListener("change", (e) => {
      const event = new CustomEvent("click", { bubbles: true });
      e.target.setAttribute("data-action", "update-page");
      e.target.dispatchEvent(event);
    });
  }

  // Fechar modal ao clicar no overlay (fundo escuro)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      console.log("❌ Fechando modal (overlay clicado)...");
      modal.remove();
    }
  });
}

/**
 * Atualiza a página atual (relativo)
 * @param {Object} book - Dados do livro
 * @param {number} delta - Mudança na página (+1 ou -1)
 */
async function updatePage(book, delta) {
  const pageInput = document.querySelector("#page-input");
  const currentPage = parseInt(pageInput.value) || 0;
  const newPage = Math.max(0, currentPage + delta);

  await updatePageAbsolute(book, newPage);
}

/**
 * Atualiza para uma página específica
 * @param {Object} book - Dados do livro
 * @param {number} newPage - Nova página
 */
async function updatePageAbsolute(book, newPage) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const totalPages =
      window.bookPages?.length ||
      parseInt(document.querySelector(".total-pages").textContent) ||
      100;
    const clampedPage = Math.max(0, Math.min(totalPages, newPage));

    // Exibir página no leitor
    displayPageContent(clampedPage);

    // Atualizar progresso no banco
    await updateReadingProgress(user.id, book.id, clampedPage);

    // Atualizar UI
    updateReadingUI(clampedPage, totalPages);
  } catch (error) {
    console.error("Erro ao atualizar página:", error);
  }
}

/**
 * Finaliza a leitura do livro
 * @param {Object} book - Dados do livro
 */
async function finishReading(book) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const totalPages =
      window.bookPages?.length ||
      parseInt(document.querySelector(".total-pages").textContent) ||
      100;
    await updateReadingProgress(user.id, book.id, totalPages, "finished");

    // Mostrar notificação de sucesso
    showNotification("🎉 Livro finalizado! XP ganho: " + totalPages * 10);
  } catch (error) {
    console.error("Erro ao finalizar leitura:", error);
  }
}

/**
 * Atualiza a interface do modal de leitura
 * @param {number} currentPage - Página atual
 * @param {number} totalPages - Total de páginas
 */
function updateReadingUI(currentPage, totalPages) {
  const completion = Math.round((currentPage / totalPages) * 100);

  // Atualizar texto
  document.querySelector(".current-page").textContent = currentPage;
  document.querySelector(".completion-percentage").textContent =
    `(${completion}%)`;

  // Atualizar barra de progresso
  document.querySelector(".progress-bar").style.width = `${completion}%`;

  // Atualizar input
  document.querySelector("#page-input").value = currentPage;

  // Atualizar botões
  const prevBtn = document.querySelector('[data-action="prev-page"]');
  const nextBtn = document.querySelector('[data-action="next-page"]');
  const finishBtn = document.querySelector('[data-action="finish-reading"]');

  prevBtn.disabled = currentPage <= 0;
  nextBtn.disabled = currentPage >= totalPages;
  finishBtn.disabled = currentPage < totalPages;

  // Atualizar XP
  document.querySelector(".stat-value").textContent = `${currentPage * 10} XP`;
}

/**
 * Mostra uma notificação temporária
 * @param {string} message - Mensagem da notificação
 */
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification success";
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
