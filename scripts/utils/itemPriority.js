import { getStatusMap } from "../services/settingsService.js";

export function getHighestPriorityItem(items) {
  if (!items?.length) {
    return null;
  }

  const statusMap = getStatusMap();

  return [...items].sort((a, b) => {
    const priorityA = statusMap[a.item_status]?.priority || 0;
    const priorityB = statusMap[b.item_status]?.priority || 0;

    return priorityB - priorityA;
  })[0];
}