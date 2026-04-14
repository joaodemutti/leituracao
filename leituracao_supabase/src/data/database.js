/**
 * js/data/database.js
 *
 * RESPONSABILIDADE ÚNICA: Apenas dados.
 * Este arquivo não contém lógica, manipulação de DOM nem estilos.
 * Se precisar adicionar um livro ou categoria, este é o único lugar a editar.
 *
 * Padrão: Exportações nomeadas (named exports) para que os módulos
 * importem apenas o que precisam — melhor para performance e leitura.
 */

import { educacaoBooks } from "./educacao.js";
import { filosofiaBooks } from "./filosofia.js";
import { literaturaBooks } from "./literatura.js";
import { cienciaBooks } from "./ciencia.js";
import { historiaBooks } from "./historia.js";
import { sociaisBooks } from "./sociais.js";
import { arteBooks } from "./arte.js";
import { religiaoBooks } from "./religiao.js";

/** @type {Record<string, import('./state.js').Category>} */
export const CATEGORIES = {
  educacao: {
    id: "educacao",
    label: "Educação & Futuro",
    emoji: "🎓",
    eyebrowClass: "eyebrow-green",
    badgeClass: "cat-label-edu",
    color: "#065F46",
    bg: "#D1FAE5",
    desc: "Ferramentas para transformar conhecimento em oportunidade. Apostilas para o ENEM, guias de carreira, finanças pessoais e currículo — tudo para abrir portas.",
    stats: { total: 124, free: 124, authors: 18 },
    filters: [
      "Todos",
      "ENEM",
      "Vestibular",
      "Finanças",
      "Currículo",
      "Idiomas",
    ],
    books: educacaoBooks,
  },
  filosofia: {
    id: "filosofia",
    label: "Filosofia & Pensamento",
    emoji: "🧠",
    eyebrowClass: "eyebrow-purple",
    badgeClass: "cat-label-fil",
    color: "#6D28D9",
    bg: "#EDE9FE",
    desc: "Obras que provocam reflexão, questionamento e expansão da mente. De clássicos da filosofia a ensaios contemporâneos sobre ética, política e existência.",
    stats: { total: 4, free: 4, authors: 4 },
    filters: [
      "Todos",
      "Filosofia Clássica",
      "Filosofia Moderna",
      "Ética",
      "Política",
      "Existencialismo",
    ],
    books: filosofiaBooks,
  },
  literatura: {
    id: "literatura",
    label: "Tesouros da Literatura",
    emoji: "📚",
    eyebrowClass: "eyebrow-navy",
    badgeClass: "cat-label-lit",
    color: "#1e40af",
    bg: "#DBEAFE",
    desc: "Os maiores clássicos da literatura brasileira e mundial em domínio público. Patrimônio cultural de toda a humanidade, agora acessível para todos.",
    stats: { total: 230, free: 230, authors: 47 },
    filters: [
      "Todos",
      "Machado de Assis",
      "Modernismo",
      "Romantismo",
      "Realismo",
      "Poesia",
    ],
    books: literaturaBooks,
  },
  ciencia: {
    id: "ciencia",
    label: "Ciência e Tecnologia",
    emoji: "🔬",
    eyebrowClass: "eyebrow-blue",
    badgeClass: "cat-label-ciencia",
    color: "#1e40af",
    bg: "#DBEAFE",
    desc: "Descobertas científicas, inovações tecnológicas e conhecimento que moldam o futuro. De biologia a física quântica, explore os mistérios do universo.",
    stats: { total: 156, free: 156, authors: 32 },
    filters: [
      "Todos",
      "Biologia",
      "Física",
      "Química",
      "Tecnologia",
      "Astronomia",
    ],
    books: cienciaBooks,
  },
  historia: {
    id: "historia",
    label: "História",
    emoji: "🏛️",
    eyebrowClass: "eyebrow-brown",
    badgeClass: "cat-label-historia",
    color: "#92400e",
    bg: "#FEF3C7",
    desc: "Jornadas através do tempo que revelam as origens da humanidade. De civilizações antigas às guerras mundiais, compreenda como chegamos até aqui.",
    stats: { total: 98, free: 98, authors: 25 },
    filters: [
      "Todos",
      "História Antiga",
      "Idade Média",
      "Idade Moderna",
      "História Brasileira",
      "Guerras Mundiais",
    ],
    books: historiaBooks,
  },
  sociais: {
    id: "sociais",
    label: "Ciências Sociais",
    emoji: "👥",
    eyebrowClass: "eyebrow-gray",
    badgeClass: "cat-label-sociais",
    color: "#374151",
    bg: "#F3F4F6",
    desc: "Estudos sobre sociedade, comportamento humano e instituições. Sociologia, economia, direito e antropologia para entender como funcionam as comunidades.",
    stats: { total: 112, free: 112, authors: 28 },
    filters: [
      "Todos",
      "Sociologia",
      "Economia",
      "Direito",
      "Antropologia",
      "Política",
    ],
    books: sociaisBooks,
  },
  arte: {
    id: "arte",
    label: "Arte e Cultura",
    emoji: "🎨",
    eyebrowClass: "eyebrow-pink",
    badgeClass: "cat-label-arte",
    color: "#be185d",
    bg: "#fce7f3",
    desc: "Expressões artísticas e manifestações culturais que enriquecem a alma humana. Pintura, música, teatro e tradições que conectam passado e presente.",
    stats: { total: 89, free: 89, authors: 21 },
    filters: [
      "Todos",
      "Artes Plásticas",
      "Música",
      "Teatro",
      "Cinema",
      "Literatura",
    ],
    books: arteBooks,
  },
  religiao: {
    id: "religiao",
    label: "Religião",
    emoji: "🙏",
    eyebrowClass: "eyebrow-indigo",
    badgeClass: "cat-label-religiao",
    color: "#3730a3",
    bg: "#e0e7ff",
    desc: "Textos sagrados, estudos teológicos e reflexões espirituais. Uma jornada de fé, ética e compreensão do divino através das grandes tradições religiosas.",
    stats: { total: 67, free: 67, authors: 15 },
    filters: [
      "Todos",
      "Cristianismo",
      "Islamismo",
      "Judaísmo",
      "Budismo",
      "Filosofia Religiosa",
    ],
    books: religiaoBooks,
  },
};

/**
 * Livros em destaque exibidos no banner da Home.
 * Array separado para facilitar curadoria editorial sem mexer nas categorias.
 */
export const FEATURED_BOOKS = [
  {
    title: "Dom Casmurro",
    author: "Machado de Assis",
    cover: "cover-lit-1",
    emoji: "📖",
  },
  {
    title: "Redação Nota 1000",
    author: "Prof. Marcos Lima",
    cover: "cover-edu-3",
    emoji: "📝",
  },
  {
    title: "A Menina das Estrelas",
    author: "Maria Souza",
    cover: "cover-kid-2",
    emoji: "🌈",
  },
];
