import { ROUTES } from "../utils/constants.js";

export function applyNavLinks() {
  const links = document.querySelectorAll("[data-route-key]");

  links.forEach(link => {
    const routeKey = link.dataset.routeKey;
    const route = ROUTES[routeKey];

    if (!route) return;

    link.href = route;
  });
}