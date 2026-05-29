import { getStatusMap } from "../services/settingsService.js";

export function getStatusLabel(statusId) {
  const statusMap = getStatusMap();

  return statusMap[statusId]?.label || statusId;
}

export function getStatusColor(statusId) {
  const statusMap = getStatusMap();

  return statusMap[statusId]?.color || "default";
}

export function renderStatusBadge(statusId) {
  if (!statusId) return "";

  return `
    <small class="status-badge badge-${getStatusColor(statusId)}">
      ${getStatusLabel(statusId)}
    </small>
  `;
}