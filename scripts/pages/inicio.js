import { loadSharedLayout } from "../app/loadComponents.js";

await loadSharedLayout();

import { checkAuth } from "../app/auth.js";
import { logout } from "../services/authService.js";
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
import { applyNavLinks } from "../ui/navLinks.js";
import { setActiveNav } from "../ui/activeNav.js";

const user = await checkAuth();

await loadSettings();

applyNavLinks();
setActiveNav();


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

const monthlySalesCount = document.getElementById("monthlySalesCount");
const salesChartBars = document.getElementById("salesChartBars");

if (userName && user?.name) {
  userName.textContent = user.name.split(" ")[0];
}

async function handleLogout() {
  await logout();
  window.location.href = ROUTES.login;
}

if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
}

if (logoutButtonDesktop) {
  logoutButtonDesktop.addEventListener("click", handleLogout);
}




function getCompletedItems(items) {
  return items.filter(item =>
    item.item_status === "vendido"
  );
}

function getItemDate(item) {
  return item.item_data_ult_ctt || item.item_data_create;
}

function getMonthlySales(items) {
  return getCompletedItems(items).filter(item =>
    isCurrentMonth(getItemDate(item))
  );
}

function getSalesByMonth(items) {
  const months = Array(12).fill(0);

  getCompletedItems(items).forEach(item => {
    const date = new Date(getItemDate(item));

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const month = date.getMonth();

    months[month]++;
  });

  return months;
}






function renderSalesChart(items) {
  if (!monthlySalesCount || !salesChartBars) return;

  const monthlySales = getMonthlySales(items);
  const salesByMonth = getSalesByMonth(items);

  monthlySalesCount.textContent = monthlySales.length;

  const maxSales = Math.max(...salesByMonth, 1);
  const currentMonth = new Date().getMonth();

  const bars = salesChartBars.querySelectorAll(".chart-bar");

  bars.forEach(bar => {
    const month = Number(bar.dataset.month);
    const salesCount = salesByMonth[month];

    const height = salesCount === 0
      ? 3
      : Math.max((salesCount / maxSales) * 100, 8);

    bar.style.setProperty("--h", `${height}%`);

    bar.classList.toggle(
      "chart-bar--active",
      month === currentMonth
    );

    bar.title = `${salesCount} venda(s)`;
  });
}







async function renderDashboard() {
  const { clients, items, clientsWithItems } = await getDashboardData();
  renderSalesChart(items);

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
