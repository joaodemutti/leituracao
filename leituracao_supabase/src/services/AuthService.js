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

import { supabase } from "./supabase.js";

// ─── Sessão em memória ────────────────────────────────────────────
let _currentUser = null;

/**
 * Retorna o usuário logado (da memória ou da sessão do Supabase).
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  if (_currentUser) return _currentUser;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("id, name, email, username, created_at")
    .eq("id", session.user.id)
    .single();

  _currentUser = perfil ?? null;
  return _currentUser;
}

/**
 * Verifica se há usuário logado.
 * Deve ser chamado após initAuth() no boot.
 * @returns {boolean}
 */
export function isLoggedIn() {
  return Boolean(_currentUser);
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

  const { data, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { error: "Este e-mail já está cadastrado." };
    }
    if (
      authError.status === 429 ||
      authError.message.includes("Too Many Requests")
    ) {
      return {
        error:
          "Muitas tentativas de cadastro. Aguarde alguns minutos antes de tentar novamente.",
      };
    }
    return { error: authError.message };
  }

  const { error: dbError } = await supabase.from("usuarios").insert({
    id: data.user.id,
    name: name.trim(),
    username: username.trim().toLowerCase(),
    email: normalizedEmail,
    created_at: new Date().toISOString(),
  });

  if (dbError) {
    if (dbError.message.includes("username")) {
      return { error: "Este nome de usuário já está em uso." };
    }
    return { error: "Erro ao salvar perfil. Tente novamente." };
  }

  _currentUser = {
    id: data.user.id,
    name: name.trim(),
    username: username.trim().toLowerCase(),
    email: normalizedEmail,
  };

  return { user: _currentUser };
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

  _currentUser = perfil;
  return { user: _currentUser };
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
  await getCurrentUser();
}
