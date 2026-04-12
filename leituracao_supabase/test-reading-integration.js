/**
 * test-reading-integration.js
 * Teste simples da integração de leitura com gamificação
 */

import { showReadingModal } from "./components/ReadingModal.js";
import { findBookById } from "./core/main.js";

// Simula um clique no botão "Ler Agora" do Dom Casmurro
console.log("🧪 Testando integração de leitura...");

// Simula dados de um livro
const testBook = {
  id: "l1",
  title: "Dom Casmurro",
  author: "Machado de Assis",
  totalPages: 256,
  url: "https://example.com/livros/dom-casmurro",
};

console.log("📖 Testando modal de leitura para:", testBook.title);

// Nota: Este teste não pode ser executado no Node.js pois requer DOM
// Deve ser testado no navegador com o aplicativo rodando
console.log("✅ Script de teste criado - execute no navegador!");
