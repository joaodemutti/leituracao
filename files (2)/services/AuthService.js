/**
 * js/services/AuthService.js
 *
 * Simula autenticação local usando localStorage.
 * Em produção, a autenticação deve ser feita num backend seguro.
 */

const STORAGE_USERS = "leituracao_users";
const STORAGE_SESSION = "leituracao_session";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
  } catch (error) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function createSession(user) {
  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_SESSION);
}

function hashPassword(password) {
  // Apenas simulação. Em um app real, use hash seguro no servidor.
  return btoa(password);
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_SESSION));
  } catch (error) {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getCurrentUser());
}

export function registerUser({ name, email, password }) {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (!name.trim() || !normalizedEmail || !password) {
    return { error: "Preencha todos os campos para criar a conta." };
  }

  if (users.some((user) => user.email === normalizedEmail)) {
    return { error: "Este e-mail já está cadastrado." };
  }

  const newUser = {
    id: `u_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
    name: name.trim(),
    email: normalizedEmail,
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
    points: 0,
  };

  users.push(newUser);
  saveUsers(users);
  createSession(newUser);

  return { user: { id: newUser.id, name: newUser.name, email: newUser.email } };
}

export function loginUser({ email, password }) {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const hashed = hashPassword(password);

  const user = users.find((entry) => entry.email === normalizedEmail);
  if (!user) {
    return { error: "E-mail ou senha inválidos." };
  }

  if (user.password !== hashed) {
    return { error: "E-mail ou senha inválidos." };
  }

  createSession(user);
  return { user: { id: user.id, name: user.name, email: user.email } };
}

export function logoutUser() {
  clearSession();
}
