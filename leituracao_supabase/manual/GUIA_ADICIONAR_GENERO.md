# 📚 Guia Completo: Como Adicionar um Novo Gênero

## 🎯 Exemplo Prático: Adicionando "Ficção Científica"

### **Passo 1: Criar arquivo de dados da categoria**

Crie `data/ficcao-cientifica.js`:

```javascript
/**
 * data/ficcao-cientifica.js
 * Livros da categoria Ficção Científica
 */

export const ficcaoCientificaBooks = [
  {
    id: "fc1",
    title: "Duna",
    author: "Frank Herbert",
    summary:
      "Em um futuro distante, Paul Atreides enfrenta intrigas políticas e ecológicas no planeta deserto Arrakis.",
    cover: "cover-fc-1",
    emoji: "🌌",
    badge: "free",
    size: "4.2MB",
    cat: "Space Opera",
    url: "https://www.gutenberg.org/files/64316/64316-h/64316-h.htm",
    pdfUrl: "https://www.gutenberg.org/files/64316/64316-pdf.pdf",
    coverImage:
      "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=400&fit=crop",
  },
  {
    id: "fc2",
    title: "Neuromancer",
    author: "William Gibson",
    summary:
      "Um hacker cibernético é contratado para o trabalho perfeito em um mundo de realidade virtual e IA.",
    cover: "cover-fc-2",
    emoji: "💻",
    badge: "free",
    size: "2.8MB",
    cat: "Cyberpunk",
    url: "https://www.gutenberg.org/files/50013/50013-h/50013-h.htm",
    pdfUrl: "https://www.gutenberg.org/files/50013/50013-pdf.pdf",
    coverImage:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop",
  },
  // ... mais livros
];
```

### **Passo 2: Atualizar database.js**

Adicione o import e a categoria:

```javascript
// Adicionar import no topo
import { ficcaoCientificaBooks } from "./ficcao-cientifica.js";

// Adicionar na seção CATEGORIES
ficcaoCientifica: {
  id: "ficcao-cientifica",
  label: "Ficção Científica",
  emoji: "🚀",
  eyebrowClass: "eyebrow-blue",
  badgeClass: "cat-label-fc",
  color: "#2563EB",
  bg: "#DBEAFE",
  desc: "Explorando futuros alternativos, tecnologias avançadas e questões filosóficas sobre humanidade e progresso.",
  stats: { total: 2, free: 2, authors: 2 },
  filters: ["Todos", "Space Opera", "Cyberpunk", "Distopia", "Hard Sci-Fi"],
  books: ficcaoCientificaBooks,
}
```

### **Passo 3: Adicionar estilos CSS**

Edite `css/components.css`:

```css
/* Classe para eyebrow */
.eyebrow-blue {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

/* Classe para badges */
.cat-label-fc {
  background: #dbeafe;
  color: #2563eb;
}
```

### **Passo 4: Testar a implementação**

Execute estes comandos:

```bash
# Verificar sintaxe
node --check data/ficcao-cientifica.js
node --check data/database.js

# Testar carregamento
node -e "
async function test() {
  try {
    const { CATEGORIES } = await import('./data/database.js');
    console.log('✅ Nova categoria carregada!');
    console.log('📚 Gêneros:', Object.keys(CATEGORIES).length);
    console.log('📖 FC books:', CATEGORIES['ficcao-cientifica'].books.length);
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
}
test();
"
```

### **Passo 5: Iniciar servidor e testar**

```bash
# Matar processos existentes
pkill -9 -f "http-server"

# Iniciar servidor
npx http-server -p 8000 -c-1 --cors

# Abrir navegador
# http://localhost:8000
```

---

## 📋 Checklist Completo para Novo Gênero

### **✅ Arquivos a Criar/Editar:**

1. **`data/{genero}.js`** - Arquivo com array de livros
2. **`data/database.js`** - Adicionar import e categoria
3. **`css/components.css`** - Estilos para cores da categoria

### **✅ Estrutura do Livro:**

```javascript
{
  id: "{prefixo}{numero}",     // fc1, fc2, etc.
  title: "Título do Livro",
  author: "Nome do Autor",
  summary: "Descrição curta",
  cover: "cover-{prefixo}-{numero}",
  emoji: "🚀",                  // Emoji representativo
  badge: "free",               // free, new, premium
  size: "2.5MB",              // Tamanho aproximado
  cat: "Subcategoria",        // Space Opera, Cyberpunk, etc.
  url: "https://...",         // Link para ler
  pdfUrl: "https://...",      // Link para PDF
  coverImage: "https://..."   // URL da capa (opcional)
}
```

### **✅ Cores da Categoria:**

- **Color**: Cor principal (#2563EB)
- **BG**: Fundo claro (#DBEAFE)
- **Eyebrow**: Gradiente para cabeçalho
- **Badge**: Cor para labels

### **✅ Prefixos Sugeridos:**

- **Ficção Científica**: `fc` (fc1, fc2...)
- **Terror**: `t` (t1, t2...)
- **Biografias**: `b` (b1, b2...)
- **Poesia**: `p` (p1, p2...)

### **✅ Subcategorias Comuns:**

- **Ficção Científica**: Space Opera, Cyberpunk, Distopia, Hard Sci-Fi
- **Romance**: Clássico, Contemporâneo, Chick-lit, Histórico
- **Terror**: Sobrenatural, Psicológico, Gore, Suspense

---

## 🎨 Paleta de Cores Sugerida

| Gênero            | Color   | BG      | Descrição         |
| ----------------- | ------- | ------- | ----------------- |
| Ficção Científica | #2563EB | #DBEAFE | Azul científico   |
| Terror            | #7C2D12 | #FEF3C7 | Marrom escuro     |
| Biografias        | #166534 | #D1FAE5 | Verde oliva       |
| Poesia            | #BE185D | #FCE7F3 | Rosa poesia       |
| História          | #92400E | #FED7AA | Laranja histórico |
| Autoajuda         | #365314 | #ECFCCB | Verde menta       |

---

## 🔍 Como Encontrar Livros

### **Fontes Gratuitas:**

1. **Project Gutenberg**: https://www.gutenberg.org
2. **Open Library**: https://openlibrary.org
3. **Internet Archive**: https://archive.org
4. **Domínio Público Brasil**: https://www.dominiopublico.gov.br

### **Para Capas:**

1. **Unsplash**: https://unsplash.com (buscar por título/autor)
2. **Open Library Covers**: https://covers.openlibrary.org
3. **Google Images**: Buscar com direitos autorais livres

---

## 🚀 Próximos Passos

1. **Escolha um gênero** que você quer adicionar
2. **Pesquise livros** no Project Gutenberg
3. **Crie o arquivo** seguindo o template acima
4. **Atualize o database** com a nova categoria
5. **Adicione estilos** CSS
6. **Teste tudo** no navegador

Quer que eu te ajude a adicionar um gênero específico agora? 🚀</content>
<parameter name="filePath">/home/samuel/Documentos/claude/files (2)/manual/GUIA_ADICIONAR_GENERO.md
