# 🎨 Guia: Como Adicionar Botão de Tema (Dark Mode)

## ✅ Status Atual

O sistema de temas **ainda não está implementado**. Este guia mostra como adicionar.

---

## 🎯 Implementação Completa do Dark Mode

### **Passo 1: Adicione estado do tema**

Edite `core/state.js`:

```javascript
// ANTES
let _state = {
  activeFilter: "Todos",
};

// DEPOIS
let _state = {
  activeFilter: "Todos",
  theme: "light", // ← novo campo
};
```

### **Passo 2: Crie funções de tema**

Adicione em `core/state.js`:

```javascript
export function toggleTheme() {
  const newTheme = _state.theme === "light" ? "dark" : "light";
  setState({ theme: newTheme });
  applyTheme(newTheme);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

export function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  setState({ theme: savedTheme });
  applyTheme(savedTheme);
}
```

### **Passo 3: Adicione variáveis CSS**

Edite `css/base.css`:

```css
:root {
  /* Tema Light (padrão) */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --accent-color: #3b82f6;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  /* Tema Dark */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --accent-color: #60a5fa;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
```

### **Passo 4: Adicione botão no HTML**

Edite `index.html` no header:

```html
<!-- Adicione no header, próximo ao título -->
<div class="header-actions">
  <button id="theme-toggle" class="theme-btn" aria-label="Alternar tema">
    <span id="theme-icon">🌙</span>
    <span class="theme-text">Modo Escuro</span>
  </button>
</div>
```

### **Passo 5: Estilize o botão**

Adicione em `css/components.css`:

```css
.theme-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-btn:hover {
  background: var(--accent-color);
  color: white;
}

.theme-text {
  font-size: 0.875rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .theme-text {
    display: none; /* Oculta texto em mobile */
  }
}
```

### **Passo 6: Conecte a funcionalidade**

Edite `core/main.js`:

```javascript
// Adicione no início da função DOMContentLoaded
initTheme(); // ← nova linha

// Dentro de initGlobalListeners()
document.getElementById("theme-toggle").addEventListener("click", () => {
  toggleTheme();
  updateThemeButton();
});

// Adicione esta função
function updateThemeButton() {
  const theme = getState().theme;
  const icon = document.getElementById("theme-icon");
  const text = document.querySelector(".theme-text");

  if (theme === "dark") {
    icon.textContent = "☀️";
    text.textContent = "Modo Claro";
  } else {
    icon.textContent = "🌙";
    text.textContent = "Modo Escuro";
  }
}

// Chame na inicialização
updateThemeButton();
```

### **Passo 7: Importe as novas funções**

Adicione em `core/main.js`:

```javascript
import { setState, getState, toggleTheme, initTheme } from "./state.js";
```

---

# ➕ Guia: Como Adicionar Botão "Novo Livro"

## ✅ Status Atual

O sistema de adicionar livros **ainda não está implementado**. Este guia mostra como adicionar.

---

## 🎯 Implementação Completa do Sistema de Adição

### **Passo 1: Adicione botão na interface**

Edite `pages/HomePage.js` ou `index.html`:

```html
<!-- Adicione no header ou hero section -->
<button id="add-book-btn" class="add-book-btn">
  <span class="add-icon">➕</span>
  <span class="add-text">Novo Livro</span>
</button>
```

### **Passo 2: Crie o modal de formulário**

Adicione função em `core/main.js`:

```javascript
function createAddBookModal() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Adicionar Novo Livro</h3>
        <button class="modal-close" aria-label="Fechar">&times;</button>
      </div>
      <form id="add-book-form" class="modal-body">
        <div class="form-group">
          <label for="book-title">Título *</label>
          <input id="book-title" name="title" type="text" required>
        </div>

        <div class="form-group">
          <label for="book-author">Autor *</label>
          <input id="book-author" name="author" type="text" required>
        </div>

        <div class="form-group">
          <label for="book-category">Categoria *</label>
          <select id="book-category" name="category" required>
            <option value="">Selecione uma categoria</option>
            ${Object.values(CATEGORIES)
              .map((cat) => `<option value="${cat.id}">${cat.label}</option>`)
              .join("")}
          </select>
        </div>

        <div class="form-group">
          <label for="book-summary">Resumo *</label>
          <textarea id="book-summary" name="summary" rows="3" required></textarea>
        </div>

        <div class="form-group">
          <label for="book-url">Link para Ler (opcional)</label>
          <input id="book-url" name="url" type="url" placeholder="https://...">
        </div>

        <div class="form-group">
          <label for="book-pdf">Link do PDF (opcional)</label>
          <input id="book-pdf" name="pdfUrl" type="url" placeholder="https://...">
        </div>

        <div class="form-group">
          <label for="book-cover">URL da Capa (opcional)</label>
          <input id="book-cover" name="coverImage" type="url" placeholder="https://...">
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="btn-primary">Adicionar Livro</button>
        </div>
      </form>
    </div>
  `;
  return modal;
}
```

### **Passo 3: Adicione estilos do modal**

Adicione em `css/components.css`:

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.add-book-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.add-book-btn:hover {
  opacity: 0.9;
}
```

### **Passo 4: Implemente a lógica**

Adicione funções em `core/main.js`:

```javascript
// Função para mostrar modal
function showAddBookModal() {
  const modal = createAddBookModal();
  document.body.appendChild(modal);

  // Focar no primeiro campo
  setTimeout(() => {
    document.getElementById("book-title").focus();
  }, 100);
}

// Função para fechar modal
function closeModal() {
  const modal = document.querySelector(".modal-overlay");
  if (modal) {
    modal.remove();
  }
}

// Função para gerar ID único
function generateBookId(category) {
  const categoryBooks = CATEGORIES[category].books;
  const maxId = Math.max(
    ...categoryBooks.map((book) => {
      const num = parseInt(book.id.slice(1)); // Remove prefixo (e, f, l, etc.)
      return isNaN(num) ? 0 : num;
    }),
  );
  return category[0] + (maxId + 1); // Ex: e1, f1, l1
}

// Função para adicionar livro
function addBookToCategory(categoryId, bookData) {
  // Em um app real, isso seria uma chamada API
  // Por enquanto, apenas log
  console.log("Novo livro adicionado:", { categoryId, bookData });

  // Atualizar estatísticas da categoria
  const category = CATEGORIES[categoryId];
  category.stats.total += 1;
  category.stats.free += 1; // Assumindo que é gratuito

  // Aqui você precisaria persistir os dados
  // Por exemplo: localStorage, IndexedDB, ou API
}
```

### **Passo 5: Conecte os eventos**

Adicione em `core/main.js`:

```javascript
// Dentro de initGlobalListeners()

// Botão de adicionar livro
document.addEventListener("click", (e) => {
  if (e.target.id === "add-book-btn" || e.target.closest("#add-book-btn")) {
    showAddBookModal();
  }
});

// Fechar modal
document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("modal-overlay") ||
    e.target.classList.contains("modal-close")
  ) {
    closeModal();
  }
});

// Submissão do formulário
document.addEventListener("submit", (e) => {
  if (e.target.id === "add-book-form") {
    e.preventDefault();

    const formData = new FormData(e.target);
    const category = formData.get("category");

    const newBook = {
      id: generateBookId(category),
      title: formData.get("title"),
      author: formData.get("author"),
      summary: formData.get("summary"),
      cover: `cover-${category}-${Date.now()}`, // Placeholder
      emoji: "📖", // Default
      badge: "free", // Default
      size: "TBD", // A ser determinado
      cat: CATEGORIES[category].label.split(" ")[0], // Primeira palavra
      url: formData.get("url") || "",
      pdfUrl: formData.get("pdfUrl") || "",
      coverImage: formData.get("coverImage") || "",
    };

    addBookToCategory(category, newBook);
    closeModal();

    // Feedback para usuário
    alert("Livro adicionado com sucesso! (Em desenvolvimento)");

    // Recarregar página para mostrar mudanças
    // navigate('/'); // Quando implementar persistência
  }
});
```

### **Passo 6: ESC para fechar modal**

Adicione em `core/main.js`:

```javascript
// Dentro de initGlobalListeners()
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});
```

---

## 🚀 Próximos Passos

### **Para Tema (Dark Mode):**

1. Implemente as mudanças acima
2. Teste a alternância de tema
3. Ajuste cores se necessário
4. Adicione mais variáveis CSS para componentes

### **Para Adicionar Livros:**

1. Implemente as mudanças acima
2. Adicione sistema de persistência (localStorage/IndexedDB)
3. Implemente validação de formulário
4. Adicione upload de imagens
5. Implemente edição/remoção de livros

---

## ⚠️ Notas Importantes

- **Persistência**: Os exemplos acima não salvam dados permanentemente
- **Validação**: Adicione validação robusta para produção
- **Acessibilidade**: Modais precisam de foco adequado e ARIA labels
- **Responsividade**: Teste em mobile e desktop
- **Performance**: Evite re-renders desnecessários

---

_Última atualização: Abril 2026_</content>
<parameter name="filePath">/home/samuel/Documentos/claude/files (2)/manual/GUIA_BOTOES_TEMA_NOVOS_LIVROS.md
