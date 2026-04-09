# 📖 Guia: Como Adicionar Capas dos Livros (2026)

## ✅ Estrutura Atual

O sistema de capas já está implementado e funcionando. Cada livro pode ter uma `coverImage` opcional.

### **Como Funciona**

- ✅ **BookCard.js** renderiza `<img>` quando `coverImage` existe
- ✅ **Fallback automático**: emoji + título se não houver imagem
- ✅ **Lazy loading**: imagens carregam apenas quando visíveis
- ✅ **Responsivo**: capas se adaptam ao tamanho do card

---

## 🎯 3 Formas de Adicionar Imagens

### **Opção 1: URLs Externas (Recomendado)**

Hospede as imagens em um CDN e use URLs completas:

```javascript
{
  id: 'e1',
  title: 'Matemática Completa para o ENEM',
  // ...outros campos...
  coverImage: 'https://seu-cdn.com/capas/matematica-enem.jpg',
}
```

**Provedores recomendados:**

- **Cloudinary** (gratuito, otimizado): https://cloudinary.com
- **Imgur** (rápido): https://imgur.com
- **GitHub** (para projetos open source): https://github.com/user/repo/raw/main/images/
- **Seu próprio servidor**

### **Opção 2: Arquivos Locais**

Se as imagens estão na mesma pasta do projeto:

```javascript
{
  id: 'e1',
  title: 'Matemática Completa...',
  coverImage: './images/capas/matematica-enem.jpg',
}
```

**Estrutura sugerida:**

```
/home/samuel/Documentos/claude/files (2)/
├── index.html
├── core/
├── data/
├── images/
│   └── capas/
│       ├── matematica-enem.jpg
│       ├── biologia-ecos.jpg
│       └── ...
└── ...
```

### **Opção 3: Base64 (Inline)**

Para imagens muito pequenas ou quando não quer dependências externas:

```javascript
{
  id: 'e1',
  coverImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
}
```

**Quando usar:**

- Ícones muito pequenos (< 1KB)
- Prototipagem rápida
- Não recomendado para produção

---

## 📋 Como Adicionar Capa a um Livro Existente

### **Passo 1: Escolha o arquivo do livro**

Localize o livro no arquivo da categoria correspondente:

- `data/educacao.js` → livros de educação
- `data/literatura.js` → livros de literatura
- etc.

### **Passo 2: Adicione o campo coverImage**

```javascript
// ANTES
{
  id: "e1",
  title: "Matemática Completa para o ENEM",
  author: "Equipe LeiturAção",
  // ...outros campos
}

// DEPOIS
{
  id: "e1",
  title: "Matemática Completa para o ENEM",
  author: "Equipe LeiturAção",
  // ...outros campos
  coverImage: "https://exemplo.com/capa-matematica.jpg"
}
```

### **Passo 3: Teste**

1. Abra o navegador: `http://localhost:8000`
2. Navegue até a categoria do livro
3. Verifique se a capa aparece corretamente

---

## 🛠️ Ferramentas para Otimizar Capas

### **Redimensionamento**

Use ferramentas online para redimensionar:

- **TinyPNG**: https://tinypng.com (reduz tamanho mantendo qualidade)
- **ImageResizer**: https://imageresizer.com
- **Tamanho recomendado**: 300x400px (proporção 3:4)

### **Formatos Recomendados**

- **WebP**: Melhor compressão, suportado por navegadores modernos
- **JPEG**: Compatibilidade universal
- **PNG**: Para imagens com transparência

### **Nomes de Arquivo**

Use nomes descritivos e padronizados:

```
matematica-enem.jpg
biologia-ecossistemas.webp
filosofia-aristoteles.png
```

---

## 🔍 Exemplo Completo

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
    url: "https://gutendex.com/books/123",
    pdfUrl: "https://gutendex.com/pdf/123",
    coverImage:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=400&fit=crop",
  },
];
```

---

## ⚠️ Dicas Importantes

- ✅ **URLs válidas**: Sempre teste se a URL da imagem funciona
- ✅ **HTTPS**: Use HTTPS para evitar problemas de segurança
- ✅ **Lazy loading**: O sistema já carrega imagens sob demanda
- ✅ **Fallback**: Se a imagem não carregar, mostra emoji automaticamente
- ✅ **Performance**: Otimize imagens antes de subir
- ✅ **Acessibilidade**: Imagens decorativas não precisam de alt text (já implementado)

---

## 🚀 Próximos Passos

1. **Hospede suas capas** em um CDN
2. **Adicione coverImage** aos livros mais populares primeiro
3. **Teste em diferentes dispositivos**
4. **Monitore performance** do carregamento

---

_Última atualização: Abril 2026_</content>
<parameter name="filePath">/home/samuel/Documentos/claude/files (2)/manual/GUIA_ADICIONAR_CAPAS.md
