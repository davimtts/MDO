import { createClientWithOptionalItem } from "../services/clientService.js";
import { showToast } from "./toast.js";

import {
  renderStatusOptions,
  renderTemperatureOptions
} from "./settingsSelects.js";

export function initClientCreateModal({ onSuccess } = {}) {
  const modal = document.getElementById("clientModal");
  const openButton = document.getElementById("openClientModal");
  const closeButton = document.getElementById("closeClientModal");
  const form = document.getElementById("clientForm");
  const message = document.getElementById("clientFormMessage");

  const statusSelect = document.getElementById("itemStatus");
  const temperatureSelect = document.getElementById("itemTemperature");

  if (!modal || !openButton || !closeButton || !form) {
    return;
  }

  renderStatusOptions(statusSelect);
  renderTemperatureOptions(temperatureSelect);

  openButton.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeButton.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", event => {
    if (event.target === modal || event.target.classList.contains("modal__backdrop")) {
      modal.classList.add("hidden");
    }
  });

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
      message.textContent = "Salvando...";

      const result = await createClientWithOptionalItem(clientData, itemData);

      form.reset();
      modal.classList.add("hidden");
      message.textContent = "";

      showToast("Cliente criado com sucesso.");

      if (typeof onSuccess === "function") {
        await onSuccess(result);
      }

      return result;
    } catch (error) {
      message.textContent = error.message;
    }
  });
}