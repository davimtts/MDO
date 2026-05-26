import { checkAuth } from "../app/auth.js";
import { getSession, logout } from "../services/authService.js";
import { createClientWithItem, getDashboardData } from "../services/clientService.js";
import { ROUTES } from "../utils/constants.js";

await checkAuth();

const session = getSession();

const userName = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");

const modal = document.getElementById("clientModal");
const openModalButton = document.getElementById("openClientModal");
const closeModalButton = document.getElementById("closeClientModal");

const form = document.getElementById("clientForm");
const formMessage = document.getElementById("clientFormMessage");

const recentClientsList = document.getElementById("recentClientsList");
const pendingList = document.getElementById("pendingList");

const newClientsCount = document.getElementById("newClientsCount");
const opportunitiesCount = document.getElementById("opportunitiesCount");
const budgetCount = document.getElementById("budgetCount");
const salesCount = document.getElementById("salesCount");
const pendingCount = document.getElementById("pendingCount");

if (userName && session?.name) {
  userName.textContent = session.name;
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    logout();
    window.location.href = ROUTES.login;
  });
}

openModalButton.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeModalButton.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", event => {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
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
      <strong>${client.client_nome}</strong>
      <span>${item?.item_nome || "Sem item cadastrado"}</span>
      ${item ? `<small class="badge badge-${item.item_status}">${formatStatus(item.item_status)}</small>` : ""}
    </div>

    <div class="client-meta">
      <strong>${formatMoney(item?.item_preco || 0)}</strong>
      <span>${new Date(client.client_data_create).toLocaleDateString("pt-BR")}</span>
    </div>
  `;

  return row;
}

async function renderDashboard() {
  const { clients, items, clientsWithItems } = await getDashboardData();

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

form.addEventListener("submit", async event => {
  event.preventDefault();

  const clientData = {
    client_nome: document.getElementById("clientName").value,
    client_telefone: document.getElementById("clientPhone").value,
    client_origem: document.getElementById("clientOrigin").value,
    client_obs: document.getElementById("clientObs").value
  };

  const itemData = {
    item_nome: document.getElementById("itemName").value,
    item_preco: document.getElementById("itemPrice").value,
    item_status: document.getElementById("itemStatus").value,
    item_temperatura: document.getElementById("itemTemperature").value,
    item_obs: document.getElementById("itemObs").value
  };

  try {
    formMessage.textContent = "Salvando...";

    await createClientWithItem(clientData, itemData);

    form.reset();
    modal.classList.add("hidden");
    formMessage.textContent = "";

    await renderDashboard();

  } catch (error) {
    formMessage.textContent = error.message;
  }
});

await renderDashboard();