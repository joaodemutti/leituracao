# 📋 Guia da Estrutura do Projeto LeiturAção

## 🏗️ Arquitetura Atual (2026)

### **Estrutura de Pastas**

```
📦 Projeto LeiturAção
├── 📂 core/              # ← Núcleo da aplicação
│   ├── main.js           # Ponto de entrada
│   ├── router.js         # Roteamento SPA
│   ├── state.js          # Gerenciamento de estado
│   └── animations.js     # Animações de scroll
├── 📂 components/        # Componentes reutilizáveis
│   ├── BookCard.js       # Card de livro
│   └── CategoryPage.js   # Página de categoria
├── 📂 pages/             # Páginas principais
│   └── HomePage.js       # Página inicial
├── 📂 services/          # Serviços e lógica
│   └── SearchService.js  # Busca e filtros
├── 📂 data/              # Dados fragmentados
│   ├── database.js       # Agregador de dados
│   ├── educacao.js       # Livros de educação (124 livros)
│   ├── filosofia.js      # Livros de filosofia (4 livros)
│   ├── literatura.js     # Livros de literatura (32 livros)
│   ├── infantil.js       # Livros infantis (23 livros)
│   ├── cidadania.js      # Livros de cidadania (68 livros)
│   └── romance.js        # Livros de romance (12 livros) ← NOVO!
├── 📂 css/               # Estilos
│   ├── base.css          # Estilos base
│   ├── components.css    # Componentes
│   └── layout.css        # Layout
└── index.html            # Arquivo principal
```

### **Fluxo de Imports (Correto)**

```
core/main.js
├── ../data/database.js (CATEGORIES)
├── ./router.js (navigate, registerRoutes, initRouter, updateActiveNav)
├── ./state.js (setState)
├── ./animations.js (initScrollAnimations)
├── ../services/SearchService.js (searchBooks, filterByCategory)
├── ../pages/HomePage.js (HomePage)
├── ../components/CategoryPage.js (CategoryPage, EmptyGridHtml)
└── ../components/BookCard.js (BookCard)
```

### **Responsabilidades por Arquivo**

#### **core/main.js**

- ✅ Importa todos os módulos
- ✅ Inicializa event listeners globais
- ✅ Conecta componentes e serviços
- ✅ Gerencia ciclo de vida da app

#### **core/router.js**

- ✅ Roteamento baseado em hash (#/)
- ✅ Registro de rotas
- ✅ Navegação programática
- ✅ Atualização da navegação ativa

#### **core/state.js**

- ✅ Estado global da aplicação
- ✅ Getters e setters centralizados
- ✅ Gerenciamento de filtros ativos

#### **core/animations.js**

- ✅ Animações de scroll (IntersectionObserver)
- ✅ Efeitos visuais suaves

#### **data/database.js**

- ✅ Agregador de todas as categorias
- ✅ Exporta CATEGORIES (objeto principal)
- ✅ Importa livros de arquivos específicos

#### **Estrutura de Dados**

```javascript
// Cada categoria
{
  id: "educacao",
  label: "Educação & Futuro",
  emoji: "🎓",
  color: "#065F46",
  bg: "#D1FAE5",
  desc: "Descrição da categoria...",
  stats: { total: 124, free: 124, authors: 18 },
  filters: ["Todos", "ENEM", "Vestibular", ...],
  books: educacaoBooks // Array de livros
}

// Cada livro
{
  id: "e1",
  title: "Título do Livro",
  author: "Autor",
  summary: "Resumo...",
  cover: "cover-edu-1",
  emoji: "📐",
  badge: "free",
  size: "4.2MB",
  cat: "ENEM",
  url: "https://...",      // Link para ler online
  pdfUrl: "https://...",   // Link para baixar PDF
  coverImage: "https://..." // URL da capa (opcional)
}
```

### **Como Adicionar Novos Livros**

1. **Escolha a categoria** (ex: `educacao.js`)
2. **Adicione o livro** no array correspondente:

```javascript
export const educacaoBooks = [
  // ...livros existentes...
  {
    id: "e999", // ID único (incremental)
    title: "Novo Livro de Matemática",
    author: "Prof. Silva",
    summary: "Conteúdo completo...",
    cover: "cover-edu-999",
    emoji: "📐",
    badge: "free",
    size: "2.1MB",
    cat: "ENEM",
    url: "https://biblioteca.com/livro",
    pdfUrl: "https://biblioteca.com/pdf",
    coverImage: "https://cdn.com/capa.jpg", // opcional
  },
];
```

3. **Atualize as estatísticas** em `database.js`:

```javascript
stats: { total: 125, free: 125, authors: 19 }, // +1 livro
```

### **Como Adicionar Nova Categoria**

1. **Crie arquivo** em `data/novacategoria.js`:

```javascript
export const novaCategoriaBooks = [
  {
    id: "n1",
    title: "Primeiro Livro",
    // ...campos obrigatórios...
  },
];
```

2. **Importe** em `database.js`:

```javascript
import { novaCategoriaBooks } from "./novaCategoria.js";
```

3. **Adicione** ao objeto CATEGORIES:

```javascript
export const CATEGORIES = {
  // ...categorias existentes...
  novaCategoria: {
    id: "novaCategoria",
    label: "Nova Categoria",
    emoji: "✨",
    eyebrowClass: "eyebrow-blue",
    badgeClass: "cat-label-new",
    color: "#2563EB",
    bg: "#DBEAFE",
    desc: "Descrição da nova categoria...",
    stats: { total: 1, free: 1, authors: 1 },
    filters: ["Todos"],
    books: novaCategoriaBooks,
  },
};
```

### **Como Adicionar Botão de Tema (Dark Mode)**

1. **Adicione estado** em `core/state.js`:

```javascript
let _state = {
  activeFilter: "Todos",
  theme: "light", // ← novo campo
};
```

2. **Crie função** para alternar tema:

```javascript
export function toggleTheme() {
  const newTheme = _state.theme === "light" ? "dark" : "light";
  setState({ theme: newTheme });
  document.documentElement.setAttribute("data-theme", newTheme);
}
```

3. **Adicione botão** no HTML (ex: header):

```html
<button id="theme-toggle" aria-label="Alternar tema">
  <span id="theme-icon">🌙</span>
</button>
```

4. **Implemente estilos** em `css/base.css`:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1f2937;
  /* ...outras variáveis... */
}

[data-theme="dark"] {
  --bg-primary: #1f2937;
  --text-primary: #ffffff;
  /* ...overrides para dark mode... */
}
```

5. **Conecte evento** em `core/main.js`:

```javascript
// Dentro de initGlobalListeners()
document.getElementById("theme-toggle").addEventListener("click", () => {
  toggleTheme();
  updateThemeIcon();
});

function updateThemeIcon() {
  const icon = document.getElementById("theme-icon");
  icon.textContent = getState().theme === "light" ? "🌙" : "☀️";
}
```

### **Como Adicionar Botão "Novo Livro"**

1. **Adicione botão** na interface (ex: header ou página):

```html
<button id="add-book-btn" class="btn-primary">➕ Novo Livro</button>
```

2. **Implemente modal/formulário**:

```javascript
function showAddBookModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Adicionar Novo Livro</h3>
      <form id="add-book-form">
        <input name="title" placeholder="Título" required>
        <input name="author" placeholder="Autor" required>
        <select name="category" required>
          <option value="">Selecione categoria</option>
          ${Object.values(CATEGORIES)
            .map((cat) => `<option value="${cat.id}">${cat.label}</option>`)
            .join("")}
        </select>
        <textarea name="summary" placeholder="Resumo" required></textarea>
        <input name="url" placeholder="URL para ler" type="url">
        <input name="pdfUrl" placeholder="URL do PDF" type="url">
        <input name="coverImage" placeholder="URL da capa" type="url">
        <div class="modal-actions">
          <button type="button" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="btn-primary">Adicionar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
}
```

3. **Conecte evento** em `core/main.js`:

```javascript
document
  .getElementById("add-book-btn")
  .addEventListener("click", showAddBookModal);

document.addEventListener("submit", (e) => {
  if (e.target.id === "add-book-form") {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newBook = {
      id: generateId(),
      title: formData.get("title"),
      author: formData.get("author"),
      summary: formData.get("summary"),
      // ...outros campos...
    };
    addBookToCategory(formData.get("category"), newBook);
    closeModal();
    navigate("/"); // Recarrega home
  }
});
```

### **Dicas de Desenvolvimento**

- ✅ **Sempre teste** após mudanças em dados
- ✅ **Mantenha IDs únicos** (use prefixos: e1, f1, l1, etc.)
- ✅ **Valide URLs** antes de adicionar
- ✅ **Atualize estatísticas** quando adicionar/remover livros
- ✅ **Use emojis consistentes** por categoria
- ✅ **Teste responsividade** em mobile
- ✅ **Valide acessibilidade** (ARIA labels, foco, etc.)

---

_Última atualização: Abril 2026_</content>
<parameter name="filePath">/home/samuel/Documentos/claude/files (2)/manual/GUIA_PROJETO_ATUAL.md
