/**
 * services/AuthService.js
 *
 * Autenticação real usando Supabase Auth + tabela "usuarios".
 *
 * A senha NUNCA é armazenada aqui — o Supabase cuida disso
 * com hash bcrypt automático e seguro.
 *
 * Todas as funções são assíncronas (retornam Promise).
 */

import { supabase } from "../lib/supabase.js";

// ─── Sessão em memória ────────────────────────────────────────────
let _currentUser = null;

function mapSessionProfile(session, perfil) {
  if (!session || !perfil) return null;
  return {
    ...perfil,
  };
}

/**
 * Retorna o usuário logado (da memória ou da sessão do Supabase).
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser(options = {}) {
  const { forceRefresh = false } = options;
  if (_currentUser && !forceRefresh) return _currentUser;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: perfil, error } = await supabase
      .from("usuarios")
      .select("id, name, email, username,is_admin, created_at")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Failed to load current user profile", error);
      _currentUser = null;
      return null;
    }

    _currentUser = mapSessionProfile(session, perfil);
    return _currentUser;
  } catch (error) {
    console.error("Failed to load current auth session", error);
    _currentUser = null;
    return null;
  }
}

export async function refreshCurrentUser() {
  return getCurrentUser({ forceRefresh: true });
}

/**
 * Verifica se há usuário logado.
 * Deve ser chamado após initAuth() no boot.
 * @returns {boolean}
 */
export function isLoggedIn() {
  return Boolean(_currentUser);
}

export function isAdminUser(user = _currentUser) {
  return user?.is_admin == true;
}

/**
 * Cadastra um novo usuário.
 * 1. Cria login seguro no Supabase Auth (hash bcrypt automático)
 * 2. Salva nome e username na tabela "usuarios"
 *
 * @param {{ name: string, username: string, email: string, password: string }}
 * @returns {Promise<{ user?: object, error?: string }>}
 */
export async function registerUser({ name, username, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!name.trim() || !normalizedEmail || !password || !username?.trim()) {
    return { error: "Preencha todos os campos para criar a conta." };
  }
  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const { error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data:
      {
        name: name.trim(),
        username: username.trim(),
      }
    }
  });

  if (authError) {
    const msg = authError.message.toLowerCase();

    if (msg.includes("already registered")) {
      return { error: "Este e-mail já está cadastrado." };
    }

    if (msg.includes("invalid email")) {
      return { error: "E-mail inválido." };
    }

    if (msg.includes("password")) {
      return { error: "A senha deve ter pelo menos 6 caracteres." };
    }

    if (authError.status === 429 || msg.includes("too many requests")) {
      return {
        error:
          "Muitas tentativas de cadastro. Aguarde alguns minutos antes de tentar novamente.",
      };
    }

    // === TRIGGER / METADATA ===
    if (msg.includes("missing name")) {
      return { error: "Informe seu nome." };
    }

    if (msg.includes("missing username")) {
      return { error: "Informe um nome de usuário." };
    }

    if (msg.includes("username cannot contain spaces")) {
      return { error: "O nome de usuário não pode conter espaços." };
    }

    if (msg.includes("duplicate key") || msg.includes("unique constraint")) {
      return { error: "Este nome de usuário já está em uso." };
    }

    // fallback
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  return {};
}

/**
 * Faz login com e-mail e senha.
 * @param {{ email: string, password: string }}
 * @returns {Promise<{ user?: object, error?: string }>}
 */
export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (authError) {
    if (
      authError.status === 429 ||
      authError.message.includes("Too Many Requests")
    ) {
      return {
        error:
          "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.",
      };
    }
    return { error: "E-mail ou senha inválidos." };
  }

  const { data: perfil, error: dbError } = await supabase
    .from("usuarios")
    .select("id, name, email, username, created_at")
    .eq("id", data.user.id)
    .single();

  if (dbError || !perfil) {
    return { error: "Perfil não encontrado. Entre em contato com o suporte." };
  }

  _currentUser = {
    ...perfil,
  };
  return { user: _currentUser };
}

export async function loginWithOAuth(provider) {
  const redirectTo = `https://leituracao.ong.br`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });

  if (error) {
    return { error: "Não foi possível iniciar o login social." };
  }

  return {};
}

export async function requestPasswordReset(email) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { error: "Informe seu e-mail para recuperar a senha." };
  }

  const redirectTo = `${window.location.origin}/login`;

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo,
  });

  if (error) {
    return { error: "Não foi possível enviar o e-mail de recuperação." };
  }

  return { data: true };
}

/**
 * Encerra a sessão do usuário.
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  await supabase.auth.signOut();
  _currentUser = null;
}

/**
 * Inicializa a sessão ao carregar a página.
 * Chame no boot antes de renderizar qualquer rota.
 * @returns {Promise<void>}
 */
export async function initAuth() {
  await getCurrentUser({ forceRefresh: true });
}




