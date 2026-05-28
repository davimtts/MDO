import { getSettingsCache } from "../services/settingsService.js";

export function renderStatusOptions(select, selectedValue = "") {
  if (!select) return;

  const { statuses } = getSettingsCache();

  select.innerHTML = "";

  statuses
    .filter(status => status.active)
    .forEach(status => {
      const option = document.createElement("option");

      option.value = status.id;
      option.textContent = status.label;

      if (status.id === selectedValue) {
        option.selected = true;
      }

      select.appendChild(option);
    });
}

export function renderTemperatureOptions(select, selectedValue = "") {
  if (!select) return;

  const { temperatures } = getSettingsCache();

  select.innerHTML = "";

  temperatures
    .filter(temp => temp.active)
    .forEach(temp => {
      const option = document.createElement("option");

      option.value = temp.id;
      option.textContent = temp.label;

      if (temp.id === selectedValue) {
        option.selected = true;
      }

      select.appendChild(option);
    });
}