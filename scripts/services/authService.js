import { getAccessKey } from "../firebase/auth.js";
import { SESSION_KEY } from "../utils/constants.js";

export async function loginWithKey(key) {
  if (!key) {
    throw new Error("Chave de acesso não informada.");
  }

  const user = await getAccessKey(key);

  if (!user) {
    throw new Error("Chave de acesso inválida.");
  }

  if (!user.active) {
    throw new Error("Chave de acesso desativada.");
  }

  const session = {
    key: user.id,
    name: user.name,
    role: user.role,
    loggedAt: new Date().toISOString()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return session;
}

export function getSession() {
  const session = localStorage.getItem(SESSION_KEY);

  if (!session) {
    return null;
  }

  return JSON.parse(session);
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}