import { loginWithKey } from "../services/authService.js";
import { redirectIfLogged } from "../app/auth.js";
import { ROUTES } from "../utils/constants.js";

redirectIfLogged();

const form = document.getElementById("loginForm");
const input = document.getElementById("accessKey");
const errorBox = document.getElementById("loginError");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const key = input.value.trim();

  try {
    await loginWithKey(key);
    window.location.href = ROUTES.inicio;
  } catch (error) {
    errorBox.textContent = error.message;
  }
});

















/**
 * ÍRIS CRM — Login Page
 * scripts/pages/login.js
 *
 * Integrar com authService.js quando pronto.
 */

// --- Elementos ---
const inputEl    = document.getElementById('accessKey');
const errorEl    = document.getElementById('loginError');
const toggleBtn  = document.getElementById('toggleKey');
const eyeOpen    = toggleBtn.querySelector('.eye-open');
const eyeClosed  = toggleBtn.querySelector('.eye-closed');
const submitBtn  = form.querySelector('.login-btn');
const btnText    = submitBtn.querySelector('.login-btn__text');
const btnIcon    = submitBtn.querySelector('.login-btn__icon');

// --- Toggle visibilidade da chave ---
toggleBtn.addEventListener('click', () => {
  const isHidden = inputEl.type === 'password';
  inputEl.type = isHidden ? 'text' : 'password';

  eyeOpen.style.display   = isHidden ? 'none' : '';
  eyeClosed.style.display = isHidden ? 'flex'     : 'none';

  toggleBtn.setAttribute('aria-label', isHidden ? 'Ocultar chave' : 'Mostrar chave');
  inputEl.focus();
});

// --- Limpa erro ao digitar ---
inputEl.addEventListener('input', () => {
  if (errorEl.classList.contains('visible')) {
    hideError();
  }
  inputEl.classList.remove('has-error');
});

// --- Submit ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const key = inputEl.value.trim();

  if (!key) {
    showError('Informe a chave de acesso.');
    inputEl.classList.add('has-error');
    inputEl.focus();
    return;
  }

  setLoading(true);

  try {
    // TODO: substituir pela chamada real ao authService.js
    // import { login } from '../services/authService.js';
    // const result = await login(key);
    // if (result.success) window.location.href = './dashboard.html';

    await delay(1400); // simulação

    // Simulação: chave inválida
    throw new Error('Chave de acesso inválida. Tente novamente.');

  } catch (err) {
    showError(err.message || 'Ocorreu um erro. Tente novamente.');
    inputEl.classList.add('has-error');
    inputEl.select();
  } finally {
    setLoading(false);
  }
});

// --- Helpers ---

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;

  if (isLoading) {
    btnText.textContent = 'Verificando...';
    btnIcon.style.display = 'none';

    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');
    submitBtn.appendChild(spinner);
  } else {
    btnText.textContent = 'Entrar';
    btnIcon.style.display = '';

    const spinner = submitBtn.querySelector('.spinner');
    if (spinner) spinner.remove();
  }
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.add('visible');
}

function hideError() {
  errorEl.classList.remove('visible');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}