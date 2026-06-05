import {
  registerUser,
  loginUser,
  logoutUser,
  watchAuth
} from "../firebase/auth.js";

export async function register({ name, email, password }) {
  const user = await registerUser({
    name,
    email,
    password
  });

  return normalizeUser(user);
}

export async function login({ email, password }) {
  const user = await loginUser({
    email,
    password
  });

  return normalizeUser(user);
}

export async function logout() {
  await logoutUser();
}

export function onAuth(callback) {
  return watchAuth(user => {
    callback(user ? normalizeUser(user) : null);
  });
}

export function getCurrentUser() {
  return new Promise(resolve => {
    onAuth(user => {
      resolve(user);
    });
  });
}

function normalizeUser(user) {
  return {
    id: user.uid,
    name: user.displayName || "Usuário",
    email: user.email
  };
}

