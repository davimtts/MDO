import { loadSharedLayout } from "../app/loadComponents.js";

await loadSharedLayout();

import { checkAuth } from "../app/auth.js";
import { getSession, logout } from "../services/authService.js";
import { getDashboardData } from "../services/clientService.js";
import { loadSettings } from "../services/settingsService.js";
import { ROUTES } from "../utils/constants.js";

import { getHighestPriorityItem } from "../utils/itemPriority.js";
import { renderClientRow } from "../ui/clientRow.js";

import { initClientCreateModal } from "../ui/clientCreateModal.js";
import {
  initClientPanel,
  openClientPanel,
  setClientPanelData
} from "../ui/clientPanel.js";

await checkAuth();
await loadSettings();

const session = getSession();

const logoutButton = document.getElementById("logoutButton");
const logoutButtonDesktop = document.getElementById("logoutButtonDesktop");

const clientsList = document.getElementById("clientsList");
const clientsCount = document.getElementById("clientsCount");
const clientsEmpty = document.getElementById("clientsEmpty");
const clientSearch = document.getElementById("clientSearch");

let pageData = {
  clients: [],
  items: [],
  clientsWithItems: []
};

function handleLogout() {
  logout();
  window.location.href = ROUTES.login;
}

if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
}

if (logoutButtonDesktop) {
  logoutButtonDesktop.addEventListener("click", handleLogout);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function filterClients(searchTerm) {
  const term = normalizeText(searchTerm);

  if (!term) {
    return pageData.clientsWithItems;
  }

  return pageData.clientsWithItems.filter(client => {
    const name = normalizeText(client.client_nome);
    const phone = normalizeText(client.client_telefone);

    return (
      name.includes(term) ||
      phone.includes(term)
    );
  });
}

function renderClients(clients) {
  clientsList.innerHTML = "";

  clientsCount.textContent = clients.length;

  if (clients.length === 0) {
    clientsEmpty.style.display = "flex";
    return;
  }

  clientsEmpty.style.display = "none";

  clients.forEach(client => {
    const mainItem = getHighestPriorityItem(client.items);

    clientsList.appendChild(
      renderClientRow(client, mainItem, {
        onClick: () => openClientPanel(client.id)
      })
    );
  });
}

async function loadClientsPage() {
  const data = await getDashboardData();

  pageData = data;

  setClientPanelData({
    clientsWithItems: data.clientsWithItems
  });

  renderClients(
    filterClients(clientSearch.value)
  );
}

clientSearch.addEventListener("input", () => {
  renderClients(
    filterClients(clientSearch.value)
  );
});

initClientCreateModal({
  onSuccess: async result => {
    await loadClientsPage();

    if (result?.client?.id) {
      openClientPanel(result.client.id);
    }
  }
});

initClientPanel({
  onSuccess: async () => {
    await loadClientsPage();
  }
});

await loadClientsPage();
import { setActiveNav } from "../ui/activeNav.js";

setActiveNav();