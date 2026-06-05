import {
  login,
  register,
  onAuth
} from "../services/authService.js";

import { ROUTES } from "../utils/constants.js";

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const authMessage = document.getElementById("authMessage");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

let authChecked = false;

onAuth(user => {
  if (authChecked) return;

  authChecked = true;

  if (user) {
    window.location.href = ROUTES.inicio;
  }
});

function setMode(mode) {
  const isLogin = mode === "login";

  loginTab.classList.toggle("active", isLogin);
  registerTab.classList.toggle("active", !isLogin);

  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);

  clearMessage();
}

function setMessage(message, type = "") {
  authMessage.textContent = message;
  authMessage.className = `auth-message ${type}`;
}

function clearMessage() {
  setMessage("");
}

function getAuthErrorMessage(error) {
  const code = error?.code || "";

  const messages = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/network-request-failed": "Erro de conexão. Verifique sua internet."
  };

  return messages[code] || "Não foi possível concluir. Tente novamente.";
}

loginTab.addEventListener("click", () => {
  setMode("login");
});

registerTab.addEventListener("click", () => {
  setMode("register");
});

loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  const submitButton = loginForm.querySelector("button[type='submit']");

  try {
    submitButton.disabled = true;
    setMessage("Entrando...");

    await login({
      email: loginEmail.value.trim(),
      password: loginPassword.value
    });

    window.location.href = ROUTES.inicio;
  } catch (error) {
    console.error(error);
    setMessage(getAuthErrorMessage(error), "error");
  } finally {
    submitButton.disabled = false;
  }
});

registerForm.addEventListener("submit", async event => {
  event.preventDefault();

  const submitButton = registerForm.querySelector("button[type='submit']");

  try {
    submitButton.disabled = true;
    setMessage("Criando conta...");

    await register({
      name: registerName.value.trim(),
      email: registerEmail.value.trim(),
      password: registerPassword.value
    });

    setMessage("Conta criada com sucesso. Entrando...", "success");

    window.location.href = ROUTES.inicio;
  } catch (error) {
    console.error(error);
    setMessage(getAuthErrorMessage(error), "error");
  } finally {
    submitButton.disabled = false;
  }
});