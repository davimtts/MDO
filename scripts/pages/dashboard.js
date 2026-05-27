import { loadSharedLayout } from "../app/loadComponents.js";

await loadSharedLayout();

import { checkAuth } from "../app/auth.js";
import { getSession, logout } from "../services/authService.js";
import { getDashboardData } from "../services/clientService.js";
import { ROUTES } from "../utils/constants.js";

import { initClientCreateModal } from "../ui/clientCreateModal.js";
import {
  initClientPanel,
  openClientPanel,
  setClientPanelData
} from "../ui/clientPanel.js";

await checkAuth();

const session = getSession();

const userName = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");

const recentClientsList = document.getElementById("recentClientsList");
const pendingList = document.getElementById("pendingList");

const newClientsCount = document.getElementById("newClientsCount");
const opportunitiesCount = document.getElementById("opportunitiesCount");
const budgetCount = document.getElementById("budgetCount");
const salesCount = document.getElementById("salesCount");
const pendingCount = document.getElementById("pendingCount");

let dashboardCache = {
  clients: [],
  items: [],
  clientsWithItems: []
};

if (userName && session?.name) {
  userName.textContent = session.name;
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    logout();
    window.location.href = ROUTES.login;
  });
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

function formatMoney(value) {
  const number = Number(value);

  if (!number || number <= 0) {
    return "R$---";
  }

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatShortDate(date) {
  if (!date) return "--/--";

  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  });
}

function formatStatus(status) {
  const labels = {
    so_passou: "Só passou",
    futuramente: "Futuramente",
    analisando_orcamento: "Analisando orçamento",
    aguardando_mensagem: "Aguardando mensagem",
    concluido: "Concluído"
  };

  return labels[status] || status;
}

function renderClientRow(client, item) {
  const row = document.createElement("article");
  row.className = "client-row";

  row.innerHTML = `
    <div class="avatar">${getInitials(client.client_nome)}</div>

    <div class="client-info">
      <strong class="client-info__name">${client.client_nome}</strong>
      <span class="client-info__sub">${item?.item_nome || "Sem item cadastrado"}</span>
      ${item ? `<small class="badge badge-${item.item_status}">${formatStatus(item.item_status)}</small>` : ""}
    </div>

    <div class="client-meta">
      <strong class="client-meta__price">${formatMoney(item?.item_preco || 0)}</strong>
      <span>${formatShortDate(client.client_data_create)}</span>
    </div>
  `;

  row.addEventListener("click", () => {
    openClientPanel(client.id);
  });

  return row;
}

async function renderDashboard() {
  const { clients, items, clientsWithItems } = await getDashboardData();

  dashboardCache = {
    clients,
    items,
    clientsWithItems
  };

  setClientPanelData({
    clientsWithItems
  });

  recentClientsList.innerHTML = "";
  pendingList.innerHTML = "";

  newClientsCount.textContent = clients.length;

  opportunitiesCount.textContent = items.filter(item =>
    item.item_status !== "concluido"
  ).length;

  budgetCount.textContent = items.filter(item =>
    item.item_status === "analisando_orcamento"
  ).length;

  salesCount.textContent = items.filter(item =>
    item.item_status === "concluido"
  ).length;

  const pendingItems = items.filter(item =>
    item.item_status === "aguardando_mensagem"
  );

  pendingCount.textContent = pendingItems.length;

  const recent = clientsWithItems.slice(0, 5);

  if (recent.length === 0) {
    recentClientsList.innerHTML = "<p>Nenhum cliente cadastrado ainda.</p>";
  }

  recent.forEach(client => {
    const mainItem = client.items[0];

    recentClientsList.appendChild(
      renderClientRow(client, mainItem)
    );
  });

  if (pendingItems.length === 0) {
    pendingList.innerHTML = "<p>Nenhum contato pendente.</p>";
  }

  pendingItems.slice(0, 4).forEach(item => {
    const client = clients.find(client => client.id === item.client_id);

    if (!client) return;

    pendingList.appendChild(
      renderClientRow(client, item)
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