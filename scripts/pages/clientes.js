import { loadSharedLayout } from "../app/loadComponents.js";

await loadSharedLayout();

import { checkAuth } from "../app/auth.js";
import { getSession, logout } from "../services/authService.js";
import { getDashboardData } from "../services/clientService.js";
import {
  loadSettings,
  getStatusMap
} from "../services/settingsService.js";
import { ROUTES } from "../utils/constants.js";

import { getHighestPriorityItem } from "../utils/itemPriority.js";
import {
  formatMoney,
  formatShortDate,
  getInitials
} from "../utils/formatters.js";

import { renderStatusBadge } from "../ui/statusBadge.js";
import { setActiveNav } from "../ui/activeNav.js";

import { initClientCreateModal } from "../ui/clientCreateModal.js";
import {
  initClientPanel,
  openClientPanel,
  setClientPanelData
} from "../ui/clientPanel.js";

await checkAuth();
await loadSettings();

setActiveNav();

const session = getSession();

const logoutButton = document.getElementById("logoutButton");
const logoutButtonDesktop = document.getElementById("logoutButtonDesktop");

const clientsList = document.getElementById("clientsList");
const clientsEmpty = document.getElementById("clientsEmpty");
const clientSearch = document.getElementById("clientSearch");

const originFilters = document.getElementById("originFilters");
const statusFilters = document.getElementById("statusFilters");
const toggleFiltersButton = document.getElementById("toggleFiltersButton");

let activeOrigin = "all";
let activeStatus = "all";
const LOOKING_STATUS = "olhando";

let pageData = {
  clients: [],
  items: [],
  clientsWithItems: []
};

function handleLogout() {
  logout();
  window.location.href = ROUTES.login;
}

if (logoutButton) logoutButton.addEventListener("click", handleLogout);
if (logoutButtonDesktop) logoutButtonDesktop.addEventListener("click", handleLogout);

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatOrigin(origin) {
  const labels = {
    trafego_pago: "Tráfego pago",
    loja_fisica: "Loja",
    indicacao: "Indicação"
  };
  return labels[origin] || origin || "—";
}

function getDisplayItem(client) {
  if (activeStatus === "all") {
    return getHighestPriorityItem(client.items);
  }

  const filteredItems = client.items.filter(item =>
    item.item_status === activeStatus
  );

  return getHighestPriorityItem(filteredItems);
}

function filterClients() {
  return pageData.clientsWithItems.filter(client => {
    return (
      clientMatchesSearch(client) &&
      clientMatchesOrigin(client, activeOrigin) &&
      clientMatchesStatus(client, activeStatus)
    );
  });
}

function clientMatchesSearch(client) {
  const term = normalizeText(clientSearch?.value);

  const name = normalizeText(client.client_nome);
  const phone = normalizeText(client.client_telefone);

  return (
    !term ||
    name.includes(term) ||
    phone.includes(term)
  );
}

function clientMatchesOrigin(client, origin) {
  return (
    origin === "all" ||
    client.client_origem === origin
  );
}

function clientMatchesStatus(client, status) {
  const hasItems = client.items.length > 0;

  return (
    status === "all" ||
    client.items.some(item => item.item_status === status) ||
    (
      status === LOOKING_STATUS &&
      !hasItems
    )
  );
}

function renderOriginCounts() {
  const originAllCount = document.getElementById("originAllCount");
  const originStoreCount = document.getElementById("originStoreCount");
  const originPaidCount = document.getElementById("originPaidCount");
  const originReferralCount = document.getElementById("originReferralCount");

  const baseClients = pageData.clientsWithItems.filter(client => {
    return (
      clientMatchesSearch(client) &&
      clientMatchesStatus(client, activeStatus)
    );
  });

  if (originAllCount) {
    originAllCount.textContent = baseClients.length;
  }

  if (originStoreCount) {
    originStoreCount.textContent = baseClients.filter(client =>
      client.client_origem === "loja_fisica"
    ).length;
  }

  if (originPaidCount) {
    originPaidCount.textContent = baseClients.filter(client =>
      client.client_origem === "trafego_pago"
    ).length;
  }

  if (originReferralCount) {
    originReferralCount.textContent = baseClients.filter(client =>
      client.client_origem === "indicacao"
    ).length;
  }
}

function renderStatusFilters() {
  if (!statusFilters) return;

  const statusMap = getStatusMap();

  const baseClients = pageData.clientsWithItems.filter(client => {
    return (
      clientMatchesSearch(client) &&
      clientMatchesOrigin(client, activeOrigin)
    );
  });

  statusFilters.innerHTML = `
    <button class="filter-card ${activeStatus === "all" ? "active" : ""}" type="button" data-status="all">
      <span>Todos</span>
      <strong>${baseClients.length}</strong>
    </button>
  `;

  Object.values(statusMap)
    .filter(status => status.active)
    .forEach(status => {
      const count = baseClients.filter(client =>
        clientMatchesStatus(client, status.id)
      ).length;

      if (count === 0) {
        return;
      }

      const button = document.createElement("button");

      button.className = `filter-card ${activeStatus === status.id ? "active" : ""}`;
      button.type = "button";
      button.dataset.status = status.id;

      button.innerHTML = `
      <span>${status.label}</span>
      <strong>${count}</strong>
    `;

      statusFilters.appendChild(button);
    });
}

function renderClientTableRow(client) {
  const mainItem = getDisplayItem(client);

  const row = document.createElement("article");
  row.className = "client-table-row";

  const price = mainItem?.item_preco
    ? formatMoney(mainItem.item_preco)
    : "";

  const date = formatShortDate(
    mainItem?.item_data_ult_ctt || client.client_ult_ctt || client.client_data_create
  );

  row.innerHTML = `
    <div class="avatar">${getInitials(client.client_nome)}</div>

    <div class="client-main">
      <strong>${client.client_nome}</strong>
      <div class="client-meta">
        <span class="client-origin">${formatOrigin(client.client_origem)}</span>
        <span class="client-date">${date}</span>
      </div>
    </div>

    <div class="client-right">
      ${mainItem ? renderStatusBadge(mainItem.item_status) : ""}
      <span class="client-item">${mainItem ? mainItem.item_nome : ""} </span>
      <span class="client-price">${price}</span>
      
    </div>

    <div class="client-arrow">
      <i class="fa-solid fa-chevron-right"></i>
    </div>
  `;

  row.addEventListener("click", () => openClientPanel(client.id));

  return row;
}

function updateOriginActiveButton(clickedButton) {
  if (!originFilters) return;
  originFilters.querySelectorAll(".filter-card").forEach(card => card.classList.remove("active"));
  clickedButton.classList.add("active");
}

function renderClients() {
  const filteredClients = filterClients();

  if (clientsList) clientsList.innerHTML = "";

  renderOriginCounts();
  renderStatusFilters();

  if (filteredClients.length === 0) {
    if (clientsEmpty) clientsEmpty.style.display = "flex";
    return;
  }

  if (clientsEmpty) clientsEmpty.style.display = "none";

  filteredClients.forEach(client => {
    clientsList.appendChild(renderClientTableRow(client));
  });
}

async function loadClientsPage() {
  const data = await getDashboardData();

  pageData = data;

  setClientPanelData({ clientsWithItems: data.clientsWithItems });

  renderClients();
}

if (clientSearch) {
  clientSearch.addEventListener("input", () => renderClients());
}

if (originFilters) {
  originFilters.addEventListener("click", event => {
    const button = event.target.closest("[data-origin]");
    if (!button) return;
    activeOrigin = button.dataset.origin;
    updateOriginActiveButton(button);
    renderClients();
  });
}

if (statusFilters) {
  statusFilters.addEventListener("click", event => {
    const button = event.target.closest("[data-status]");
    if (!button) return;
    activeStatus = button.dataset.status;
    renderClients();
  });
}

if (toggleFiltersButton) {
  toggleFiltersButton.addEventListener("click", () => {
    document.querySelectorAll(".filter-section").forEach(section => {
      section.classList.toggle("hidden");
    });
  });
}

initClientCreateModal({
  onSuccess: async result => {
    await loadClientsPage();
    if (result?.client?.id) openClientPanel(result.client.id);
  }
});

initClientPanel({
  onSuccess: async () => await loadClientsPage()
});

await loadClientsPage();