/** Lista única de categorias do acervo (navbar + home + página Acervo). */
export const ACERVO_CATEGORIES = [
  { icon: "🎓", name: "Educação", route: "educacao" },
  { icon: "📚", name: "Literatura", route: "literatura" },
  { icon: "🔬", name: "Ciência", route: "ciencia" },
  { icon: "🏛️", name: "História", route: "historia" },
  { icon: "👥", name: "Sociais", route: "sociais" },
  { icon: "🎨", name: "Arte", route: "arte" },
  { icon: "🙏", name: "Religião", route: "religiao" },
  { icon: "🧠", name: "Filosofia", route: "filosofia" },
];

const ROUTE_SET = new Set(ACERVO_CATEGORIES.map((c) => c.route));

/** Rota atual pertence à área Acervo (hub ou categoria). */
export function isAcervoSection(currentPage) {
  return currentPage === "acervo" || ROUTE_SET.has(currentPage);
}
