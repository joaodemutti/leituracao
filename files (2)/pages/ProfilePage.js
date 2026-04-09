/**
 * js/pages/ProfilePage.js
 *
 * Página de perfil de usuário.
 */

export function ProfilePage(user) {
  const name = user?.name || "Usuário";
  const email = user?.email || "sem e-mail";

  return `
    <div class="page">
      <section class="auth-page">
        <div class="container auth-card">
          <div class="auth-header">
            <p class="auth-eyebrow">Bem-vindo</p>
            <h1>Olá, ${name}!</h1>
            <p>Você está logado. Agora pode continuar a explorar a biblioteca.</p>
          </div>

          <div class="profile-card">
            <div class="profile-row"><strong>Nome</strong><span>${name}</span></div>
            <div class="profile-row"><strong>E-mail</strong><span>${email}</span></div>
          </div>

          <div class="auth-actions">
            <button type="button" class="btn-banner-primary" data-action="logout">Sair</button>
          </div>
        </div>
      </section>
    </div>
  `;
}
