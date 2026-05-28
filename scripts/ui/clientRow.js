import {
  getInitials,
  formatMoney,
  formatShortDate
} from "../utils/formatters.js";

import { renderStatusBadge } from "./statusBadge.js";

export function renderClientRow(client, item, { onClick } = {}) {
  const row = document.createElement("article");
  row.className = "client-row";

  row.innerHTML = `
    <div class="avatar">${getInitials(client.client_nome)}</div>

    <div class="client-info">
      <strong class="client-info__name">${client.client_nome}</strong>
      <span class="client-info__sub">${item?.item_nome || "Sem interesse registrado"}</span>
      ${item ? renderStatusBadge(item.item_status) : ""}
    </div>

    <div class="client-meta">
      <strong class="client-meta__price">${formatMoney(item?.item_preco || 0)}</strong>
      <span>${formatShortDate(client.client_data_create)}</span>
    </div>
  `;

  if (typeof onClick === "function") {
    row.addEventListener("click", () => {
      onClick(client, item);
    });
  }

  return row;
}