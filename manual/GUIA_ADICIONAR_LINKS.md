# 📚 Guia: Como Adicionar Links aos Livros (2026)

## ✅ Sistema Atual de Links

O sistema de links já está implementado e funcionando:

- ✅ **Botões "Ler Online"** e **"Baixar PDF"** nos cards
- ✅ **Função `findBookById()`** para localizar livros
- ✅ **Event delegation** para botões dinâmicos
- ✅ **Links externos** abrem em nova aba

---

## 🎯 Estrutura de Links por Livro

Cada livro precisa de dois campos de link:

```javascript
{
  id: "e1",
  title: "Matemática Completa...",
  // ...outros campos obrigatórios...

  // ✅ LINKS (obrigatórios para funcionalidade completa)
  url: "https://biblioteca.com/livros/matematica-enem",     // Ler online
  pdfUrl: "https://biblioteca.com/pdf/matematica-enem.pdf"  // Baixar PDF
}
```

---

## 📋 Como Adicionar Links a Livros Existentes

### **Passo 1: Localize o livro**

Encontre o livro no arquivo da categoria correspondente:

- `data/educacao.js` → livros de educação
- `data/literatura.js` → livros de literatura
- etc.

### **Passo 2: Adicione os campos de link**

```javascript
// ANTES
{
  id: "e1",
  title: "Matemática Completa para o ENEM",
  author: "Equipe LeiturAção",
  summary: "...",
  // ...outros campos
}

// DEPOIS
{
  id: "e1",
  title: "Matemática Completa para o ENEM",
  author: "Equipe LeiturAção",
  summary: "...",
  // ...outros campos
  url: "https://exemplo.com/livros/matematica-enem",
  pdfUrl: "https://exemplo.com/pdf/matematica-enem.pdf"
}
```

### **Passo 3: Teste os links**

1. Abra: `http://localhost:8000`
2. Navegue até o livro
3. Clique em "Ler Online" e "Baixar PDF"
4. Verifique se abrem corretamente

---

## 🌐 Estratégias para URLs

### **Opção 1: Biblioteca Própria**

Hospede os livros no seu próprio servidor:

```
Base URL: https://biblioteca.leituracao.com/

Ler:     https://biblioteca.leituracao.com/livros/{slug}
Baixar:  https://biblioteca.leituracao.com/pdf/{slug}.pdf
```

**Exemplo:**

```javascript
{
  id: "e1",
  url: "https://biblioteca.leituracao.com/livros/matematica-enem",
  pdfUrl: "https://biblioteca.leituracao.com/pdf/matematica-enem.pdf"
}
```

### **Opção 2: Serviços Externos**

Use plataformas existentes:

**Google Drive:**

```
Ler:     https://drive.google.com/file/d/{FILE_ID}/view
Baixar:  https://drive.google.com/uc?export=download&id={FILE_ID}
```

**Dropbox:**

```
Ler:     https://www.dropbox.com/s/{FILE_ID}/livro.pdf?dl=0
Baixar:  https://www.dropbox.com/s/{FILE_ID}/livro.pdf?dl=1
```

**GitHub (para PDFs pequenos):**

```
Ler:     https://github.com/user/repo/raw/main/livros/livro.pdf
Baixar:  https://github.com/user/repo/raw/main/livros/livro.pdf
```

### **Opção 3: Gutenberg Project**

Para livros clássicos públicos:

```javascript
{
  id: "l1",
  title: "Dom Casmurro",
  url: "https://www.gutenberg.org/cache/epub/55752/pg55752-images.html",
  pdfUrl: "https://www.gutenberg.org/cache/epub/55752/pg55752.pdf"
}
```

---

## 🔍 Como Encontrar Links para Livros

### **Fontes Recomendadas:**

1. **Projeto Gutenberg** (gratuito, domínio público)
   - Site: https://www.gutenberg.org
   - Milhares de livros clássicos
   - Links diretos para HTML e PDF

2. **Bibliotecas Digitais**
   - Domínio Público (Brasil): https://www.dominiopublico.gov.br
   - Biblioteca Nacional: https://www.bn.gov.br
   - SciELO: https://www.scielo.org

3. **Plataformas Educacionais**
   - Khan Academy: https://pt.khanacademy.org
   - Coursera: https://pt.coursera.org
   - edX: https://www.edx.org

4. **Editoras com Acesso Aberto**
   - ManyBooks: https://manybooks.net
   - Open Library: https://openlibrary.org
   - Internet Archive: https://archive.org

### **Ferramentas de Busca:**

- **Google Scholar**: https://scholar.google.com
- **ResearchGate**: https://www.researchgate.net
- **Academia.edu**: https://www.academia.edu

---

## 📊 Exemplo Completo

```javascript
// data/educacao.js
export const educacaoBooks = [
  {
    id: "e1",
    title: "Matemática Completa para o ENEM",
    author: "Equipe LeiturAção",
    summary: "Do básico ao avançado...",
    cover: "cover-edu-1",
    emoji: "📐",
    badge: "free",
    size: "4.2MB",
    cat: "ENEM",
    url: "https://www.gutenberg.org/cache/epub/52782/pg52782-images.html",
    pdfUrl: "https://www.gutenberg.org/cache/epub/52782/pg52782.pdf",
    coverImage:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300",
  },
  {
    id: "e2",
    title: "Biologia & Ecossistemas",
    author: "Profa. Carla Mendes",
    summary: "Células, genética...",
    cover: "cover-edu-2",
    emoji: "🧬",
    badge: "free",
    size: "3.8MB",
    cat: "ENEM",
    url: "https://biblioteca.leituracao.com/livros/biologia-ecossistemas",
    pdfUrl: "https://biblioteca.leituracao.com/pdf/biologia-ecossistemas.pdf",
    coverImage:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=300",
  },
];
```

---

## ⚠️ Dicas Importantes

- ✅ **URLs válidas**: Sempre teste se os links funcionam
- ✅ **HTTPS**: Prefira HTTPS para segurança
- ✅ **Links externos**: Abrem em nova aba automaticamente
- ✅ **Fallback**: Sistema funciona mesmo sem links (botões ficam ocultos)
- ✅ **Acessibilidade**: Botões têm labels adequadas
- ✅ **Performance**: Links não afetam carregamento da página

---

## 🚀 Próximos Passos

1. **Escolha uma fonte** para hospedar os livros
2. **Adicione links** aos livros mais populares primeiro
3. **Teste todos os links** em diferentes navegadores
4. **Documente** suas fontes para manutenção futura

---

_Última atualização: Abril 2026_</content>
<parameter name="filePath">/home/samuel/Documentos/claude/files (2)/manual/GUIA_ADICIONAR_LINKS.md
