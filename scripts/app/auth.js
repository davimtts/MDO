import { onAuth } from "../services/authService.js";
import { ROUTES } from "../utils/constants.js";

export function checkAuth() {
  return new Promise(resolve => {
    onAuth(user => {
      if (!user) {
        window.location.href = ROUTES.login;
        return;
      }

      resolve(user);
    });
  });
}