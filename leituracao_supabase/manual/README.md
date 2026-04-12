# 📋 Manual do Projeto LeiturAção

## 📖 Documentação Atualizada (Abril 2026)

Bem-vindo ao manual do **LeiturAção**! Esta documentação foi completamente reescrita para refletir a estrutura atual do projeto.

### 📂 Arquivos Disponíveis

| Arquivo                                                                | Descrição                                                                  |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [`GUIA_PROJETO_ATUAL.md`](GUIA_PROJETO_ATUAL.md)                       | **🏗️ Estrutura completa do projeto** - Como funciona, imports, arquitetura |
| [`GUIA_ADICIONAR_GENERO.md`](GUIA_ADICIONAR_GENERO.md)                 | **🎭 Como adicionar um novo gênero/categoria** - Do zero até os botões     |
| [`GUIA_ADICIONAR_CAPAS.md`](GUIA_ADICIONAR_CAPAS.md)                   | **📖 Como adicionar capas aos livros** - URLs, hospedagem, otimização      |
| [`GUIA_ADICIONAR_LINKS.md`](GUIA_ADICIONAR_LINKS.md)                   | **📚 Como adicionar links aos livros** - URLs para ler e baixar            |
| [`GUIA_BOTOES_TEMA_NOVOS_LIVROS.md`](GUIA_BOTOES_TEMA_NOVOS_LIVROS.md) | **🎨➕ Como implementar botões** - Tema dark mode e adicionar livros       |

---

## 🚀 Início Rápido

### **1. Estrutura do Projeto**

```bash
cd "/home/samuel/Documentos/claude/files (2)"
npm install -g http-server  # se não tiver
npx http-server -p 8000 -c-1 --cors
```

Abra: http://localhost:8000

### **2. Adicionar Novo Livro**

1. Escolha a categoria (ex: `data/educacao.js`)
2. Adicione o livro no array correspondente
3. Inclua campos obrigatórios + links + capa
4. Atualize estatísticas da categoria

### **3. Funcionalidades Principais**

- ✅ **Busca em tempo real** por título/autor/tema
- ✅ **Filtragem por categoria** (ENEM, Vestibular, etc.)
- ✅ **Links para ler online** e baixar PDF
- ✅ **Capas de livros** com fallback para emojis
- ✅ **Design responsivo** para mobile/desktop
- ✅ **Animações suaves** de scroll

---

## 🛠️ Desenvolvimento

### **Arquivos Principais**

- `core/main.js` - Ponto de entrada da aplicação
- `core/router.js` - Roteamento SPA (hash-based)
- `core/state.js` - Gerenciamento de estado global
- `core/animations.js` - Animações de IntersectionObserver
- `data/database.js` - Agregador de dados por categoria

### **Estrutura de Dados**

```javascript
// Cada categoria
{
  id: "educacao",
  label: "Educação & Futuro",
  emoji: "🎓",
  stats: { total: 124, free: 124, authors: 18 },
  filters: ["Todos", "ENEM", "Vestibular"],
  books: [/* array de livros */]
}

// Cada livro
{
  id: "e1",
  title: "Título",
  author: "Autor",
  summary: "Resumo",
  url: "https://...",      // Ler online
  pdfUrl: "https://...",   // Baixar PDF
  coverImage: "https://..." // Capa (opcional)
}
```

### **Como Modificar**

1. **Dados**: Edite arquivos em `data/`
2. **Lógica**: Modifique arquivos em `core/`
3. **Estilos**: Ajuste arquivos em `css/`
4. **Componentes**: Edite arquivos em `components/` e `pages/`

---

## 🎯 Funcionalidades Planejadas

### **Implementadas ✅**

- Busca e filtros
- Links para livros
- Capas de livros
- Design responsivo
- Animações

### **Pendentes 🚧**

- **Dark Mode** (veja guia de implementação)
- **Sistema de adicionar livros** (veja guia de implementação)
- **Favoritos** (localStorage)
- **Compartilhamento** (Web Share API)
- **PWA** (Service Worker)
- **Busca avançada** (tags, filtros múltiplos)

---

## 📊 Estatísticas do Projeto

- **Linhas de código**: ~3.000
- **Arquivos**: ~25
- **Livros**: ~150+ (fragmentados por categoria)
- **Categorias**: 6 (Educação, Filosofia, Literatura, Infantil, Cidadania, **Romance**) ← **NOVO!**
- **Tecnologias**: ES6 Modules, CSS Custom Properties, IntersectionObserver

---

## 🤝 Contribuição

### **Como Contribuir**

1. Leia os guias nesta pasta
2. Implemente funcionalidades seguindo a arquitetura
3. Teste em diferentes navegadores/dispositivos
4. Atualize esta documentação

### **Convenções de Código**

- **Imports nomeados** (named exports)
- **Funções puras** quando possível
- **Event delegation** para performance
- **CSS Custom Properties** para temas
- **Acessibilidade** (ARIA labels, foco)

---

## 📞 Suporte

Encontrou algum problema ou tem dúvidas?

1. **Verifique os guias** nesta pasta primeiro
2. **Teste a funcionalidade** no navegador
3. **Verifique console** do navegador (F12)
4. **Consulte imports/exports** se houver erros

---

## 📝 Changelog

### **v2.2 - Abril 2026**

- ✅ **Novo guia completo** para adicionar gêneros/categorias
- ✅ **Exemplo prático** com Ficção Científica
- ✅ **Passo a passo detalhado** desde dados até interface
- ✅ **Templates e checklists** para facilitar implementação

### **v2.1 - Abril 2026**

- ✅ **Nova categoria Romance** adicionada com 12 livros clássicos e contemporâneos
- ✅ **Livros incluídos**: Orgulho e Preconceito, Como Eu Era Antes de Você, Jane Eyre, etc.
- ✅ **Subcategorias**: Romance Clássico, Contemporâneo, Drama, Chick-lit, Histórico

### **v2.0 - Abril 2026**

- ✅ **Reorganização completa** da estrutura (pasta `core/`)
- ✅ **Fragmentação de dados** por categoria
- ✅ **Documentação reescrita** do zero
- ✅ **Guias atualizados** para estrutura atual
- ✅ **Instruções para dark mode** e adicionar livros

### **v1.0 - Inicial**

- ✅ Estrutura básica funcional
- ✅ Busca e filtros
- ✅ Links e capas básicas

---

_Última atualização: Abril 2026_
_Criado com ❤️ para a comunidade LeiturAção_</content>
<parameter name="filePath">/home/samuel/Documentos/claude/files (2)/manual/README.md



literatura 
ciencia e tecnoçogia
historia
ciencias sociais
arte e cultura
religiao e filosofia
educação e referecia