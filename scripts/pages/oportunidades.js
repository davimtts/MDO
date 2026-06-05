import { loadSharedLayout } from "../app/loadComponents.js";

await loadSharedLayout();

import { checkAuth } from "../app/auth.js";
import { logout } from "../services/authService.js";
import { getDashboardData } from "../services/clientService.js";
import {
  loadSettings,
  getStatusMap,
  getTemperatureMap
} from "../services/settingsService.js";
import { ROUTES } from "../utils/constants.js";

import {
  formatMoney,
  formatShortDate
} from "../utils/formatters.js";

import { renderStatusBadge } from "../ui/statusBadge.js";
import { applyNavLinks } from "../ui/navLinks.js";
import { setActiveNav } from "../ui/activeNav.js";

import { initClientCreateModal } from "../ui/clientCreateModal.js";
import {
  initClientPanel,
  openClientPanel,
  setClientPanelData
} from "../ui/clientPanel.js";

const user = await checkAuth();
await loadSettings();

applyNavLinks();
setActiveNav();

const logoutButton = document.getElementById("logoutButton");
const logoutButtonDesktop = document.getElementById("logoutButtonDesktop");

const opportunitySearch = document.getElementById("opportunitySearch");
const funnelSummary = document.getElementById("funnelSummary");
const kanbanBoard = document.getElementById("kanbanBoard");

let pageData = {
  clients: [],
  items: [],
  clientsWithItems: []
};

async function handleLogout() {
  await logout();
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

function getClientById(clientId) {
  return pageData.clients.find(client => client.id === clientId);
}

function getOpportunities() {
  return pageData.items
    .map(item => {
      const client = getClientById(item.client_id);

      if (!client) return null;

      return {
        item,
        client
      };
    })
    .filter(Boolean);
}

function filterOpportunities(opportunities) {
  const term = normalizeText(opportunitySearch?.value);

  if (!term) {
    return opportunities;
  }

  return opportunities.filter(({ item, client }) => {
    return (
      normalizeText(client.client_nome).includes(term) ||
      normalizeText(client.client_telefone).includes(term) ||
      normalizeText(item.item_nome).includes(term) ||
      normalizeText(item.item_obs).includes(term)
    );
  });
}

function sortByTemperature(opportunities) {
  const temperatureMap = getTemperatureMap();

  return [...opportunities].sort((a, b) => {
    const priorityA =
      temperatureMap[a.item.item_temperatura]?.priority || 0;

    const priorityB =
      temperatureMap[b.item.item_temperatura]?.priority || 0;

    if (priorityB !== priorityA) {
      return priorityB - priorityA;
    }

    const dateA = new Date(
      a.item.item_data_ult_ctt || a.item.item_data_create
    );

    const dateB = new Date(
      b.item.item_data_ult_ctt || b.item.item_data_create
    );

    return dateB - dateA;
  });
}

function getActiveStatuses() {
  const statusMap = getStatusMap();

  return Object.values(statusMap)
    .filter(status => status.active)
    .sort((a, b) => b.priority - a.priority);
}

function renderFunnelSummary() {
  if (!funnelSummary) return;

  const opportunities = getOpportunities();
  const temperatureMap = getTemperatureMap();

  const maxTempPriority = Math.max(
    ...Object.values(temperatureMap).map(temp => temp.priority || 0),
    0
  );

  const hotTempId = Object.keys(temperatureMap).find(id =>
    temperatureMap[id].priority === maxTempPriority
  );

  const totalValue = opportunities.reduce((acc, { item }) => {
    return acc + (Number(item.item_preco) || 0);
  }, 0);

  const hotCount = hotTempId
    ? opportunities.filter(({ item }) => item.item_temperatura === hotTempId).length
    : 0;

  const waitingCount = opportunities.filter(({ item }) =>
    item.item_status === "aguardando_mensagem"
  ).length;

  const stats = [
    { num: opportunities.length, lbl: "Total" },
    { num: formatMoney(totalValue), lbl: "Potencial" },
    { num: hotCount, lbl: "Quentes" },
    { num: waitingCount, lbl: "Aguardando" }
  ];

  funnelSummary.innerHTML = stats.map(stat => `
    <div class="funnel-stat">
      <div class="funnel-stat__num">${stat.num}</div>
      <div class="funnel-stat__lbl">${stat.lbl}</div>
    </div>
  `).join("");
}

function getTemperatureClass(item) {
  const temperatureMap = getTemperatureMap();
  const temperature = temperatureMap[item.item_temperatura];

  return temperature?.color || "default";
}

function renderOpportunityCard({ item, client }) {
  const temperatureMap = getTemperatureMap();
  const temperature = temperatureMap[item.item_temperatura];

  const price = item.item_preco
    ? formatMoney(item.item_preco)
    : "";

  const date = formatShortDate(
    item.item_data_ult_ctt || item.item_data_create
  );

  const card = document.createElement("article");
  card.className = "opportunity-card";
  card.dataset.temp = getTemperatureClass(item);

  card.innerHTML = `
    <div class="opportunity-card__top">
      <div>
        <strong class="opportunity-card__client">${client.client_nome}</strong>
        <span class="opportunity-card__phone">${client.client_telefone || "Sem telefone"}</span>
      </div>

      ${
        temperature
          ? `<span class="temp-badge badge-${temperature.color || "default"}">${temperature.label}</span>`
          : ""
      }
    </div>

    <div class="opportunity-card__status">
      ${renderStatusBadge(item.item_status)}
    </div>

    <div class="opportunity-card__item">
      ${item.item_nome || "Interesse sem nome"}
    </div>

    <div class="opportunity-card__meta">
      <span class="opportunity-card__price">${price}</span>
      <span class="opportunity-card__date">${date}</span>
    </div>

    ${
      item.item_obs
        ? `<div class="opportunity-card__obs">${item.item_obs}</div>`
        : ""
    }
  `;

  card.addEventListener("click", () => {
    openClientPanel(client.id);
  });

  return card;
}

function renderKanban() {
  if (!kanbanBoard) return;

  const statuses = getActiveStatuses();
  const opportunities = filterOpportunities(getOpportunities());

  kanbanBoard.innerHTML = "";

  statuses.forEach(status => {
    const columnItems = sortByTemperature(
      opportunities.filter(({ item }) =>
        item.item_status === status.id
      )
    );

    if (columnItems.length === 0) {
      return;
    }

    const column = document.createElement("section");
    column.className = "kanban-column";

    column.innerHTML = `
      <div class="kanban-column__header">
        <div>
          <h2 class="kanban-column__title">${status.label}</h2>
          <span class="kanban-column__subtitle">Ordenado por temperatura</span>
        </div>

        <span class="kanban-column__count">${columnItems.length}</span>
      </div>

      <div class="kanban-column__list"></div>
    `;

    const list = column.querySelector(".kanban-column__list");

    columnItems.forEach(opportunity => {
      list.appendChild(
        renderOpportunityCard(opportunity)
      );
    });

    kanbanBoard.appendChild(column);
  });

  if (!kanbanBoard.children.length) {
    kanbanBoard.innerHTML = `
      <div class="kanban-empty">
        Nenhuma oportunidade encontrada
      </div>
    `;
  }
}

function renderPage() {
  renderFunnelSummary();
  renderKanban();
}

async function loadOpportunitiesPage() {
  const data = await getDashboardData();

  pageData = data;

  setClientPanelData({
    clientsWithItems: data.clientsWithItems
  });

  renderPage();
}

if (opportunitySearch) {
  opportunitySearch.addEventListener("input", () => {
    renderPage();
  });
}

initClientCreateModal({
  onSuccess: async result => {
    await loadOpportunitiesPage();

    if (result?.client?.id) {
      openClientPanel(result.client.id);
    }
  }
});

initClientPanel({
  onSuccess: async () => {
    await loadOpportunitiesPage();
  }
});

await loadOpportunitiesPage();