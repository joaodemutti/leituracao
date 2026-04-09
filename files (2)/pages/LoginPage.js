/**
 * js/pages/LoginPage.js
 *
 * Página de login para acessar a plataforma.
 */

export function LoginPage() {
  return `
    <div class="page">
      <section class="auth-page">
        <div class="container auth-card">
          <div class="auth-header">
            <p class="auth-eyebrow">Acesso</p>
            <h1>Entrar na LeiturAção</h1>
            <p>Use seu e-mail e senha para acessar sua conta e continuar usando a plataforma.</p>
          </div>

          <form id="login-form" class="auth-form" novalidate>
            <div class="auth-field">
              <label for="login-email">E-mail</label>
              <input id="login-email" name="email" type="email" autocomplete="email" required placeholder="seu@exemplo.com" />
            </div>

            <div class="auth-field">
              <label for="login-password">Senha</label>
              <input id="login-password" name="password" type="password" autocomplete="current-password" required placeholder="••••••••" />
            </div>

            <div class="auth-actions">
              <button type="submit" class="btn-banner-primary">Entrar</button>
            </div>

            <p class="auth-meta">
              Ainda não tem conta? <button type="button" class="link-button" data-action="navigate" data-route="register">Cadastre-se</button>
            </p>

            <div id="login-error" class="auth-error" aria-live="polite"></div>
          </form>
        </div>
      </section>
    </div>
  `;
}
