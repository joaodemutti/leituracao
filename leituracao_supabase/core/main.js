/**
 * main.js — Ponto de entrada da aplicação LeiturAção
 *
 * Responsabilidades:
 * 1. Importar e conectar todos os módulos
 * 2. Inicializar os event listeners globais
 */

// ── Dados locais (categorias manuais) ─────────────────────────────
import { CATEGORIES } from "../data/database.js";

// ── Core ──────────────────────────────────────────────────────────
import {
  navigate,
  registerRoutes,
  initRouter,
  updateActiveNav,
} from "./router.js";
import { setState } from "./state.js";
import { initScrollAnimations } from "./animations.js";

// ── Serviços ──────────────────────────────────────────────────────
import { searchBooks, filterByCategory } from "../services/SearchService.js";
import {
  getUserStats,
  getUserReadingProgress,
  getReadingAnalytics,
  startReading,
  updateReadingProgress,
} from "../services/ReadingService.js";

// ── Componentes ───────────────────────────────────────────────────
import { HomePage } from "../pages/HomePage.js";
import { LoginPage } from "../pages/LoginPage.js";
import { RegisterPage } from "../pages/RegisterPage.js";
import { ProfilePage } from "../pages/ProfilePage.js";
import { CategoryPage, EmptyGridHtml } from "../components/CategoryPage.js";
import { BookCard } from "../components/BookCard.js";
import {
  StatsCard,
  BadgesDisplay,
  ReadingCard,
  SimpleReadingChart,
  ProgressBar,
  Leaderboard,
} from "../components/GamificationWidget.js";
import { showReadingModal } from "../components/ReadingModal.js";
import {
  getCurrentUser,
  isLoggedIn,
  loginUser,
  registerUser,
  logoutUser,
  initAuth,
} from "../services/AuthService.js";

/* ════════════════════════════════════════════════════════════════
   UTILITÁRIOS
   ════════════════════════════════════════════════════════════════ */

const appSelector = "#app";

function getAppElement() {
  return document.querySelector(appSelector);
}

function renderApp(html) {
  const app = getAppElement();
  if (!app) return;
  app.innerHTML = html;
  initScrollAnimations();
  updateAuthLinks();
}

function renderProtectedPage() {
  renderApp(`
    <div class="page">
      <section class="auth-page">
        <div class="container auth-card">
          <div class="auth-header">
            <p class="auth-eyebrow">Acesso restrito</p>
            <h1>Faça login para continuar</h1>
            <p>As categorias só estão disponíveis para usuários autenticados.</p>
          </div>

          <div class="auth-actions">
            <button type="button" class="btn-banner-primary" data-action="navigate" data-route="login">Entrar</button>
            <button type="button" class="link-button" data-action="navigate" data-route="register">Criar conta</button>
          </div>
        </div>
      </section>
    </div>
  `);
}

function renderBooksGrid(container, books, fallbackHtml) {
  if (!container) return;
  container.innerHTML = books.length
    ? books.map((book) => BookCard(book, true)).join("")
    : fallbackHtml;
}

function createSearchPageHtml(query) {
  return `
    <div class="page">
      <div class="breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb" aria-label="Caminho de navegação">
            <button data-action="navigate" data-route="home">Início</button>
            <span class="sep" aria-hidden="true">›</span>
            <span class="current" aria-current="page">Busca: "${query}"</span>
          </nav>
        </div>
      </div>
      <div class="books-section">
        <div class="container">
          <div class="shelf-header" style="margin-bottom:1.5rem">
            <div>
              <div class="shelf-eyebrow eyebrow-navy" aria-hidden="true">🔍 Resultados</div>
              <h2 class="shelf-title" id="search-count">Buscando…</h2>
            </div>
          </div>
          <div class="books-grid stagger" id="search-grid" role="list" aria-live="polite">
            <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--g400)" role="status">
              <div style="font-size:2rem;margin-bottom:.5rem">🔍</div>
              <p>Buscando em todos os acervos…</p>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function createNoSearchResultsHtml(query) {
  return `
    <div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;color:var(--g400)" role="status">
      <div style="font-size:3rem;margin-bottom:1rem" aria-hidden="true">📭</div>
      <p>Nenhum livro encontrado para "<strong>${query}</strong>".</p>
      <button style="margin-top:1rem;background:var(--navy);color:#fff;border:none;padding:.6rem 1.2rem;border-radius:8px;font-family:inherit;font-size:.85rem;cursor:pointer"
        data-action="navigate" data-route="home">← Voltar ao início</button>
    </div>`;
}

function findBookById(bookId) {
  return (
    Object.values(CATEGORIES)
      .flatMap((cat) => cat.books)
      .find((book) => book.id === bookId) ?? null
  );
}

/* ════════════════════════════════════════════════════════════════
   RENDERIZAÇÃO DE PÁGINAS
   ════════════════════════════════════════════════════════════════ */

function renderHome() {
  renderApp(HomePage());
}

async function renderLogin() {
  if (isLoggedIn()) {
    const user = await getCurrentUser();
    const html = await ProfilePage(user);
    renderApp(html);
    return;
  }
  renderApp(LoginPage());
}

async function renderRegister() {
  if (isLoggedIn()) {
    const user = await getCurrentUser();
    const html = await ProfilePage(user);
    renderApp(html);
    return;
  }
  renderApp(RegisterPage());
}

async function renderProfilePage() {
  if (!isLoggedIn()) {
    navigate("login");
    return;
  }
  const user = await getCurrentUser();
  const html = await ProfilePage(user);
  renderApp(html);
}

function updateAuthLinks() {
  const loggedIn = isLoggedIn();
  document.querySelectorAll("[data-auth='logged-in']").forEach((el) => {
    el.hidden = !loggedIn;
  });
  document.querySelectorAll("[data-auth='logged-out']").forEach((el) => {
    el.hidden = loggedIn;
  });
}

function renderCategoryPage(catId) {
  if (!isLoggedIn()) {
    renderProtectedPage();
    return;
  }

  const cat = CATEGORIES[catId];
  if (!cat) return renderHome();

  setState({ activeFilter: "Todos" });
  renderApp(CategoryPage(cat));
  initFilterBar(cat);
}

function renderSearchResults(query) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return;

  renderApp(createSearchPageHtml(normalizedQuery));
  window.scrollTo({ top: 0, behavior: "smooth" });

  const books = searchBooks(normalizedQuery);
  const total = books.length;

  const grid = document.getElementById("search-grid");
  const countEl = document.getElementById("search-count");
  if (!grid || !countEl) return;

  countEl.textContent = `${total} livro${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`;
  renderBooksGrid(grid, books, createNoSearchResultsHtml(normalizedQuery));

  const navInput = document.getElementById("nav-search-input");
  if (navInput) navInput.value = "";

  setState({ searchQuery: normalizedQuery, currentRoute: "" });
  updateActiveNav("");
}

/* ════════════════════════════════════════════════════════════════
   FILTROS
   ════════════════════════════════════════════════════════════════ */

function initFilterBar(cat) {
  const bar = document.getElementById("filter-bar");
  const grid = document.getElementById("books-grid");
  if (!bar || !grid) return;

  bar.addEventListener("click", (event) => {
    const chip = event.target.closest(".filter-chip");
    if (!chip) return;

    bar.querySelectorAll(".filter-chip").forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    });

    chip.classList.add("active");
    chip.setAttribute("aria-pressed", "true");

    const filterVal = chip.dataset.filter;
    setState({ activeFilter: filterVal });

    const filtered = filterByCategory(cat.books, filterVal);
    grid.style.opacity = "0";
    grid.style.transform = "translateY(8px)";

    setTimeout(() => {
      renderBooksGrid(grid, filtered, EmptyGridHtml(filterVal));
      grid.style.opacity = "1";
      grid.style.transform = "translateY(0)";
      grid.style.transition = "opacity .3s, transform .3s";
    }, 180);
  });
}

/* ════════════════════════════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════════════════════════════ */

function initNavbar() {
  const navbar = document.getElementById("navbar");
  const burger = document.getElementById("nav-burger");
  const mobileMenu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("mobile-overlay");
  const navInput = document.getElementById("nav-search-input");

  window.addEventListener(
    "scroll",
    () => {
      navbar.classList.toggle("shadow", window.scrollY > 10);
    },
    { passive: true },
  );

  burger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  overlay.addEventListener("click", closeMobileMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileMenu();
  });

  document.addEventListener("click", (e) => {
    const logoutNav = e.target.closest("[data-action='logout']");
    if (logoutNav) {
      logoutUser().then(() => {
        navigate("login");
        closeMobileMenu();
      });
      return;
    }

    const navLink = e.target.closest("[data-route]");
    if (!navLink) return;
    if (!navLink.matches(".nav-link, .drawer-link, .logo[data-route]")) return;
    navigate(navLink.dataset.route);
    closeMobileMenu();
  });

  navInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && navInput.value.trim()) {
      renderSearchResults(navInput.value);
    }
  });
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  const burger = document.getElementById("nav-burger");
  mobileMenu.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-label", "Abrir menu");
}

/* ════════════════════════════════════════════════════════════════
   DELEGAÇÃO DE EVENTOS DO APP
   ════════════════════════════════════════════════════════════════ */

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading
    ? "Aguarde..."
    : btn.dataset.label || btn.textContent;
}

function initAppDelegation() {
  const app = document.getElementById("app");

  app.addEventListener("click", (e) => {
    const navTarget = e.target.closest('[data-action="navigate"]');
    if (navTarget) {
      navigate(navTarget.dataset.route);
      return;
    }

    const logoutBtn = e.target.closest('[data-action="logout"]');
    if (logoutBtn) {
      logoutUser().then(() => navigate("login"));
      return;
    }

    const readBtn = e.target.closest('[data-action="read"]');
    if (readBtn) {
      if (!isLoggedIn()) {
        renderProtectedPage();
        return;
      }
      const book = findBookById(readBtn.dataset.bookId);
      if (book) {
        showReadingModal(book);
      } else {
        alert("📚 Livro não encontrado. Tente recarregar a página.");
      }
      return;
    }

    const continueBtn = e.target.closest('[data-action="continue-reading"]');
    if (continueBtn) {
      if (!isLoggedIn()) {
        renderProtectedPage();
        return;
      }
      const book = findBookById(continueBtn.dataset.bookId);
      if (book) {
        showReadingModal(book);
      } else {
        alert("📚 Livro não encontrado. Tente recarregar a página.");
      }
      return;
    }

    const dlBtn = e.target.closest('[data-action="download"]');
    if (dlBtn) {
      if (!isLoggedIn()) {
        renderProtectedPage();
        return;
      }
      const book = findBookById(dlBtn.dataset.bookId);
      if (book?.pdfUrl) window.open(book.pdfUrl, "_blank", "noopener");
      else
        alert(
          "📚 Este é um livro de exemplo para desenvolvimento.\n\nEm produção, você poderá baixar livros reais em PDF!",
        );
      return;
    }

    if (e.target.closest('[data-action="hero-search"]')) {
      const input = document.getElementById("hero-input");
      if (input?.value.trim()) renderSearchResults(input.value);
      return;
    }
  });

  // ── Formulário de Login ────────────────────────────────────────
  app.addEventListener("submit", async (e) => {
    if (e.target.id === "login-form") {
      e.preventDefault();
      const form = e.target;
      const btn = form.querySelector('[type="submit"]');
      const errorEl = document.getElementById("login-error");

      btn.dataset.label = btn.textContent;
      setLoading(btn, true);

      const result = await loginUser({
        email: form.email.value,
        password: form.password.value,
      });

      setLoading(btn, false);

      if (result.error) {
        if (errorEl) errorEl.textContent = result.error;
        return;
      }

      if (errorEl) errorEl.textContent = "";
      navigate("profile");
      return;
    }

    // ── Formulário de Cadastro ───────────────────────────────────
    if (e.target.id === "register-form") {
      e.preventDefault();
      const form = e.target;
      const btn = form.querySelector('[type="submit"]');
      const errorEl = document.getElementById("register-error");

      const password = form.password.value;
      const confirmPassword = form.passwordConfirm.value;

      if (password !== confirmPassword) {
        if (errorEl) errorEl.textContent = "As senhas não coincidem.";
        return;
      }

      btn.dataset.label = btn.textContent;
      setLoading(btn, true);

      const result = await registerUser({
        name: form.name.value,
        username:
          form.username?.value ||
          form.name.value.toLowerCase().replace(/\s+/g, ""),
        email: form.email.value,
        password,
      });

      setLoading(btn, false);

      if (result.error) {
        if (errorEl) errorEl.textContent = result.error;
        return;
      }

      if (errorEl) errorEl.textContent = "";
      navigate("profile");
      return;
    }
  });

  app.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.id === "hero-input") {
      if (e.target.value.trim()) renderSearchResults(e.target.value);
    }
  });
}

/* ════════════════════════════════════════════════════════════════
   BOOT
   ════════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", async () => {
  // Restaura sessão do Supabase antes de renderizar qualquer rota
  await initAuth();

  registerRoutes({
    "": renderHome,
    home: renderHome,
    login: renderLogin,
    register: renderRegister,
    profile: renderProfilePage,
    educacao: () => renderCategoryPage("educacao"),
    literatura: () => renderCategoryPage("literatura"),
    filosofia: () => renderCategoryPage("filosofia"),
    ciencia: () => renderCategoryPage("ciencia"),
    historia: () => renderCategoryPage("historia"),
    sociais: () => renderCategoryPage("sociais"),
    arte: () => renderCategoryPage("arte"),
    religiao: () => renderCategoryPage("religiao"),
  });

  initNavbar();
  initAppDelegation();
  initRouter();
});
