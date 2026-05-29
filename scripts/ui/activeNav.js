import { BASE_PATH } from "../utils/constants.js";

function normalizePath(path) {
  if (!path.endsWith("/")) {
    return `${path}/`;
  }

  return path;
}

export function setActiveNav() {
  const currentPath = normalizePath(
    window.location.pathname.replace(BASE_PATH, "")
  );

  const links = document.querySelectorAll("[data-route]");

  links.forEach(link => {
    const route = normalizePath(link.dataset.route);

    link.classList.remove("active");

    if (currentPath.startsWith(route)) {
      link.classList.add("active");
    }
  });
}