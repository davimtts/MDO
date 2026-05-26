import { checkAuth } from "../app/auth.js";
import { getSession, logout } from "../services/authService.js";
import { ROUTES } from "../utils/constants.js";

await checkAuth();

const session = getSession();

console.log("Usuário logado:", session);

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    logout();
    window.location.href = ROUTES.login;
  });
}