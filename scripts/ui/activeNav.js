export function setActiveNav() {
  const currentPath = window.location.pathname;

  const links = document.querySelectorAll("[data-route]");

  links.forEach(link => {
    const route = link.dataset.route;

    link.classList.remove("active");

    if (currentPath.startsWith(route)) {
      link.classList.add("active");
    }
  });
}