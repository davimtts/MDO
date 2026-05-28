import { updateClientWithItems } from "../services/clientService.js";
import { showToast } from "./toast.js";

import {
  renderStatusOptions,
  renderTemperatureOptions
} from "./settingsSelects.js";

let cache = {
  clientsWithItems: []
};

export function setClientPanelData(data) {
  cache.clientsWithItems = data.clientsWithItems || [];
}

export function initClientPanel({ onSuccess } = {}) {
  const clientPanel = document.getElementById("clientPanel");
  const closeClientPanel = document.getElementById("closeClientPanel");
  const clientPanelForm = document.getElementById("clientPanelForm");
  const clientInterestsList = document.getElementById("clientInterestsList");
  const addInterestButton = document.getElementById("addInterestButton");
  const clientPanelMessage = document.getElementById("clientPanelMessage");

  if (
    !clientPanel ||
    !closeClientPanel ||
    !clientPanelForm ||
    !clientInterestsList ||
    !addInterestButton
  ) {
    return;
  }

  closeClientPanel.addEventListener("click", closePanel);

  clientPanel.addEventListener("click", event => {
    if (event.target.dataset.closeClientPanel !== undefined) {
      closePanel();
    }
  });

  addInterestButton.addEventListener("click", () => {
    const emptyState = clientInterestsList.querySelector(".empty-interest");

    if (emptyState) {
      clientInterestsList.innerHTML = "";
    }

    clientInterestsList.appendChild(createInterestForm());
  });

  clientPanelForm.addEventListener("submit", async event => {
    event.preventDefault();

    const clientId = document.getElementById("panelClientId").value;

    const clientData = {
      id: clientId,
      client_nome: document.getElementById("panelClientName").value,
      client_telefone: document.getElementById("panelClientPhone").value,
      client_origem: document.getElementById("panelClientOrigin").value,
      client_obs: document.getElementById("panelClientObs").value
    };

    const interestCards = [...clientInterestsList.querySelectorAll(".interest-card")];

    const itemsData = interestCards.map(card => ({
      id: card.querySelector(".interest-id").value,
      item_nome: card.querySelector(".interest-name").value,
      item_preco: card.querySelector(".interest-price").value,
      item_status: card.querySelector(".interest-status").value,
      item_temperatura: card.querySelector(".interest-temperature").value,
      item_obs: card.querySelector(".interest-obs").value
    }));

    try {
      clientPanelMessage.textContent = "Salvando...";

      await updateClientWithItems(clientData, itemsData);

      closePanel();

      showToast("Cliente alterado com sucesso.");

      if (typeof onSuccess === "function") {
        await onSuccess();
      }
    } catch (error) {
      clientPanelMessage.textContent = error.message;
    }
  });
}

export function openClientPanel(clientId) {
  const client = cache.clientsWithItems.find(client => client.id === clientId);

  if (!client) return;

  document.getElementById("panelClientId").value = client.id;
  document.getElementById("panelClientName").value = client.client_nome;
  document.getElementById("panelClientPhone").value = client.client_telefone;
  document.getElementById("panelClientOrigin").value = client.client_origem;
  document.getElementById("panelClientObs").value = client.client_obs || "";

  renderInterests(client.items);

  document.getElementById("clientPanel").classList.remove("hidden");
}

function closePanel() {
  const clientPanel = document.getElementById("clientPanel");
  const clientPanelMessage = document.getElementById("clientPanelMessage");

  clientPanel.classList.add("hidden");
  clientPanelMessage.textContent = "";
}

function renderInterests(items) {
  const clientInterestsList = document.getElementById("clientInterestsList");

  clientInterestsList.innerHTML = "";

  if (!items || items.length === 0) {
    clientInterestsList.innerHTML = `
      <div class="empty-interest">
        Esse cliente ainda não tem interesses cadastrados.
      </div>
    `;
    return;
  }

  items.forEach(item => {
    clientInterestsList.appendChild(createInterestForm(item));
  });
}

function createInterestForm(item = {}) {
  const card = document.createElement("article");

  card.className = "interest-card";

  card.innerHTML = `
    <input type="hidden" class="interest-id" value="${item.id || ""}">

    <h4 class="interest-card__title">
      ${item.id ? "Interesse cadastrado" : "Novo interesse"}
    </h4>

    <div class="field-group">

      <div class="field-input-wrap">
        <span class="field-icon">
          <i class="fa-solid fa-glasses"></i>
        </span>

        <input
          class="field-input interest-name"
          type="text"
          value="${item.item_nome || ""}"
          placeholder="Ex: Óculos de grau"
        >
      </div>
    </div>

    <div class="field-row">

      <div class="field-group">

        <div class="field-input-wrap">
          <span class="field-icon">
            <i class="fa-solid fa-brazilian-real-sign"></i>
          </span>

          <input
            class="field-input interest-price"
            type="number"
            min="0"
            step="0.01"
            value="${item.item_preco || ""}"
            placeholder="0,00"
          >
        </div>
      </div>

      <div class="field-group">

        <div class="field-input-wrap field-input-wrap--select">
          <span class="field-icon">
            <i class="fa-solid fa-fire"></i>
          </span>

          <select class="field-input field-select interest-temperature"></select>

          <span class="field-chevron">
            <i class="fa-solid fa-chevron-down"></i>
          </span>
        </div>
      </div>

    </div>

    <div class="field-group">

      <div class="field-input-wrap field-input-wrap--select">
        <span class="field-icon">
          <i class="fa-solid fa-flag"></i>
        </span>

        <select class="field-input field-select interest-status"></select>

        <span class="field-chevron">
          <i class="fa-solid fa-chevron-down"></i>
        </span>
      </div>
    </div>

    <div class="field-group">

      <textarea
        class="field-textarea interest-obs"
        placeholder="Detalhes adicionais..."
      >${item.item_obs || ""}</textarea>
    </div>
  `;

  const statusSelect = card.querySelector(".interest-status");
  const temperatureSelect = card.querySelector(".interest-temperature");

  renderStatusOptions(statusSelect, item.item_status);
  renderTemperatureOptions(temperatureSelect, item.item_temperatura);

  return card;
}