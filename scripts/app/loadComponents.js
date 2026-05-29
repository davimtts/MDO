export async function loadComponent(selector, path) {
  const root = document.querySelector(selector);

  if (!root) return;

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Erro ao carregar componente: ${path}`);
  }

  root.innerHTML = await response.text();
}

export async function loadSharedLayout() {
  await Promise.all([
    loadComponent("#sidebar-root", "/components/sidebar.html"),
    loadComponent("#topbar-root", "/components/topbar.html"),
    loadComponent("#bottom-nav-root", "/components/bottom-nav.html"),
    loadComponent("#client-create-modal-root", "/components/client-create-modal.html"),
    loadComponent("#client-panel-root", "/components/client-panel.html"),
    loadComponent("#toast-root", "/components/toast.html")
  ]);
}