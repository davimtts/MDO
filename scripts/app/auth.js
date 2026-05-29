import { getSession, loginWithKey } from "../services/authService.js";
import { ROUTES } from "../utils/constants.js";

export async function checkAuth() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get("key");

  if (key) {
    try {
      await loginWithKey(key);
      window.location.href = ROUTES.inicio;
      return;
    } catch (error) {
      console.error(error);
      window.location.href = ROUTES.login;
      return;
    }
  }

  const session = getSession();

  if (!session) {
    window.location.href = ROUTES.login;
  }
}

export function redirectIfLogged() {
  const session = getSession();

  if (session) {
    window.location.href = ROUTES.inicio;
  }
}