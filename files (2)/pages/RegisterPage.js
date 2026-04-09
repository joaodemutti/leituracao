/**
 * js/pages/RegisterPage.js
 *
 * Página de cadastro de novos usuários.
 */

export function RegisterPage() {
  return `
    <div class="page">
      <section class="auth-page">
        <div class="container auth-card">
          <div class="auth-header">
            <p class="auth-eyebrow">Cadastro</p>
            <h1>Crie sua conta</h1>
            <p>Preencha os dados abaixo para começar a usar a biblioteca com login e histórico.</p>
          </div>

          <form id="register-form" class="auth-form" novalidate>
            <div class="auth-field">
              <label for="register-name">Nome</label>
              <input id="register-name" name="name" type="text" autocomplete="name" required placeholder="Seu nome" />
            </div>

            <div class="auth-field">
              <label for="register-email">E-mail</label>
              <input id="register-email" name="email" type="email" autocomplete="email" required placeholder="seu@exemplo.com" />
            </div>

            <div class="auth-field">
              <label for="register-password">Senha</label>
              <input id="register-password" name="password" type="password" autocomplete="new-password" required placeholder="••••••••" />
            </div>

            <div class="auth-field">
              <label for="register-password-confirm">Confirmar senha</label>
              <input id="register-password-confirm" name="passwordConfirm" type="password" autocomplete="new-password" required placeholder="••••••••" />
            </div>

            <div class="auth-actions">
              <button type="submit" class="btn-banner-primary">Criar conta</button>
            </div>

            <p class="auth-meta">
              Já tem conta? <button type="button" class="link-button" data-action="navigate" data-route="login">Entrar</button>
            </p>

            <div id="register-error" class="auth-error" aria-live="polite"></div>
          </form>
        </div>
      </section>
    </div>
  `;
}
