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

import { isCurrentMonth } from "../utils/dates.js";

await checkAuth();
await loadSettings();

const session = getSession();

const userName = document.getElementById("userName");

const logoutButton = document.getElementById("logoutButton");
const logoutButtonDesktop = document.getElementById("logoutButtonDesktop");

const recentClientsList = document.getElementById("recentClientsList");
const pendingList = document.getElementById("pendingList");

const newClientsCount = document.getElementById("newClientsCount");
const opportunitiesCount = document.getElementById("opportunitiesCount");
const budgetCount = document.getElementById("budgetCount");
const salesCount = document.getElementById("salesCount");
const pendingCount = document.getElementById("pendingCount");

if (userName && session?.name) {
  userName.textContent =  session.name.split(" ")[0];
}

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

async function renderDashboard() {
  const { clients, items, clientsWithItems } = await getDashboardData();

  setClientPanelData({
    clientsWithItems
  });

  recentClientsList.innerHTML = "";
  pendingList.innerHTML = "";

  const currentMonthClients = clients.filter(client =>
    isCurrentMonth(client.client_data_create)
  );

  newClientsCount.textContent = currentMonthClients.length;

  opportunitiesCount.textContent = items.filter(item =>
    item.item_status !== "perdido" && item.item_status !== "vendido"
  ).length;

  budgetCount.textContent = items.filter(item =>
    item.item_status === "analise"
  ).length;

  salesCount.textContent = items.filter(item =>
    item.item_status === "vendido"
  ).length;

  const pendingItems = items.filter(item =>
    item.item_status === "aguardando"
  );

  pendingCount.textContent = pendingItems.length;

  const recent = clientsWithItems.slice(0, 5);



  recent.forEach(client => {
    const mainItem = getHighestPriorityItem(client.items);

    recentClientsList.appendChild(
      renderClientRow(client, mainItem, {
        onClick: () => openClientPanel(client.id)
      })
    );
  });



  pendingItems.slice(0, 4).forEach(item => {
    const client = clients.find(client => client.id === item.client_id);

    if (!client) return;

    pendingList.appendChild(
      renderClientRow(client, item, {
        onClick: () => openClientPanel(client.id)
      })
    );
  });
}

initClientCreateModal({
  onSuccess: async result => {
    await renderDashboard();

    if (result?.client?.id) {
      openClientPanel(result.client.id);
    }
  }
});

initClientPanel({
  onSuccess: async () => {
    await renderDashboard();
  }
});

await renderDashboard();
import { setActiveNav } from "../ui/activeNav.js";

setActiveNav();